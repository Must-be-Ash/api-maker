[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765611450587_kfq953loo',
  variables: { query: 'how old is brad pitt?' }
}
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 1345µs, render: 13ms)
[executeSkillStep] Executing skill: skill_1765611450587_kfq953loo
[executeSkillStep] Loaded skill: {
  name: 'Skill: Search Google for %query% and extract the stock pr',
  operations: 4
}
[executeSkillStep] Using provided variables directly: { query: 'how old is brad pitt?' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Google for %query% and extract the stock price',
  substituted: 'Search Google for how old is brad pitt? and extract the stock price'
}
[Schema Generator] Analysis: {
  goal: 'Search Google for how old is brad pitt? and extract the stock price',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main answer or result text extracted from the page'
    },
    {
      name: 'stockPrice',
      type: 'string',
      description: 'Current stock price with currency symbol',
      optional: true
    },
    {
      name: 'source',
      type: 'string',
      description: 'Source or title of where the result came from',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the page with the result',
      optional: true
    }
  ],
  instruction: "Extract the main answer about Brad Pitt's age and the stock price if available.",
  description: "Extracts the main search result about Brad Pitt's age and any available stock price from the page."
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'result', 'stockPrice', 'source', 'url' ],
  instruction: "Extract the main answer about Brad Pitt's age and the stock price if available."
}
[executeSkillStep] Built Zod schema with 4 fields
[Extraction Schema] {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main answer or result text extracted from the page'
    },
    {
      name: 'stockPrice',
      type: 'string',
      description: 'Current stock price with currency symbol',
      optional: true
    },
    {
      name: 'source',
      type: 'string',
      description: 'Source or title of where the result came from',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the page with the result',
      optional: true
    }
  ],
  instruction: "Extract the main answer about Brad Pitt's age and the stock price if available.",
  fieldCount: 4,
  timestamp: '2025-12-13T07:45:47.505Z'
}
[2025-12-12 23:45:47.507 -0800] INFO: Using Browserbase credentials
    category: "init"
[2025-12-12 23:45:47.507 -0800] INFO: Starting browserbase session
    category: "init"
[2025-12-12 23:45:47.507 -0800] INFO: Creating new browserbase session...
    category: "init"
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: { query: 'how old is brad pitt?' }
[executeExactReplay] Navigating to start URL: https://www.google.com/
[2025-12-12 23:45:50.114 -0800] INFO: Browserbase session started
    category: "init"
    sessionUrl: "https://www.browserbase.com/sessions/21307988-1c66-403c-a8d1-5564f340e942"
    debugUrl: "https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/21307988-1c66-403c-a8d1-5564f340e942/devtools/page/148C2C99563F5918552E1925FAC634EC?debug=true"
    sessionId: "21307988-1c66-403c-a8d1-5564f340e942"
[2025-12-12 23:45:50.423 -0800] INFO: Connecting to local browser
    category: "init"
[executeExactReplay] Action: navigate Navigate to https://www.google.com/
[executeExactReplay] Action: click Click Search
[executeExactReplay] Action: type Fill Search
[executeExactReplay] Substituted %query% → how old is brad pitt?
[Variable Substitution] {
  original: '%query%',
  substituted: 'how old is brad pitt?',
  variable: 'query',
  selector: '#APjFqb',
  timestamp: '2025-12-13T07:45:53.332Z'
}
[executeExactReplay] Action: submit Press Enter to submit search
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] URL before submit: https://www.google.com/
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] ✓ Navigation detected: https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=147d6c4ab23ffdc0&source=hp&ei=rxk9advKJNjA0PEPqc6osQk&iflsig=AOw8s4IAAAAAaT0nv5j08zep8yE-hunRTySA6J2FYR8o&sei=sxk9acaVCdmb0PEPnZqQuQo
[executeExactReplay] ✓ Navigation completed after submit
[executeExactReplay] Extracting data with schema...
[2025-12-12 23:45:56.965 -0800] INFO: Starting extraction using a11y snapshot
    category: "extraction"
    instruction: "Extract the main answer about Brad Pitt's age and the stock price if available."
[2025-12-12 23:45:58.562 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "result": "Brad Pitt is 61 years old, born on December 18, 1963.",
        "stockPrice": "",
        "source": "Google Search",
        "url": ""
      },
      "usage": {
        "inputTokens": 8474,
        "outputTokens": 34,
        "totalTokens": 8508,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-12 23:45:59.212 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "progress": "Extracted Brad Pitt's age: 61 years old.",
        "completed": true
      },
      "usage": {
        "inputTokens": 263,
        "outputTokens": 20,
        "totalTokens": 283,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-12 23:45:59.213 -0800] INFO: Extraction completed successfully
    category: "extraction"
    prompt_tokens: "8737"
    completion_tokens: "54"
    inference_time_ms: "2249"
[executeExactReplay] Extraction result: {
  result: 'Brad Pitt is 61 years old, born on December 18, 1963.',
  stockPrice: '',
  source: 'Google Search',
  url: ''
}
[ResultTracker] ✓ exact_replay succeeded in 9471ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '21307988-1c66-403c-a8d1-5564f340e942',
  sessionUrl: 'https://www.browserbase.com/sessions/21307988-1c66-403c-a8d1-5564f340e942',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/21307988-1c66-403c-a8d1-5564f340e942/devtools/page/148C2C99563F5918552E1925FAC634EC?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  result: 'Brad Pitt is 61 years old, born on December 18, 1963.',
  stockPrice: '',
  source: 'Google Search',
  url: ''
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1765611945654_lhasatf3c
Skill: Skill: Search Google for %query% and extract the stock pr
Variables: { query: 'how old is brad pitt?' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (9471ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 9473 ms
Tokens Used: 8791

--- Extraction ---
Data Extracted: YES
Extracted Fields: 4
Non-empty Fields: [ 'result', 'source' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/21307988-1c66-403c-a8d1-5564f340e942
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/21307988-1c66-403c-a8d1-5564f340e942/devtools/page/148C2C99563F5918552E1925FAC634EC?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1765611945654_lhasatf3c',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 15.4s (compile: 229ms, render: 15.2s)
 POST /.well-known/workflow/v1/flow 200 in 12ms (compile: 1617µs, render: 11ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765611450587_kfq953loo',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1765611450587_kfq953loo/execute 200 in 16.1s (compile: 5ms, render: 16.1s)
