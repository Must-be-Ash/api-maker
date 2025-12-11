  📝 How to Fill Out the Form

  For Both Option A and Option B:

  What would you like to automate?
  Find cheapest flight from %origin% to %destination% departing %departureDate% returning
  %returnDate%

  Starting URL:
  https://www.google.com/travel/flights

  Then click "Start Recording"

  ---
  🎯 Why Provide the Starting URL?

  ✅ Benefits:

  1. Tests the synthetic navigate fix we just implemented (Issue #1)
  2. Consistent starting point - recording always begins at the same page
  3. Cleaner workflow - first action is automatically the navigate
  4. Better UX - Live View opens directly on Google Flights

  What Happens Behind the Scenes:

  // 1. Creates Browserbase session
  // 2. Navigates to https://www.google.com/travel/flights
  // 3. Starts action recorder
  // 4. Live View URL given to you
  // 5. You see Google Flights page already loaded

  Then in the stored skill:
  recordedActions: [
    {
      type: "navigate",
      url: "https://www.google.com/travel/flights",
      timestamp: 1702234567890,  // ✅ No more NaN!
      description: "Navigate to ..."
    },
    // ... your recorded actions follow
  ]

  ---
  🎬 Complete Testing Flow

  Option A: Basic Flight Search (Do this first)

  Step 1: Start Recording
  Goal: Find cheapest flight from %origin% to %destination% departing %departureDate% returning
  %returnDate%
  Starting URL: https://www.google.com/travel/flights
  [Click "Start Recording"]

  Step 2: In Live View (5 steps, ~2 minutes)
  1. ✈️ Type "Vancouver" in origin field
  2. ✈️ Type "LAX" in destination field
  3. 📅 Click departure date, select Dec 17
  4. 📅 Click return date, select Dec 24
  5. 🔍 Click "Search" button
  6. ⏱️ Wait ~5 seconds for results to load
  7. 📜 [Optional] Scroll down slightly to see more results
  8. ✅ Click "Finish Recording"

  What you should see:
  - Multiple flight options with prices
  - Airlines, times, durations visible
  - Do NOT click into any flight

  ---
  Option B: Detailed Flight Info (Do this second)

  Step 1: Start Recording
  Goal: Get detailed flight information from %origin% to %destination% departing %departureDate%
  returning %returnDate%
  Starting URL: https://www.google.com/travel/flights
  [Click "Start Recording"]

  Step 2: In Live View (8 steps, ~3 minutes)
  1. ✈️ Type "Vancouver" in origin
  2. ✈️ Type "LAX" in destination
  3. 📅 Select Dec 17 departure
  4. 📅 Select Dec 24 return
  5. 🔍 Click "Search"
  6. ⏱️ Wait for results
  7. 👆 Click on the first/cheapest flight (new step!)
  8. ⏱️ Wait for detail page to load
  9. 📜 [Optional] Scroll to see baggage/details
  10. ✅ Click "Finish Recording"

  What you should see:
  - Flight detail page with full info
  - Baggage policy, seat map, aircraft type
  - Layover details if applicable

  ---
  🔍 After Recording - What to Check

  In the Response, look for:

  ✅ Good Signs:
  {
    "skillId": "skill_xxx",
    "recordedActions": [
      { "type": "navigate", "url": "https://www.google.com/travel/flights", "timestamp":
  1702234567890 },
      { "type": "type", "value": "%origin%", "selector": "..." },  // ← Not "Vancouver"!
      { "type": "type", "value": "%destination%", "selector": "..." },  // ← Not "LAX"!
      ...
    ],
    "testResult": { "success": true },
    "metrics": { "operations": 6 }  // Should be ~5-8 for Option A
  }

  ❌ Bad Signs (tell me if you see these):
  {
    "recordedActions": [
      { "timestamp": NaN },  // ← Should be fixed!
      { "value": "Vancouver" },  // ← Should be "%origin%"!
      { "value": "L" }, { "value": "A" }, { "value": "X" }  // ← Should be grouped!
    ]
  }

  ---
  📊 What I'll Analyze After

  After you finish both tests, share:

  1. Recording IDs from both attempts
  2. Any errors in the UI or browser console
  3. Test result (success/failure)

  Then I'll query MongoDB:
  // Check what was recorded
  db.skills.find().sort({ createdAt: -1 }).limit(2)

  // Check variable mapping
  db.skills.findOne({ skillId: "..." }).variableMapping

  // Check extraction schema
  db.skills.findOne({ skillId: "..." }).extractionSchema

  // Check recording health
  db.recording_sessions.find({ status: "finished" }).sort({ createdAt: -1 }).limit(2)

  And tell you:
  - ✅ What worked perfectly
  - ⚠️ What needs adjustment
  - 🐛 Any bugs found

  ---
  🚀 Quick Summary

  For BOTH Option A and B:
  - Goal: Find cheapest flight from %origin% to %destination% departing %departureDate% returning 
  %returnDate%
  - Starting URL: https://www.google.com/travel/flights
  - Difference: Option A stops at search results, Option B clicks into a flight