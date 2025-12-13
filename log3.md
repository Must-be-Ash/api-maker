[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765611450587_kfq953loo',
  variables: { query: 'how old is brad pitt' }
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1133µs, render: 11ms)
[executeSkillStep] Executing skill: skill_1765611450587_kfq953loo
[executeSkillStep] Loaded skill: {
  name: 'Skill: Search Google for %query% and extract the stock pr',
  operations: 4
}
[executeSkillStep] Using provided variables directly: { query: 'how old is brad pitt' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Google for %query% and extract the stock price',
  substituted: 'Search Google for how old is brad pitt and extract the stock price'
}
[Schema Generator] Analysis: {
  goal: 'Search Google for how old is brad pitt and extract the stock price',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'ageResult',
      type: 'string',
      description: "Main answer or result text for Brad Pitt's age"
    },
    {
      name: 'stockPrice',
      type: 'string',
      description: 'Current stock price extracted from the page',
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
  instruction: "Extract Brad Pitt's age and the stock price from the search results page.",
  description: 'Extracts the age of Brad Pitt and stock price information from Google search results.'
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'ageResult', 'stockPrice', 'source', 'url' ],
  instruction: "Extract Brad Pitt's age and the stock price from the search results page."
}
[executeSkillStep] Built Zod schema with 4 fields
[Extraction Schema] {
  fields: [
    {
      name: 'ageResult',
      type: 'string',
      description: "Main answer or result text for Brad Pitt's age"
    },
    {
      name: 'stockPrice',
      type: 'string',
      description: 'Current stock price extracted from the page',
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
  instruction: "Extract Brad Pitt's age and the stock price from the search results page.",
  fieldCount: 4,
  timestamp: '2025-12-13T18:10:17.039Z'
}
[2025-12-13 10:10:17.040 -0800] INFO: Using Browserbase credentials
    category: "init"
[2025-12-13 10:10:17.040 -0800] INFO: Starting browserbase session
    category: "init"
[2025-12-13 10:10:17.040 -0800] INFO: Creating new browserbase session...
    category: "init"
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: { query: 'how old is brad pitt' }
[executeExactReplay] Navigating to start URL: https://www.google.com/
[2025-12-13 10:10:19.181 -0800] INFO: Browserbase session started
    category: "init"
    sessionUrl: "https://www.browserbase.com/sessions/b8f78817-ef12-45d4-9885-222a56353e57"
    debugUrl: "https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/b8f78817-ef12-45d4-9885-222a56353e57/devtools/page/94893D1EB0981D97DA4E56A0FE429EDF?debug=true"
    sessionId: "b8f78817-ef12-45d4-9885-222a56353e57"
[2025-12-13 10:10:19.552 -0800] INFO: Connecting to local browser
    category: "init"
[executeExactReplay] Action: navigate Navigate to https://www.google.com/
[executeExactReplay] Action: click Click Search
[executeExactReplay] Action: type Fill Search
[executeExactReplay] Substituted %query% → how old is brad pitt
[Variable Substitution] {
  original: '%query%',
  substituted: 'how old is brad pitt',
  variable: 'query',
  selector: '#APjFqb',
  timestamp: '2025-12-13T18:10:22.428Z'
}
[executeExactReplay] Action: submit Press Enter to submit search
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] URL before submit: https://www.google.com/
[executeExactReplay] ⏎ Submitting form via: #APjFqb
[executeExactReplay] ✓ Navigation detected: https://www.google.com/search?q=how+old+is+brad+pitt&sca_esv=7e4dfe0eab4f43b7&source=hp&ei=DKw9aaKYMp7B0PEPxsCyUQ&iflsig=AOw8s4IAAAAAaT26HMsVanhNdAq11Z66u-JzZmUkmUeA&sei=EKw9aYi1DLie0PEP9IXQmQ4
[executeExactReplay] ✓ Navigation completed after submit
[executeExactReplay] Extracting data with schema...
[2025-12-13 10:10:26.255 -0800] INFO: Starting extraction using a11y snapshot
    category: "extraction"
    instruction: "Extract Brad Pitt's age and the stock price from the search results page."
[2025-12-13 10:10:27.327 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "ageResult": "61 years",
        "stockPrice": ""
      },
      "usage": {
        "inputTokens": 7917,
        "outputTokens": 13,
        "totalTokens": 7930,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[executeExactReplay] Extraction result: { ageResult: '61 years', stockPrice: '' }
[ResultTracker] ✓ exact_replay succeeded in 9498ms
[executeSkillStep] ✓ Strategy 1 succeeded
[2025-12-13 10:10:28.403 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "progress": "Brad Pitt's age extracted; stock price missing.",
        "completed": false
      },
      "usage": {
        "inputTokens": 235,
        "outputTokens": 18,
        "totalTokens": 253,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-13 10:10:28.403 -0800] INFO: Extraction incomplete after processing all data
    category: "extraction"
    prompt_tokens: "8152"
    completion_tokens: "31"
    inference_time_ms: "2043"
[executeSkillStep] Session info: {
  sessionId: 'b8f78817-ef12-45d4-9885-222a56353e57',
  sessionUrl: 'https://www.browserbase.com/sessions/b8f78817-ef12-45d4-9885-222a56353e57',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/b8f78817-ef12-45d4-9885-222a56353e57/devtools/page/94893D1EB0981D97DA4E56A0FE429EDF?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: { ageResult: '61 years', stockPrice: '' }
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1765649415115_0944ye3zx
Skill: Skill: Search Google for %query% and extract the stock pr
Variables: { query: 'how old is brad pitt' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (9498ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 9499 ms
Tokens Used: 8183

--- Extraction ---
Data Extracted: YES
Extracted Fields: 2
Non-empty Fields: [ 'ageResult' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/b8f78817-ef12-45d4-9885-222a56353e57
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/b8f78817-ef12-45d4-9885-222a56353e57/devtools/page/94893D1EB0981D97DA4E56A0FE429EDF?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1765649415115_0944ye3zx',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 14.8s (compile: 1131µs, render: 14.8s)
 POST /.well-known/workflow/v1/flow 200 in 10ms (compile: 1644µs, render: 9ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765611450587_kfq953loo',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1765611450587_kfq953loo/execute 200 in 15.1s (compile: 3ms, render: 15.0s)
