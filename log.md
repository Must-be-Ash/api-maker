ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1678ms
Created steps bundle 16ms
Created intermediate workflow bundle 7ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.6s
Discovering workflow directives 1681ms
Created steps bundle 18ms
Created intermediate workflow bundle 23ms
motion() is deprecated. Use motion.create() instead.
 GET / 200 in 3.3s (compile: 2.9s, render: 341ms)
 GET /skills 200 in 443ms (compile: 23ms, render: 420ms)
 GET /skills 200 in 2.5s (compile: 1462ms, render: 1002ms)
 GET /chat 200 in 1885ms (compile: 1826ms, render: 59ms)
[POST /api/chat] Request body: {"id":"DNgs2C1eb8jpW436","messages":[{"parts":[{"type":"text","text":"Tell me about Bob Dylan"}],"id":"Zvd3lavGO4qPuQeb","role":"user"}],"trigger":"submit-message"}
[POST /api/chat] Received messages: [
  {
    "parts": [
      {
        "type": "text",
        "text": "Tell me about Bob Dylan"
      }
    ],
    "id": "Zvd3lavGO4qPuQeb",
    "role": "user"
  }
]
[POST /api/chat] Loaded skills from database: 4
[POST /api/chat] Starting streamText with converted messages
[POST /api/chat] Streaming response started
[listSkills] Tool called
[listSkills] Returning result: {
  "skills": [
    {
      "skillId": "skill_1766007684545_h4qj4xork",
      "name": "Amazon Product Price Search",
      "goal": "Find price for %product% on Amazon",
      "price": 0.01,
      "variables": [],
      "successfulRun": true
    },
    {
      "skillId": "skill_1766002362007_extxjq6ga",
      "name": "Weather API",
      "goal": "Get current weather for %city%",
      "price": 0.01,
      "variables": [],
      "successfulRun": true
    },
    {
      "skillId": "skill_1765999943404_jjgdmv1ni",
      "name": "Wikipedia Search",
      "goal": "Search Wikipedia for %query%",
      "price": 0.01,
      "variables": [],
      "successfulRun": true
    },
    {
      "skillId": "skill_1765836699692_4ttbs6azo",
      "name": "Google Search API",
      "goal": "Search Google for %query% and extract the answer",
      "price": 0.01,
      "variables": [],
      "successfulRun": true
    }
  ],
  "count": 4
}
[streamText] Step finished: {
  toolCallsCount: 1,
  toolCalls: [ { name: 'listSkills', args: undefined } ],
  toolResultsCount: 1,
  hasText: false,
  textPreview: null
}
 POST /api/chat 200 in 2.2s (compile: 310ms, render: 1872ms)
