ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1652ms
Created steps bundle 18ms
Created intermediate workflow bundle 7ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.3s
 ○ Compiling / ...
motion() is deprecated. Use motion.create() instead.
 GET / 200 in 3.7s (compile: 3.3s, render: 380ms)
 GET /skills/skill_1765999943404_jjgdmv1ni 200 in 2.4s (compile: 2.4s, render: 25ms)
 GET /skills 200 in 1374ms (compile: 716ms, render: 658ms)
 GET /skills/skill_1765999943404_jjgdmv1ni 200 in 18ms (compile: 8ms, render: 9ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765999943404_jjgdmv1ni
 GET /api/skills/skill_1765999943404_jjgdmv1ni 200 in 2.1s (compile: 2.1s, render: 30ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765999943404_jjgdmv1ni
 GET /api/skills/skill_1765999943404_jjgdmv1ni 200 in 31ms (compile: 7ms, render: 24ms)
[x402] Payment required - returning 402
 POST /api/skills/skill_1765999943404_jjgdmv1ni/execute 402 in 2.2s (compile: 2.0s, render: 153ms)
[x402] Payment received:
  From: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
  To: 0x08bfec5133141cc704a34505d5e504503bf3168d
  Amount: 10000
  Network: base
[x402] ✓ Payment verified for: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment verified from: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] Settlement attempt 1/3
[x402] ✓ Payment settled: 0x2c38ffc1238bc4a3558f5062adf30e4b3fb58b9dde60eab9ad8e4602379966bb
[x402] ✓ Settlement succeeded on attempt 1
[x402] ✓ Payment settled on attempt 1: 0x2c38ffc1238bc4a3558f5062adf30e4b3fb58b9dde60eab9ad8e4602379966bb
[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765999943404_jjgdmv1ni',
  variables: { topic: 'Bob Dylan' },
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 190ms (compile: 167ms, render: 23ms)
[executeSkillStep] Executing skill: skill_1765999943404_jjgdmv1ni
[executeSkillStep] Loaded skill: { name: 'Wikipedia Search', operations: 4 }
[executeSkillStep] Using provided variables directly: { topic: 'Bob Dylan' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Wikipedia for %topic%',
  substituted: 'Search Wikipedia for Bob Dylan'
}
[Schema Generator] Analysis: {
  goal: 'Search Wikipedia for Bob Dylan',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main content or summary about Bob Dylan from the Wikipedia page'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the Wikipedia page',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the Wikipedia page',
      optional: true
    },
    {
      name: 'birthDate',
      type: 'string',
      description: 'Birth date of Bob Dylan in ISO format',
      optional: true
    },
    {
      name: 'genres',
      type: 'array',
      description: 'List of music genres associated with Bob Dylan',
      optional: true
    },
    {
      name: 'albums',
      type: 'array',
      description: 'List of notable albums by Bob Dylan',
      optional: true
    }
  ],
  instruction: 'Extract main content, title, and additional details about Bob Dylan from Wikipedia.',
  description: 'Extracts information about Bob Dylan from his Wikipedia page.'
}
[executeSkillStep] Regenerated schema: {
  fields: [ 'result', 'title', 'url', 'birthDate', 'genres', 'albums' ],
  instruction: 'Extract main content, title, and additional details about Bob Dylan from Wikipedia.'
}
[executeSkillStep] Built Zod schema with 6 fields
[Extraction Schema] {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main content or summary about Bob Dylan from the Wikipedia page'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the Wikipedia page',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the Wikipedia page',
      optional: true
    },
    {
      name: 'birthDate',
      type: 'string',
      description: 'Birth date of Bob Dylan in ISO format',
      optional: true
    },
    {
      name: 'genres',
      type: 'array',
      description: 'List of music genres associated with Bob Dylan',
      optional: true
    },
    {
      name: 'albums',
      type: 'array',
      description: 'List of notable albums by Bob Dylan',
      optional: true
    }
  ],
  instruction: 'Extract main content, title, and additional details about Bob Dylan from Wikipedia.',
  fieldCount: 6,
  timestamp: '2025-12-17T22:31:45.394Z'
}
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: { topic: 'Bob Dylan' }
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
  result: '',
  title: '',
  url: '',
  birthDate: '',
  genres: [],
  albums: []
}
[ResultTracker] ✓ exact_replay succeeded in 15215ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '6b99983a-001e-460e-a637-e5fdeba94a02',
  sessionUrl: 'https://www.browserbase.com/sessions/6b99983a-001e-460e-a637-e5fdeba94a02',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/6b99983a-001e-460e-a637-e5fdeba94a02/devtools/page/337F33E2B1CF5603D69C449D29F3EE61?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  result: '',
  title: '',
  url: '',
  birthDate: '',
  genres: [],
  albums: []
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1766010701972_dpywjx7sf
Skill: Wikipedia Search
Variables: { topic: 'Bob Dylan' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (15215ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 15215 ms
Tokens Used: 7366

--- Extraction ---
Data Extracted: YES
Extracted Fields: 6
Non-empty Fields: [ 'genres', 'albums' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/6b99983a-001e-460e-a637-e5fdeba94a02
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/6b99983a-001e-460e-a637-e5fdeba94a02/devtools/page/337F33E2B1CF5603D69C449D29F3EE61?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1766010701972_dpywjx7sf',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 23.5s (compile: 304ms, render: 23.2s)
 POST /.well-known/workflow/v1/flow 200 in 17ms (compile: 3ms, render: 14ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765999943404_jjgdmv1ni',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1765999943404_jjgdmv1ni/execute 200 in 26.0s (compile: 6ms, render: 26.0s)
