[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765746505021_vuve0q5ol',
  variables: { query: 'whats the price of apple stock' },
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1275µs, render: 11ms)
[executeSkillStep] Executing skill: skill_1765746505021_vuve0q5ol
[executeSkillStep] Loaded skill: {
  name: 'Skill: Search Google for %query% and extract the answer',
  operations: 4
}
[executeSkillStep] Using provided variables directly: { query: 'whats the price of apple stock' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Google for %query% and extract the answer',
  substituted: 'Search Google for whats the price of apple stock and extract the answer'
}
[Schema Generator] Analysis: {
  goal: 'Search Google for whats the price of apple stock and extract the answer',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'currentPrice',
      type: 'string',
      description: "Current stock price of Apple with currency symbol (e.g., '$145.09')"
    },
    {
      name: 'priceChange',
      type: 'string',
      description: "Price change in dollars and percentage (e.g., '+1.23 (0.85%)')",
      optional: true
    },
    {
      name: 'marketCap',
      type: 'string',
      description: 'Market capitalization of Apple',
      optional: true
    },
    {
      name: 'volume',
      type: 'string',
      description: 'Trading volume of Apple stock',
      optional: true
    }
  ],
  instruction: 'Extract the current price, price change, market cap, and volume of Apple stock from the search results.',
  description: 'Extracts stock price information for Apple from Google search results.'
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'currentPrice', 'priceChange', 'marketCap', 'volume' ],
  instruction: 'Extract the current price, price change, market cap, and volume of Apple stock from the search results.'
}
[executeSkillStep] Built Zod schema with 4 fields
[Extraction Schema] {
  fields: [
    {
      name: 'currentPrice',
      type: 'string',
      description: "Current stock price of Apple with currency symbol (e.g., '$145.09')"
    },
    {
      name: 'priceChange',
      type: 'string',
      description: "Price change in dollars and percentage (e.g., '+1.23 (0.85%)')",
      optional: true
    },
    {
      name: 'marketCap',
      type: 'string',
      description: 'Market capitalization of Apple',
      optional: true
    },
    {
      name: 'volume',
      type: 'string',
      description: 'Trading volume of Apple stock',
      optional: true
    }
  ],
  instruction: 'Extract the current price, price change, market cap, and volume of Apple stock from the search results.',
  fieldCount: 4,
  timestamp: '2025-12-14T21:09:53.328Z'
}
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: { query: 'whats the price of apple stock' }
[executeExactReplay] Navigating to start URL: https://www.google.com/
[executeExactReplay] Action: navigate Navigate to https://www.google.com/
[executeExactReplay] Action: click Click Search
[executeExactReplay] Action: type Fill Search
[executeExactReplay] Substituted %query% → whats the price of apple stock
[Variable Substitution] {
  original: '%query%',
  substituted: 'whats the price of apple stock',
  variable: 'query',
  selector: '#APjFqb',
  timestamp: '2025-12-14T21:09:59.706Z'
}
[executeExactReplay] Action: submit Press Enter to submit search
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] URL before submit: https://www.google.com/
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] ✓ Navigation detected: https://www.google.com/search?q=whats+the+price+of+apple+stock&sca_esv=4063a013568e4ff8&source=hp&ei=pSc_ab38PPCB0PEPq8TeiAQ&iflsig=AOw8s4IAAAAAaT81tr1S3gUR-7ucd-WjwFIX05tORnKD&sei=qSc_aaCvHIHv0PEP_cSo8Qo
[executeExactReplay] ✓ Navigation completed after submit
[executeExactReplay] Extracting data with schema...
[executeExactReplay] Extraction result: {
  currentPrice: '278.28 USD',
  priceChange: '+0.25',
  marketCap: '4.11T',
  volume: ''
}
[ResultTracker] ✓ exact_replay succeeded in 10981ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '2b43d77e-c883-467a-8f55-36f99c385e07',
  sessionUrl: 'https://www.browserbase.com/sessions/2b43d77e-c883-467a-8f55-36f99c385e07',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/2b43d77e-c883-467a-8f55-36f99c385e07/devtools/page/23DAD37D12B716AF08817C375F6BC596?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  currentPrice: '278.28 USD',
  priceChange: '+0.25',
  marketCap: '4.11T',
  volume: ''
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1765746590378_gfd833f4i
Skill: Skill: Search Google for %query% and extract the answer
Variables: { query: 'whats the price of apple stock' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (10981ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 10982 ms
Tokens Used: 9020

--- Extraction ---
Data Extracted: YES
Extracted Fields: 4
Non-empty Fields: [ 'currentPrice', 'priceChange', 'marketCap' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/2b43d77e-c883-467a-8f55-36f99c385e07
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/2b43d77e-c883-467a-8f55-36f99c385e07/devtools/page/23DAD37D12B716AF08817C375F6BC596?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1765746590378_gfd833f4i',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 18.0s (compile: 1594µs, render: 18.0s)
 POST /.well-known/workflow/v1/flow 200 in 12ms (compile: 1073µs, render: 11ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765746505021_vuve0q5ol',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1765746505021_vuve0q5ol/execute 200 in 20.1s (compile: 1061ms, render: 19.1s)
