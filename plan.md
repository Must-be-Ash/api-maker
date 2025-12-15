 Fix Action Recording in Production: addInitScript Context Lost on Reconnection

 Summary

 Root Cause: When finish-recording reconnects to the Browserbase session in a new serverless
 function, it creates a NEW Stagehand instance. The addInitScript() context from the original
 instance is lost, so window._recordedActions doesn't exist.

 Solution: Persist actions to localStorage in the browser as they're captured. On reconnection,
 retrieve from localStorage instead of window._recordedActions.

 Files to Modify:
 1. /lib/capture/action-recorder.ts - Add localStorage persistence
 2. /workflows/steps/finish-recording-step.ts - Retrieve from localStorage
 3. /workflows/steps/start-recording-step.ts - Clear localStorage on start

 Estimated Time: 45 minutes (20 min implementation, 25 min testing)

 ---
 Problem Statement

 Local works perfectly: ActionRecorder polling retrieves actions every 2s, 23 raw actions → 4
 semantic actions ✅

 Production fails: page.evaluate() returns 0 actions when reconnecting to Browserbase session ❌

 This is a Stagehand reconnection context loss issue in Vercel serverless, NOT an injection or
 navigation problem.

 Evidence from Logs

 Local (Works) - log-local.md

 Line 77-79: [ActionRecorder] Retrieved 1 actions from page
             [ActionRecorder] Retrieved 10 actions from page
             [ActionRecorder] Retrieved 10 actions from page

 Line 95:    [finishRecordingStep] Loaded recording session: { actionsCount: 23 }
 Line 96-97: [ActionRecorder] Performing final action retrieval from browser...
             [ActionRecorder] No additional actions found in browser

 Line 98-99: [ActionRecorder] Grouping 23 raw actions...
             [ActionRecorder] Grouped into 4 semantic actions

 Why it works: setInterval polling runs continuously in the same Node process, retrieves actions
  from browser repeatedly before serverless freezes.

 Production (Fails) - log-prod.md

 Line 211-218: [ActionRecorder] Starting recording
               [ActionRecorder] Installing monitoring script (attempt 1/3)...
               [ActionRecorder] ✅ Monitoring script installed successfully
               [ActionRecorder] ✅ Started recording with persistent event listeners

 Line 72-73:   [finishRecordingStep] Retrieving actions from browser (serverless polling did not
  run)
               [finishRecordingStep] Retrieved 0 actions from browser  ❌

 Line 129-130: [finishRecordingStep] Loaded recording session: { actionsCount: 0 }
               [finishRecordingStep] Active recorder not found in global (serverless mode)

 Why it fails:
 1. start-recording runs in serverless function A → installs monitoring script → function
 freezes (polling never runs)
 2. User performs actions → monitoring script captures them to window._recordedActions
 3. finish-recording runs in serverless function B → reconnects to session with NEW Stagehand
 instance
 4. The init script context is NOT preserved across reconnections
 5. window._recordedActions is undefined or empty → retrieval gets 0 actions

 Root Cause Analysis

 The Core Issue: addInitScript Context Loss

 From /lib/capture/action-recorder.ts line 946:
 // Install monitoring script via Stagehand's context.addInitScript()
 await this.context.addInitScript(this.getMonitoringScriptFunction());

 What happens:

 In Local Development (Single Node Process):
 1. start-recording calls addInitScript() on Stagehand instance
 2. Monitoring script injects, event listeners capture actions to window._recordedActions
 3. Polling (setInterval) runs every 2s, retrieves actions, saves to MongoDB
 4. stop-recording calls final retrieval → gets remaining actions
 5. ✅ Works perfectly

 In Production (Serverless - Different Functions):
 1. Function A (start-recording):
   - Creates Stagehand instance, calls addInitScript()
   - Monitoring script injects successfully
   - Function returns → container freezes
   - Polling never runs (setInterval cleared)
 2. User performs actions:
   - Browser captures actions to window._recordedActions
   - BUT actions never polled/saved to MongoDB
 3. Function B (finish-recording - DIFFERENT container):
   - Creates NEW Stagehand instance via reconnection:
   const stagehand = new Stagehand({
   browserbaseSessionID: input.sessionId  // Reconnect
 });
   - CRITICAL: The new instance does NOT have the init script context
   - The init script was bound to the FIRST instance, not the session
   - page.evaluate() returns empty because:
       - Script context was lost on reconnection, OR
     - Actions were already cleared by previous polling (but polling never ran)

 The Architectural Assumption That Failed:

 Assumed: addInitScript() makes the monitoring script "stick" with the Browserbase session,
 persisting across reconnections.

 Reality: addInitScript() is bound to the Playwright/Stagehand context instance, not the
 Browserbase session itself. When you reconnect via browserbaseSessionID, you get a fresh CDP
 connection with a fresh context.

 Solution Options Analysis

 Since addInitScript() context is lost when reconnecting to the Browserbase session in
 production, we have four possible approaches:

 Option 1: Re-inject Monitoring Script on Reconnection (RECOMMENDED)

 Approach: In finish-recording-step.ts, after reconnecting to the session, re-call
 addInitScript() with the monitoring script BEFORE attempting retrieval.

 Pros:
 - Minimal code changes (reuse existing ActionRecorder monitoring script)
 - No persistence layer needed
 - Works with existing ActionRecorder architecture

 Cons:
 - CRITICAL ISSUE: Re-injecting AFTER user actions means we'll miss already-captured actions
 - The monitoring script needs to already be capturing while user performs actions
 - This only works if actions are persisted somewhere the new script can access them

 Verdict: ❌ Won't work - we need the script running DURING user actions, not after

 Option 2: Browser-Side Persistence (localStorage/sessionStorage)

 Approach: Modify monitoring script to persist actions to localStorage or sessionStorage as
 they're captured. On reconnection, either:
 - Re-inject script which loads from storage, OR
 - Directly retrieve from storage via page.evaluate()

 Pros:
 - Actions survive script context loss
 - No server-side infrastructure needed
 - Works across navigation events

 Cons:
 - Requires modifying monitoring script
 - Requires rebuilding/uploading Browserbase extension (if using extension)
 - sessionStorage cleared on tab close (but that's fine for our use case)

 Implementation:
 // In monitoring script - on action capture:
 window._recordedActions.push(action);
 localStorage.setItem('_recordedActions', JSON.stringify(window._recordedActions));

 // In finish-recording-step.ts - on retrieval:
 const actions = await page.evaluate(() => {
   return JSON.parse(localStorage.getItem('_recordedActions') || '[]');
 });

 Verdict: ✅ RECOMMENDED - Simple, reliable, survives context loss

 Option 3: Real-Time MongoDB Persistence

 Approach: Modify monitoring script to POST captured actions to a MongoDB API endpoint in
 real-time as they occur.

 Pros:
 - Actions immediately persisted to database
 - No browser storage limits
 - Works even if browser crashes

 Cons:
 - Requires CORS-enabled API endpoint
 - Network overhead on every action
 - More complex implementation
 - Need to handle authentication/authorization for POST endpoint

 Verdict: ❌ Overkill - too complex for this use case

 Option 4: Use Browserbase Native Recording

 Approach: Use Browserbase's built-in session recording API instead of custom action tracking.

 Pros:
 - Professionally maintained
 - No custom script injection needed
 - Works across reconnections

 Cons:
 - Unknown if it captures semantic actions (clicks, inputs, navigation)
 - May only provide video/screenshots
 - Would require complete rewrite of action extraction logic

 Verdict: ⏸️ Worth investigating but likely not suitable for our semantic action needs

 ---
 Recommended Solution: Browser-Side localStorage Persistence

 Why: Simplest solution that directly addresses the root cause. Actions persist in browser
 storage, survive script context loss, and can be retrieved even after Stagehand reconnection.

 ---
 Implementation Plan

 File 1: /lib/capture/action-recorder.ts

 Change 1: Add localStorage Persistence to Monitoring Script

 Locate the getMonitoringScriptFunction() method (around line 50-900) and update the
 initialization section:

 Find (around line 15-17 of the monitoring script):
 window._recordedActions = window._recordedActions || [];

 Replace with:
 // Load existing actions from localStorage (survives script context loss)
 const persistedActions = JSON.parse(localStorage.getItem('_recordedActions_' + recordingId) ||
 '[]');
 window._recordedActions = persistedActions;
 console.log('[ActionRecorder] Initialized with', persistedActions.length, 'persisted actions');

 Note: Use recordingId in the localStorage key to prevent conflicts between multiple recordings.

 Change 2: Persist on Every Action Capture

 Find the three locations where actions are pushed to window._recordedActions:
 - Line ~861: Click events
 - Line ~882: Input events
 - Line ~901: Navigation events

 After each window._recordedActions.push(action), add:
 localStorage.setItem('_recordedActions_' + recordingId,
 JSON.stringify(window._recordedActions));

 Change 3: Pass recordingId to Monitoring Script

 Modify getMonitoringScriptFunction() to be parameterized with recordingId.

 Option A (Simpler): Modify the function to use this.recordingId directly within the function
 body:

 In getMonitoringScriptFunction() at line 30-31, change it to return a string instead of a
 function:

 private getMonitoringScriptFunction() {
   const recordingId = this.recordingId;
   return function() {
     // Now 'recordingId' is available in the closure
     const persistedActions = JSON.parse(localStorage.getItem('_recordedActions_' + recordingId)
  || '[]');
     // ... rest of monitoring script
   };
 }

 Option B (More explicit): Convert to string and inject recordingId:

 In installMonitoringScript() at line 946, replace:
 await this.context.addInitScript(this.getMonitoringScriptFunction());

 With:
 const recordingId = this.recordingId;
 await this.context.addInitScript(() => {
   const recId = recordingId; // Capture in closure
   // ... paste full monitoring script with recId variable available
 });

 Recommended: Use Option A - modify getMonitoringScriptFunction() to capture this.recordingId in
  the closure, making it available to the returned function.

 File 2: /workflows/steps/finish-recording-step.ts

 Change 1: Update Production Fallback to Read from localStorage

 Locate the production fallback code (around lines 386-412).

 Find (around line 406-412):
 const pageActions = await page.evaluate(() => {
   const actions = (window as any)._recordedActions || [];
   (window as any)._recordedActions = [];
   return actions;
 });

 Replace with:
 // PRODUCTION FIX: Retrieve from localStorage (survives Stagehand reconnection)
 const pageActions = await page.evaluate((recId: string) => {
   const storageKey = '_recordedActions_' + recId;
   const actions = JSON.parse(localStorage.getItem(storageKey) || '[]');

   console.log('[finishRecordingStep] Retrieved', actions.length, 'actions from localStorage');

   // Clear after retrieval
   localStorage.removeItem(storageKey);

   return actions;
 }, recordingId);

 console.log('[finishRecordingStep] Retrieved', pageActions.length, 'actions from browser');

 Change 2: Apply Same Fix to Local Path (for consistency)

 Find the local path retrieval (around line 279-287) and apply the same localStorage-based
 retrieval:

 const pageActions = await page.evaluate((recId: string) => {
   const storageKey = '_recordedActions_' + recId;
   const actions = JSON.parse(localStorage.getItem(storageKey) || '[]');
   localStorage.removeItem(storageKey);
   return actions;
 }, recordingId);

 This ensures both paths work identically.

 File 3: /workflows/steps/start-recording-step.ts

 Change: Clear Previous localStorage on Start

 Add cleanup after navigation but before starting recorder (between lines 106-113):

 Add after line 106 (after console.log('[startRecordingStep] Navigated to start URL:', 
 input.startUrl);):

 // Clear any previous recording data from localStorage (prevents stale data from old sessions)
 await page.evaluate((recId: string) => {
   const storageKey = '_recordedActions_' + recId;
   localStorage.removeItem(storageKey);
   console.log('[startRecordingStep] Cleared previous recording data');
 }, recordingId);

 Note: This ensures a clean slate before ActionRecorder starts capturing new actions.

 ---
 Testing Plan

 Step 1: Local Testing

 1. Make all changes above
 2. Run local development server
 3. Create a new skill recording with Google Search
 4. Perform actions (search for "brad pitt age")
 5. Check terminal logs for:
 [ActionRecorder] Initialized with 0 persisted actions
 [finishRecordingStep] Retrieved 23 actions from localStorage
 [ActionRecorder] Grouping 23 raw actions...
 [ActionRecorder] Grouped into 4 semantic actions

 Expected: Should work exactly as before, but using localStorage instead of
 window._recordedActions

 Step 2: Production Testing

 1. Deploy to Vercel
 2. Create a new skill recording with Google Search
 3. Perform actions (search for "brad pitt age")
 4. Check Vercel logs for:
 [ActionRecorder] Initialized with 0 persisted actions
 [finishRecordingStep] Retrieved 15 actions from localStorage
 [finishRecordingStep] Extracted semantic values: [{ value: "brad pitt age", type: "text-input"
 }]
 [finishRecordingStep] workflowSteps: 4

 Expected: Actions persist across serverless function boundary ✅

 ---
 Expected Behavior After Fix

 Before Fix (Production)

 [ActionRecorder] ✅ Started recording with persistent event listeners
 [finishRecordingStep] Retrieved 0 actions from browser ❌
 [finishRecordingStep] workflowSteps: 1 (only navigation)

 After Fix (Production)

 [ActionRecorder] Initialized with 0 persisted actions
 [ActionRecorder] ✅ Started recording with persistent event listeners
 [finishRecordingStep] Retrieved 15 actions from localStorage ✅
 [finishRecordingStep] Extracted semantic values: [{ value: "brad pitt age", type: "text-input"
 }]
 [finishRecordingStep] workflowSteps: 4

 ---
 Files to Modify

 1. /Users/ashnouruzi/api-maker/lib/capture/action-recorder.ts
   - Add localStorage persistence to monitoring script initialization
   - Persist actions on every capture (3 locations)
   - Pass recordingId to monitoring script via eval wrapper
 2. /Users/ashnouruzi/api-maker/workflows/steps/finish-recording-step.ts
   - Update production fallback to retrieve from localStorage
   - Update local path to use localStorage (for consistency)
 3. /Users/ashnouruzi/api-maker/workflows/steps/start-recording-step.ts
   - Clear previous localStorage data on recording start

 ---
 Success Criteria

 - ✅ Actions persist across Stagehand reconnection in production
 - ✅ Actions captured BEFORE navigation are preserved
 - ✅ Actions captured AFTER navigation are included
 - ✅ Variables detected from user input (e.g., "brad pitt age")
 - ✅ Skill created with 3-4 workflow steps (not just 1 navigation)
 - ✅ Production logs show: "Retrieved X actions from localStorage" (X > 0)

 ---
 Risk Analysis

 Low Risk: This change only affects the storage mechanism, not the action capture logic. The
 monitoring script's event listeners remain unchanged. If localStorage fails for any reason, it
 will simply return an empty array (same as current behavior).

 Rollback Plan: If this doesn't work, revert changes and investigate Option 4 (Browserbase
 native recording API).