[POST /api/chat] Request body: {"id":"DNgs2C1eb8jpW436","messages":[{"parts":[{"type":"text","text":"Tell me about Bob Dylan"}],"id":"Zvd3lavGO4qPuQeb","role":"user"},{"id":"7zaIn4LenBV5RhXo","role":"assistant","parts":[{"type":"st
[POST /api/chat] Received messages: [
  {
    "parts": [
      {
        "type": "text",
        "text": "Tell me about Bob Dylan"
      }
    ],
    "id": "Zvd3lavGO4qPuQeb",
    "role": "user"
  },
  {
    "id": "7zaIn4LenBV5RhXo",
    "role": "assistant",
    "parts": [
      {
        "type": "step-start"
      },
      {
        "type": "tool-listSkills",
        "toolCallId": "call_TdlBGQTLgWmaSia6JFNfOLV0",
        "state": "output-available",
        "input": {},
        "output": {
          "skills": [
            {
              "skillId": "skill_1766007684545_h4qj4xork",
              "name": "Amazon Product Price Search",
              "goal": "Find price for %product% on Amazon",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1766002362007_extxjq6ga",
              "name": "Weather API",
              "goal": "Get current weather for %city%",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1765999943404_jjgdmv1ni",
              "name": "Wikipedia Search",
              "goal": "Search Wikipedia for %query%",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1765836699692_4ttbs6azo",
              "name": "Google Search API",
              "goal": "Search Google for %query% and extract the answer",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            }
          ],
          "count": 4
        },
        "callProviderMetadata": {
          "openai": {
            "itemId": "fc_08914209abc8a9c20069432c34606c8191b58c419a41888234"
          }
        }
      }
    ]
  }
]
[POST /api/chat] Loaded skills from database: 4
[POST /api/chat] Starting streamText with converted messages
[POST /api/chat] Streaming response started
[streamText] Step finished: {
  toolCallsCount: 1,
  toolCalls: [ { name: 'executeSkill', args: undefined } ],
  toolResultsCount: 0,
  hasText: false,
  textPreview: null
}
 POST /api/chat 200 in 1258ms (compile: 1001µs, render: 1257ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765999943404_jjgdmv1ni
 GET /api/skills/skill_1765999943404_jjgdmv1ni 200 in 2.4s (compile: 2.4s, render: 24ms)
[x402] Payment required - returning 402
 POST /api/skills/skill_1765999943404_jjgdmv1ni/execute 402 in 1821ms (compile: 1797ms, render: 24ms)
[x402] Payment received:
  From: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
  To: 0x08bfec5133141cc704a34505d5e504503bf3168d
  Amount: 10000
  Network: base
[x402] ✓ Payment verified for: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment verified from: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] Settlement attempt 1/3
[x402] ✓ Payment settled: 0x62943822a4523af6f821ec30ef8fd1ca52f64cd05438e732fb914c89c8b0f305
[x402] ✓ Settlement succeeded on attempt 1
[x402] ✓ Payment settled on attempt 1: 0x62943822a4523af6f821ec30ef8fd1ca52f64cd05438e732fb914c89c8b0f305
[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765999943404_jjgdmv1ni',
  variables: undefined,
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 181ms (compile: 166ms, render: 15ms)
[executeSkillStep] Executing skill: skill_1765999943404_jjgdmv1ni
[executeSkillStep] Loaded skill: { name: 'Wikipedia Search', operations: 4 }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Wikipedia for %query%',
  substituted: 'Search Wikipedia for %query%'
}
[Schema Generator] Analysis: {
  goal: 'Search Wikipedia for %query%',
  hasVariables: true,
  variables: [ '%query%' ],
  contextProvided: false
}
[Schema Generator] Variable-based goal detected, using template: { category: 'generic_search', variables: [ '%query%' ] }
[Schema Generator] Using template for category: generic_search {
  fields: [ 'answer', 'source', 'title', 'url', 'snippet' ],
  variables: [ '%query%' ]
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'answer', 'source', 'title', 'url', 'snippet' ],
  instruction: 'Extract the main answer and source information from search results'
}
[executeSkillStep] Built Zod schema with 5 fields
[Extraction Schema] {
  fields: [
    {
      name: 'answer',
      type: 'string',
      description: 'The main answer or result from the search'
    },
    {
      name: 'source',
      type: 'string',
      description: 'Source of the information (e.g., website name)',
      optional: true
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the result page or featured snippet',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the source or result page',
      optional: true
    },
    {
      name: 'snippet',
      type: 'string',
      description: 'Text snippet or excerpt from the result',
      optional: true
    }
  ],
  instruction: 'Extract the main answer and source information from search results',
  fieldCount: 5,
  timestamp: '2025-12-17T22:18:38.123Z'
}
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: {}
[executeExactReplay] Navigating to start URL: https://www.wikipedia.org/
[executeExactReplay] Action: navigate Navigate to https://www.wikipedia.org/
[executeExactReplay] Action: click Click input
[executeExactReplay] Action: type Fill input
[executeExactReplay] Variable query not provided, using placeholder
[executeExactReplay] Action: submit Submit and wait for navigation
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] URL before submit: https://www.wikipedia.org/
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] ✓ Navigation detected: https://en.wikipedia.org/wiki/Special:Search?go=Go&search=%25query%25&ns0=1
[executeExactReplay] ✓ Navigation completed after submit
[Auto-Scroll] Page is long, scrolling to trigger lazy-loaded content...
[Auto-Scroll] Page height: 3447 Viewport: 711
[Auto-Scroll] Waited 2s for lazy content to load
[Auto-Scroll] ✓ Auto-scroll complete, page settled
[executeExactReplay] Using targeted extraction with selector: .mw-parser-output
[executeExactReplay] Extraction result: {
  answer: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...',
  source: '1 KB (217 words) - 13:05, 11 September 2025',
  title: 'Query',
  url: '6-1412',
  snippet: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...'
}
[ResultTracker] ✓ exact_replay succeeded in 15300ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '99506668-43f6-4878-a81c-6aefb4832377',
  sessionUrl: 'https://www.browserbase.com/sessions/99506668-43f6-4878-a81c-6aefb4832377',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/99506668-43f6-4878-a81c-6aefb4832377/devtools/page/A323F390FE61E568BEDC3631F2873EB5?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  answer: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...',
  source: '1 KB (217 words) - 13:05, 11 September 2025',
  title: 'Query',
  url: '6-1412',
  snippet: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...'
}

========== EXECUTION SUMMARY ==========
Execution ID: exec_1766009918122_lqhc3ie4n
Skill: Wikipedia Search
Variables: {}

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (15300ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 15300 ms
Tokens Used: 7539

--- Extraction ---
Data Extracted: YES
Extracted Fields: 5
Non-empty Fields: [ 'answer', 'source', 'title', 'url', 'snippet' ]

--- Validation ---
Valid: false

--- Session ---
Session URL: https://www.browserbase.com/sessions/99506668-43f6-4878-a81c-6aefb4832377
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/99506668-43f6-4878-a81c-6aefb4832377/devtools/page/A323F390FE61E568BEDC3631F2873EB5?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1766009918122_lqhc3ie4n',
  success: true,
  strategy: 'exact_replay',
  validationValid: false
}
 POST /.well-known/workflow/v1/step 200 in 19.5s (compile: 147ms, render: 19.4s)
 POST /.well-known/workflow/v1/flow 200 in 21ms (compile: 3ms, render: 17ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765999943404_jjgdmv1ni',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1765999943404_jjgdmv1ni/execute 200 in 23.4s (compile: 6ms, render: 23.4s)
[POST /api/chat] Request body: {"id":"DNgs2C1eb8jpW436","messages":[{"parts":[{"type":"text","text":"Tell me about Bob Dylan"}],"id":"Zvd3lavGO4qPuQeb","role":"user"},{"id":"7zaIn4LenBV5RhXo","role":"assistant","parts":[{"type":"st
[POST /api/chat] Received messages: [
  {
    "parts": [
      {
        "type": "text",
        "text": "Tell me about Bob Dylan"
      }
    ],
    "id": "Zvd3lavGO4qPuQeb",
    "role": "user"
  },
  {
    "id": "7zaIn4LenBV5RhXo",
    "role": "assistant",
    "parts": [
      {
        "type": "step-start"
      },
      {
        "type": "tool-listSkills",
        "toolCallId": "call_TdlBGQTLgWmaSia6JFNfOLV0",
        "state": "output-available",
        "input": {},
        "output": {
          "skills": [
            {
              "skillId": "skill_1766007684545_h4qj4xork",
              "name": "Amazon Product Price Search",
              "goal": "Find price for %product% on Amazon",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1766002362007_extxjq6ga",
              "name": "Weather API",
              "goal": "Get current weather for %city%",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1765999943404_jjgdmv1ni",
              "name": "Wikipedia Search",
              "goal": "Search Wikipedia for %query%",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            },
            {
              "skillId": "skill_1765836699692_4ttbs6azo",
              "name": "Google Search API",
              "goal": "Search Google for %query% and extract the answer",
              "price": 0.01,
              "variables": [],
              "successfulRun": true
            }
          ],
          "count": 4
        },
        "callProviderMetadata": {
          "openai": {
            "itemId": "fc_08914209abc8a9c20069432c34606c8191b58c419a41888234"
          }
        }
      },
      {
        "type": "step-start"
      },
      {
        "type": "tool-executeSkill",
        "toolCallId": "call_Z269VTFbkaDnzbzq3V8kKp26",
        "state": "output-available",
        "input": {
          "skillId": "skill_1765999943404_jjgdmv1ni"
        },
        "output": {
          "success": true,
          "extractedData": {
            "answer": "Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...",
            "source": "1 KB (217 words) - 13:05, 11 September 2025",
            "title": "Query",
            "url": "6-1412",
            "snippet": "Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise..."
          },
          "data": {
            "success": true,
            "extraction": {
              "answer": "Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...",
              "source": "1 KB (217 words) - 13:05, 11 September 2025",
              "title": "Query",
              "url": "6-1412",
              "snippet": "Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise..."
            }
          },
          "strategy": "exact_replay",
          "executionTime": 15300,
          "tokensUsed": 7539,
          "sessionUrl": "https://www.browserbase.com/sessions/99506668-43f6-4878-a81c-6aefb4832377",
          "payment": {
            "txHash": "0x62943822a4523af6f821ec30ef8fd1ca52f64cd05438e732fb914c89c8b0f305",
            "settled": true
          }
        },
        "callProviderMetadata": {
          "openai": {
            "itemId": "fc_08914209abc8a9c20069432c3537c08191adc5a3f0a4ce0058"
          }
        }
      }
    ]
  }
]
[POST /api/chat] Loaded skills from database: 4
[POST /api/chat] Starting streamText with converted messages
[POST /api/chat] Streaming response started
[GET /api/skills/[skillId]] Fetching skill: skill_1765999943404_jjgdmv1ni
 GET /api/skills/skill_1765999943404_jjgdmv1ni 200 in 31ms (compile: 7ms, render: 24ms)
[x402] Payment required - returning 402
 POST /api/skills/skill_1765999943404_jjgdmv1ni/execute 402 in 49ms (compile: 6ms, render: 43ms)
[streamText] Step finished: {
  toolCallsCount: 1,
  toolCalls: [ { name: 'executeSkill', args: undefined } ],
  toolResultsCount: 0,
  hasText: true,
  textPreview: 'I encountered a mix-up with the query about Bob Dylan. Let me try again to gather accurate information. One moment please!'
}
 POST /api/chat 200 in 2.6s (compile: 1880µs, render: 2.6s)
[x402] Payment received:
  From: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
  To: 0x08bfec5133141cc704a34505d5e504503bf3168d
  Amount: 10000
  Network: base
[x402] ✓ Payment verified for: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment verified from: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] Settlement attempt 1/3
[x402] ✓ Payment settled: 0x2210544958439b60caafc07dcaadd772608a8de022b4416aa8db8ab70a3b5744
[x402] ✓ Settlement succeeded on attempt 1
[x402] ✓ Payment settled on attempt 1: 0x2210544958439b60caafc07dcaadd772608a8de022b4416aa8db8ab70a3b5744
[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765999943404_jjgdmv1ni',
  variables: undefined,
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 12ms (compile: 1851µs, render: 10ms)
[executeSkillStep] Executing skill: skill_1765999943404_jjgdmv1ni
[executeSkillStep] Loaded skill: { name: 'Wikipedia Search', operations: 4 }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Wikipedia for %query%',
  substituted: 'Search Wikipedia for %query%'
}
[Schema Generator] Analysis: {
  goal: 'Search Wikipedia for %query%',
  hasVariables: true,
  variables: [ '%query%' ],
  contextProvided: false
}
[Schema Generator] Variable-based goal detected, using template: { category: 'generic_search', variables: [ '%query%' ] }
[Schema Generator] Using template for category: generic_search {
  fields: [ 'answer', 'source', 'title', 'url', 'snippet' ],
  variables: [ '%query%' ]
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'answer', 'source', 'title', 'url', 'snippet' ],
  instruction: 'Extract the main answer and source information from search results'
}
[executeSkillStep] Built Zod schema with 5 fields
[Extraction Schema] {
  fields: [
    {
      name: 'answer',
      type: 'string',
      description: 'The main answer or result from the search'
    },
    {
      name: 'source',
      type: 'string',
      description: 'Source of the information (e.g., website name)',
      optional: true
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the result page or featured snippet',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the source or result page',
      optional: true
    },
    {
      name: 'snippet',
      type: 'string',
      description: 'Text snippet or excerpt from the result',
      optional: true
    }
  ],
  instruction: 'Extract the main answer and source information from search results',
  fieldCount: 5,
  timestamp: '2025-12-17T22:19:03.887Z'
}
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: {}
[executeExactReplay] Navigating to start URL: https://www.wikipedia.org/
[executeExactReplay] Action: navigate Navigate to https://www.wikipedia.org/
[executeExactReplay] Action: click Click input
[executeExactReplay] Action: type Fill input
[executeExactReplay] Variable query not provided, using placeholder
[executeExactReplay] Action: submit Submit and wait for navigation
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] URL before submit: https://www.wikipedia.org/
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] ✓ Navigation detected: https://en.wikipedia.org/wiki/Special:Search?go=Go&search=%25query%25&ns0=1
[executeExactReplay] ✓ Navigation completed after submit
[Auto-Scroll] Page is long, scrolling to trigger lazy-loaded content...
[Auto-Scroll] Page height: 3447 Viewport: 711
[Auto-Scroll] Waited 2s for lazy content to load
[Auto-Scroll] ✓ Auto-scroll complete, page settled
[executeExactReplay] Using targeted extraction with selector: .mw-parser-output
[executeExactReplay] Extraction result: {
  answer: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...',
  source: 'Wikipedia',
  title: 'Query',
  url: '6-1412',
  snippet: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...'
}
[ResultTracker] ✓ exact_replay succeeded in 39700ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: 'd54a70aa-1408-422d-9ee2-751c177c1b7e',
  sessionUrl: 'https://www.browserbase.com/sessions/d54a70aa-1408-422d-9ee2-751c177c1b7e',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/d54a70aa-1408-422d-9ee2-751c177c1b7e/devtools/page/AF67D9E69939B149C535C2463609BE85?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  answer: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...',
  source: 'Wikipedia',
  title: 'Query',
  url: '6-1412',
  snippet: 'Look up query in Wiktionary, the free dictionary. In general, a query is a form of questioning, in a line of inquiry. Query may also refer to: Query, a precise...'
}

========== EXECUTION SUMMARY ==========
Execution ID: exec_1766009943887_o2qxhwdd5
Skill: Wikipedia Search
Variables: {}

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (39700ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 39701 ms
Tokens Used: 7504

--- Extraction ---
Data Extracted: YES
Extracted Fields: 5
Non-empty Fields: [ 'answer', 'source', 'title', 'url', 'snippet' ]

--- Validation ---
Valid: false

--- Session ---
Session URL: https://www.browserbase.com/sessions/d54a70aa-1408-422d-9ee2-751c177c1b7e
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/d54a70aa-1408-422d-9ee2-751c177c1b7e/devtools/page/AF67D9E69939B149C535C2463609BE85?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1766009943887_o2qxhwdd5',
  success: true,
  strategy: 'exact_replay',
  validationValid: false
}
[2025-12-17T22:19:46.946Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
[2025-12-17T22:19:46.946Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
[2025-12-17T22:19:47.062Z] ERROR: Browserbase session status: COMPLETED
