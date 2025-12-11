  Test Plan: Record & Execute Flight Search Skill

  This will validate ALL the key features from your implementation plan:

  ---
  📋 Step-by-Step Test

  Step 1: Record the Skill (Demo Values)

  # Start recording
  curl -X POST http://localhost:3000/api/skills/record \
    -H "Content-Type: application/json" \
    -d '{
      "goal": "Find cheapest round-trip flight from %origin% to %destination% departing 
  %departureDate% returning %returnDate%",
      "startUrl": "https://www.google.com/travel/flights"
    }'

  Expected Response:
  {
    "recordingId": "rec_xxx",
    "sessionId": "xxx",
    "liveViewUrl": "https://www.browserbase.com/sessions/xxx",
    "status": "recording"
  }

  What to Do in Live View:
  1. Open the liveViewUrl in your browser
  2. Type "Vancouver" in origin field
  3. Type "LAX" in destination field
  4. Select departure date (e.g., Dec 17)
  5. Select return date (e.g., Dec 24)
  6. Click "Search"
  7. Wait for results to load
  8. Click "Finish Recording" (or call the finish endpoint)

  ---
  Step 2: Finish Recording

  curl -X POST http://localhost:3000/api/skills/rec_xxx/finish

  What to Verify in Response:
  {
    "skillId": "skill_xxx",
    "recordedActions": [
      // ✅ Should see grouped actions like:
      { "type": "navigate", "url": "..." },
      { "type": "type", "value": "%origin%", "selector": "#origin" },  // ← Not "Vancouver"!
      { "type": "type", "value": "%destination%", "selector": "#dest" }, // ← Not "LAX"!
      ...
    ],
    "testResult": { "success": true }
  }

  Key Things to Check:
  - ✅ Action Grouping: "Vancouver" typed as ONE action (not 9 keystrokes)
  - ✅ Variable Mapping: Demo values replaced with %origin%, %destination%
  - ✅ Initial Navigate: First action is "navigate to Google Flights"
  - ✅ Test Result: testResult.success: true (validation passed)

  ---
  Step 3: Execute with DIFFERENT Values

  # Execute with Toronto → New York (different from demo!)
  curl -X POST http://localhost:3000/api/skills/skill_xxx/execute \
    -H "Content-Type: application/json" \
    -d '{
      "variables": {
        "origin": "Toronto",
        "destination": "New York",
        "departureDate": "2025-12-20",
        "returnDate": "2025-12-27"
      }
    }'

  Expected Response:
  {
    "success": true,
    "strategy": "exact_replay",  // ← Should be Strategy 1 (fast!)
    "executionTime": 2500,  // ← Should be ~2-5 seconds
    "data": {
      "extraction": {
        "price": "$450",
        "airline": "Air Canada",
        "route": "Toronto (YYZ) → New York (JFK)"  // ← Should match input!
      }
    },
    "sessionUrl": "https://www.browserbase.com/sessions/xxx",  // ✅ Now stored!
    "validation": {
      "valid": true,  // ← Should validate Toronto/New York in route
      "errors": []
    }
  }

  Key Things to Verify:
  - ✅ Variable Substitution: Used "Toronto" and "New York" (not demo values)
  - ✅ Fast Execution: Strategy 1 succeeded (~2-5 sec, no LLM cost)
  - ✅ Structured Extraction: JSON with price, airline, route fields
  - ✅ Result Validation: Route contains "Toronto" and "New York"
  - ✅ Session URLs: sessionUrl and debugUrl present

  ---
  🔍 What This Test Validates

  | Feature               | What to Check                            | Expected Result
              |
  |-----------------------|------------------------------------------|------------------------------
  ------------|
  | Action Grouping       | Keystrokes grouped into semantic actions | ✅ "Vancouver" = 1 action
  (not 9)         |
  | Variable Detection    | Demo values mapped to variables          | ✅ "Vancouver" → "%origin%"
               |
  | Schema Generation     | Extraction schema created from goal      | ✅ Has price, airline, route
  fields       |
  | Variable Substitution | Different values work                    | ✅ Toronto/New York
  substituted correctly |
  | Result Validation     | Validates results match input            | ✅ Route contains Toronto →
  New York      |
  | Timestamp Fix         | No NaN timestamps                        | ✅ All timestamps are valid
  numbers       |
  | Session URLs          | URLs stored in analytics                 | ✅ sessionUrl/debugUrl in
  response        |
  | Heartbeat             | Recording stays alive                    | ✅ lastHeartbeat updated in
  DB            |

  ---
  🐛 If Issues Found

  Scenario A: Variable Detection Doesn't Work

  Symptom: recordedActions still show "Vancouver" not "%origin%"

  Check:
  # Look at MongoDB
  db.skills.findOne({ skillId: "skill_xxx" })
  # Check: recordedActions[1].value should be "%origin%" not "Vancouver"

  Cause: Variable detector might not be matching demo values to goal variables
  File to Check: lib/capture/variable-detector.ts

  ---
  Scenario B: Extraction Schema Not Generated

  Symptom: No extractionSchema in skill or no structured extraction

  Check:
  db.skills.findOne({ skillId: "skill_xxx" }).extractionSchema
  // Should have: { fields: [ {name: "price", ...}, {name: "airline", ...} ] }

  Cause: Schema generator might not be parsing goal correctly
  File to Check: lib/extraction/schema-generator.ts

  ---
  Scenario C: Validation Fails

  Symptom: validation.valid: false even though results are correct

  Check Console Logs:
  # In terminal running dev server, look for:
  [Validation] { extraction: {...}, variables: {...}, valid: false, errors: [...] }

  Cause: Validation logic might be too strict (e.g., exact match vs contains)
  File to Check: workflows/steps/execute-skill-step.ts:523-588

  ---
  Scenario D: Strategy 1 Fails, Falls to Strategy 2

  Symptom: strategy: "natural_language" instead of "exact_replay"

  This is OK! It means:
  - ✅ Triple replay working correctly
  - ⚠️ Google Flights UI might have changed
  - Strategy 2 should still work (just slower)

  Action: Check if extraction still succeeds. If yes, system is working as designed.

  ---
  📊 Success Criteria

  After this test, you should have:

  ✅ Working Recording Flow:
  - User demonstrates task with demo values
  - Actions grouped intelligently
  - Variables detected and mapped

  ✅ Working Execution Flow:
  - Different values work (not just demo values)
  - Fast execution with Strategy 1
  - Structured extraction with schema
  - Results validated against inputs

  ✅ Working Infrastructure:
  - No NaN timestamps
  - Session URLs stored
  - Heartbeat monitoring active
  - Clean TypeScript compilation

  ---
  🚀 What to Do Right Now

  Option A: Full Manual Test (Recommended - 10 minutes)
  1. Start your dev server: pnpm dev
  2. Run Step 1 (start recording)
  3. Perform actions in Live View
  4. Run Step 2 (finish recording)
  5. Run Step 3 (execute with different values)
  6. Verify all ✅ checkpoints above

  Option B: Quick Verification (5 minutes)
  Just run the curl commands and check responses - no need to actually demonstrate if you have an
  existing skill in the database

  Option C: Create Test Script (I can write this)
  Automated test that validates the entire flow programmatically

  Which would you like to do?