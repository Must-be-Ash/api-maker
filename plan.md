 Fix Action Recording: Extension Captures But Retrieval Returns 0

 Problem Statement

 The Browserbase Chrome extension IS successfully capturing user actions (proven by session logs
  showing clicks and inputs), but page.evaluate() returns 0 actions when we try to retrieve
 them. This is a context isolation or navigation reset issue, NOT an injection failure.

 Evidence

 Browserbase Session Logs (Prove Extension Works)

 [Extension] Content script injector running ✅
 [ActionRecorder] Initialized _recordedActions array ✅ (Context ID: 1)
 [ActionRecorder] Extension event listeners attached successfully ✅
 [ActionRecorder] Captured click: ✅ (Context ID: 1) - MULTIPLE
 [ActionRecorder] Captured input: ✅ (Context ID: 1) - MULTIPLE

 Application Logs (Retrieval Fails)

 [finishRecordingStep] Total pages in context: 1
 [finishRecordingStep] Using page: https://www.google.com/search?q=how+old+is+brad+pitt...
 [finishRecordingStep] Retrieved 0 actions from browser ❌

 Key Insight: Debug console.log() calls inside page.evaluate() do NOT appear in application logs
  - they go to the browser DevTools console, not Node.js stdout. This means we have NO
 visibility into what's happening inside the browser when we retrieve actions.

 Root Cause Hypotheses

 Hypothesis 1: Navigation Resets the Array

 Evidence from /extension/monitoring-script.js line 15-17:
 window._recordedActions = window._recordedActions || [];

 This initializes on EVERY page load. When Google Search navigates from google.com to
 google.com/search?q=..., the page reloads and the array is reset:

 1. User loads google.com → Extension creates window._recordedActions = []
 2. User types query → Actions captured: [click, input, input, input, ...]
 3. Form submits, navigates to google.com/search?q=... → NEW PAGE LOAD
 4. Extension re-injects → window._recordedActions = [] (RESET!)
 5. Post-navigation actions accumulate in new array
 6. We retrieve and get either 0 (if no post-navigation actions) or only post-navigation actions
  (losing pre-navigation)

 Hypothesis 2: Timing - Extension Hasn't Re-Injected Yet

 When finish-recording-step reconnects to the Browserbase session:
 1. New Stagehand instance created
 2. page.evaluate() called immediately
 3. But extension may not have re-injected yet after navigation
 4. window._recordedActions is undefined or hasn't been populated

 Hypothesis 3: Frame/Context Isolation

 The extension injects via content script which creates a <script> tag. If:
 - The extension runs in an iframe context
 - Or there's a cross-origin isolation issue
 - Then page.evaluate() may be reading from a different context than where actions are stored

 Solution: Two-Phase Approach

 Phase 1: Add Diagnostics + Retry Logic (Quick Fix)

 Goal: Get visibility and handle timing issues

 Phase 2: Persist Across Navigation (Permanent Fix)

 Goal: Prevent array reset on navigation

 ---
 Implementation Plan

 File 1: /workflows/steps/finish-recording-step.ts

 Change 1: Add Console Listener for Visibility

 Add at the top of the function (before any page.evaluate() calls):

 // Set up console listener to capture browser logs
 page.on('console', (message) => {
   const text = message.text();
   if (text.includes('[finishRecordingStep EVAL]') || text.includes('_recordedActions')) {
     console.log(`[BROWSER CONSOLE] ${text}`);
   }
 });

 Why: This captures console output from inside page.evaluate() so we can see what's actually
 happening in the browser.

 Change 2: Add Retry Logic with Delays

 Replace the current retrieval code (around lines 279-287 and 446-454) with:

 async function retrieveActionsWithRetry(page: Page, maxRetries = 10, delayMs = 500) {
   for (let attempt = 1; attempt <= maxRetries; attempt++) {
     const actions = await page.evaluate(() => {
       console.log('[finishRecordingStep EVAL] Attempt', attempt);
       console.log('[finishRecordingStep EVAL] _recordedActions exists:', typeof (window as
 any)._recordedActions);
       console.log('[finishRecordingStep EVAL] _recordedActions length:', (window as
 any)._recordedActions?.length);

       const actions = (window as any)._recordedActions || [];
       (window as any)._recordedActions = []; // Clear after retrieval
       return actions;
     });

     if (actions.length > 0) {
       console.log(`[finishRecordingStep] ✅ Retrieved ${actions.length} actions on attempt 
 ${attempt}`);
       return actions;
     }

     if (attempt < maxRetries) {
       console.log(`[finishRecordingStep] ⏱️ No actions yet, waiting ${delayMs}ms... (attempt 
 ${attempt}/${maxRetries})`);
       await new Promise(resolve => setTimeout(resolve, delayMs));
     }
   }

   console.warn('[finishRecordingStep] ⚠️ No actions found after', maxRetries, 'attempts');
   return [];
 }

 // Use it:
 const pageActions = await retrieveActionsWithRetry(page);
 console.log('[finishRecordingStep] Retrieved', pageActions.length, 'actions from browser');

 Why:
 - Retries handle timing issues (extension hasn't re-injected yet)
 - Console logs inside evaluate() will now appear in app logs via our listener
 - We'll see exactly what _recordedActions contains at each attempt

 Change 3: Update Both Code Paths

 Apply the console listener and retry logic to:
 1. Line ~279: When activeRecorder exists
 2. Line ~446: In the production fallback (reconnection path)

 ---
 File 2: /extension/monitoring-script.js (Phase 2 - If Needed)

 Change: Use sessionStorage to Persist Across Navigation

 Replace line 15-17:

 // OLD:
 window._recordedActions = window._recordedActions || [];

 NEW:
 // Load existing actions from sessionStorage (survives navigation)
 const existingActions = JSON.parse(sessionStorage.getItem('_recordedActions') || '[]');
 window._recordedActions = existingActions;

 console.log('[ActionRecorder] Initialized _recordedActions array with', existingActions.length,
  'existing actions');

 Update action capture code (around lines 861, 882, 901) to persist:

 // After every push:
 window._recordedActions.push(action);
 sessionStorage.setItem('_recordedActions', JSON.stringify(window._recordedActions));

 Why: sessionStorage persists across same-tab navigations but is cleared when tab closes. This
 is perfect for our use case.

 ---
 Testing Plan

 Step 1: Test Phase 1 Changes (Diagnostic)

 1. Deploy changes to finish-recording-step.ts (console listener + retry logic)
 2. Create a new skill recording with Google Search
 3. Check logs for:
 [BROWSER CONSOLE] [finishRecordingStep EVAL] _recordedActions exists: object
 [BROWSER CONSOLE] [finishRecordingStep EVAL] _recordedActions length: 15
 [finishRecordingStep] ✅ Retrieved 15 actions on attempt 1

 If we see length > 0: The issue was timing - retry logic fixed it ✅

 If we still see length = 0: Navigation reset is confirmed - need Phase 2 ❌

 Step 2: Test Phase 2 Changes (If Needed)

 1. Update extension/monitoring-script.js with sessionStorage
 2. Rebuild extension zip:
 cd extension
 zip -r ../action-recorder-extension.zip . -x "*.backup" -x "*.broken"
 3. Upload new extension:
 npx tsx scripts/upload-extension.ts
 4. Restart dev server to load new extension ID
 5. Test Google Search recording again
 6. Check logs for:
 [ActionRecorder] Initialized _recordedActions array with 8 existing actions
 [finishRecordingStep] Retrieved 15 actions from browser

 Expected: Actions captured before AND after navigation are both preserved ✅

 ---
 Expected Behavior After Fix

 Before Fix

 [finishRecordingStep] Retrieved 0 actions from browser ❌
 [finishRecordingStep] workflowSteps: 1 (only navigation)

 After Phase 1 (If Timing Issue)

 [BROWSER CONSOLE] [finishRecordingStep EVAL] _recordedActions exists: object
 [BROWSER CONSOLE] [finishRecordingStep EVAL] _recordedActions length: 0
 [finishRecordingStep] ⏱️ No actions yet, waiting 500ms... (attempt 1/10)
 [BROWSER CONSOLE] [finishRecordingStep EVAL] _recordedActions length: 15
 [finishRecordingStep] ✅ Retrieved 15 actions on attempt 3
 [finishRecordingStep] workflowSteps: 4 ✅

 After Phase 2 (If Navigation Reset)

 [ActionRecorder] Initialized _recordedActions array with 8 existing actions
 [finishRecordingStep] Retrieved 15 actions from browser ✅
 [finishRecordingStep] Extracted semantic values: [{ value: "brad pitt age", type: "text-input" 
 }] ✅
 [finishRecordingStep] workflowSteps: 4 ✅

 ---
 Files to Modify

 Phase 1 (Diagnostic + Quick Fix)

 1. /Users/ashnouruzi/api-maker/workflows/steps/finish-recording-step.ts
   - Add console listener (1 line)
   - Add retrieveActionsWithRetry() function (~30 lines)
   - Replace 2 retrieval call sites

 Phase 2 (If Needed - Permanent Fix)

 2. /Users/ashnouruzi/api-maker/extension/monitoring-script.js
   - Update initialization to load from sessionStorage (lines 15-17)
   - Update 3 action push locations to persist to sessionStorage
 3. Extension rebuild + upload (via scripts)

 ---
 Alternative Considered: Use Stagehand's context.addInitScript()

 Instead of Browserbase extension, inject directly via Stagehand API:

 await stagehand.context.addInitScript(() => {
   window._recordedActions = JSON.parse(sessionStorage.getItem('_recordedActions') || '[]');
   // ... all 900 lines of event listener code ...
   sessionStorage.setItem('_recordedActions', JSON.stringify(window._recordedActions));
 });

 Pros:
 - Full control, no extension complexity
 - Guaranteed to persist across navigation (Stagehand handles this)
 - No upload/rebuild cycle

 Cons:
 - Requires inlining 900+ lines of monitoring code into workflow
 - Harder to maintain/debug

 Decision: Defer to Phase 3 if Phase 1 + 2 don't work.

 ---
 Success Criteria

 - ✅ Actions captured BEFORE navigation are preserved
 - ✅ Actions captured AFTER navigation are included
 - ✅ Variables detected from user input (e.g., "brad pitt age")
 - ✅ Skill created with 3-4 workflow steps (not just 1 navigation)
 - ✅ Logs show actual browser state via console listener