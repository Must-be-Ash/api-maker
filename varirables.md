  How Variable Detection & Substitution Works

  1. Goal Parsing (Regex-based)

  The system extracts all variables from your goal using the pattern /%([a-zA-Z0-9_]+)%/g:

  Goal: "find cheapest flight from %origin% to %destination% departing %departureDate% returning 
  %returnDate%"
  Extracted variables: ["origin", "destination", "departureDate", "returnDate"]

  2. AI-Powered Mapping During Recording

  When you record with demo values, the AI maps your typed values to variables:

  // You type during recording:
  "JFK", "LAX", "2025-12-19", "2025-12-23"

  // AI maps them:
  {
    "JFK": "%origin%",
    "LAX": "%destination%",
    "2025-12-19": "%departureDate%",
    "2025-12-23": "%returnDate%"
  }

  The AI is smart about context (from variable-detector.ts:51-83):
  - Understands "origin/departure/from" → first location
  - Understands "destination/arrival/to" → second location
  - Recognizes dates and maps to date variables
  - Uses order and semantic meaning

  3. Text-Level Substitution During Recording

  Your original fix handles text with variables embedded:

  // If you type in a single field:
  "flights from JFK to LAX on 2025-12-19"

  // After recording, it becomes:
  "flights from %origin% to %destination% on %departureDate%"

  This is done by the regex replacement in finish-recording-step.ts:156-179 that replaces substrings
   within the text.

  4. Multi-Variable Substitution During Execution

  When executing, the system handles both cases (execute-skill-step.ts:293-326):

  Case A: Entire field is one variable
  value: "%origin%"  →  "SFO"

  Case B: Multiple variables in one field
  value: "from %origin% to %destination% on %departureDate%"
  → "from SFO to NYC on 2025-01-15"

  Test: Let's Try a Multi-Variable Example

  The system should handle your flight search perfectly! Here's what would happen:

  During Recording:
  1. You'd navigate to a flight search site (e.g., Google Flights)
  2. Fill in:
    - Origin: "JFK"
    - Destination: "LAX"
    - Depart date: "2025-12-19"
    - Return date: "2025-12-23"

  System Processing:
  ✓ AI detects: { "JFK": "%origin%", "LAX": "%destination%", ... }
  ✓ Actions get placeholders: Fill origin with "%origin%"
  ✓ Saves skill with variable mapping

  During Execution with new values:
  {
    "origin": "SFO",
    "destination": "NYC",
    "departureDate": "2025-01-15",
    "returnDate": "2025-01-20"
  }

  The system would:
  1. Replace %origin% → "SFO"
  2. Replace %destination% → "NYC"
  3. Replace %departureDate% → "2025-01-15"
  4. Replace %returnDate% → "2025-01-20"
  5. Execute the flight search
  6. Extract results (price, flight times, etc.)

  You're Ready! 🚀

  The system is fully built for multi-variable skills. Want to test it with the flight search? Just
  create a skill with:

  Goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning
  %returnDate%
  Start URL: https://www.google.com/travel/flights (or your preferred flight search site)

  The variable detection, substitution, and UI components (SkillTester) will all handle it
  automatically!