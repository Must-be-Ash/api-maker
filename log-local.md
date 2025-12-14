ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1390ms
Created steps bundle 16ms
Created intermediate workflow bundle 6ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.98:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.2s
Discovering workflow directives 2159ms
Created steps bundle 36ms
Created intermediate workflow bundle 12ms
 GET /skills/record 200 in 3.4s (compile: 3.0s, render: 334ms)
(node:59794) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 164ms (compile: 149ms, render: 14ms)
[startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[startRecordingStep] Creating Browserbase session
[startRecordingStep] Browserbase response: {
  id: '590c9c25-5e1f-4914-884e-36fdb8efd35f',
  createdAt: '2025-12-14T21:07:32.377019+00:00',
  updatedAt: '2025-12-14T21:07:32.377019+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T21:07:32.366+00:00',
  expiresAt: '2025-12-14T21:12:32.366+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.4M1XEfYcqwj_N3YDFJ6dDEao77fYFifI5gh_3rpehGiY0LNLtMyBsw.FsNiCsrwyyyVqt6S.2_JhLbP_HgQLwKb_pEOLoNykVyiQzz5d7DliW5KvJ_wFfmyQRrWWdHNNs_BcMU83_bZ7yYCDG2lVlaWBCh7IvhZZY7Jhp1Om6rpiDzadIy1kVYDGx6x_49RGtNSSLZ0_Ss4iFacj0eYSqDl0-dD2b4NgAp2ymse6QOlCgdPP8AnCyinqpPlHleZ2ZjxQv3Mr8Jnkrz6-WsSfvHeLjMv2lVUrh55PNUANoBhppaCCUDtSem2acVDHxTLoyujLg7w7u5NUMgeJC2uxLr2aOQWqpJzvYb-arImyCM7exYh3TUbD3GrL10HYmmfNMuLk4DDGAjL0-KK1l15sgqUGmk-8fS8MDZbT__wVWYdMpBjf0eTCg6BBE6eGzs_6mvM8izXh9Qd0vLeLhBqbuFyNjmsVBCrY-85ruDTUl0dBVGObVu79WYur51Yys23bvApS5b8-.U3yDtQ__2awyCQBCY6j1zA',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.4M1XEfYcqwj_N3YDFJ6dDEao77fYFifI5gh_3rpehGiY0LNLtMyBsw.FsNiCsrwyyyVqt6S.2_JhLbP_HgQLwKb_pEOLoNykVyiQzz5d7DliW5KvJ_wFfmyQRrWWdHNNs_BcMU83_bZ7yYCDG2lVlaWBCh7IvhZZY7Jhp1Om6rpiDzadIy1kVYDGx6x_49RGtNSSLZ0_Ss4iFacj0eYSqDl0-dD2b4NgAp2ymse6QOlCgdPP8AnCyinqpPlHleZ2ZjxQv3Mr8Jnkrz6-WsSfvHeLjMv2lVUrh55PNUANoBhppaCCUDtSem2acVDHxTLoyujLg7w7u5NUMgeJC2uxLr2aOQWqpJzvYb-arImyCM7exYh3TUbD3GrL10HYmmfNMuLk4DDGAjL0-KK1l15sgqUGmk-8fS8MDZbT__wVWYdMpBjf0eTCg6BBE6eGzs_6mvM8izXh9Qd0vLeLhBqbuFyNjmsVBCrY-85ruDTUl0dBVGObVu79WYur51Yys23bvApS5b8-.U3yDtQ__2awyCQBCY6j1zA'
}
[startRecordingStep] Browserbase session created: 590c9c25-5e1f-4914-884e-36fdb8efd35f
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/590c9c25-5e1f-4914-884e-36fdb8efd35f/devtools/page/8522661E29B40D84C1CFFC54EE3407A6?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🗂️ backup and recover secrets: https://dotenvx.com/ops
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.google.com/
[ActionRecorder] Starting recording
[ActionRecorder] Installing monitoring script (attempt 1/3)...
[ActionRecorder] Setting up addInitScript for future navigations
[ActionRecorder] Injecting script on current page
[ActionRecorder] ✅ Monitoring script installed successfully
[ActionRecorder] Event listeners will automatically persist across navigations
[ActionRecorder] Event listener installation verified
[ActionRecorder] Initial URL: https://www.google.com/
[ActionRecorder] ✅ Started recording with persistent event listeners
[startRecordingStep] ✅ Action recorder started with event listeners verified
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 7.7s (compile: 322ms, render: 7.4s)
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 3ms, render: 11ms)
[POST /api/skills/start-recording] Recording started: rec_1765746452135_6krs7w754
 POST /api/skills/start-recording 200 in 10.2s (compile: 2.0s, render: 8.2s)
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] Retrieved 12 actions from page
[ActionRecorder] Retrieved 4 actions from page
[ActionRecorder] URL changed: https://www.google.com/ -> https://www.google.com/search?q=how+old+is+brad+pitt&sca_esv=4063a013568e4ff8&source=hp&ei=GSc_afyVErrK0PEPnKejuQo&iflsig=AOw8s4IAAAAAaT81KST_0vbv-B2w_0iAiTd13ccaIhUp&ved=0ahUKEwi8hueS_r2RAxU6JTQIHZzTKKcQ4dUDCBY&oq=how+old+is+brad+pitt&gs_lp=Egdnd3Mtd2l6IhRob3cgb2xkIGlzIGJyYWQgcGl0dDIIEAAYgAQYsQMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI9TNQiwhYuSdwAXgAkAEAmAF6oAGKCqoBBDE5LjG4AQzIAQD4AQGYAhWgAswLqAIKwgIKEAAYAxiPARjqAsICDhAuGIAEGLEDGMcBGNEDwgIOEAAYgAQYigUYsQMYgwHCAg4QLhiABBiKBRixAxiDAcICERAuGIAEGLEDGIMBGMcBGNEDwgILEAAYgAQYsQMYgwHCAgsQLhiABBixAxiDAcICCBAuGIAEGLEDwgIEEAAYA5gDC5IHBDIwLjGgB4-GAbIHBDE5LjG4B8ELwgcGMi0xNS42yAeLAYAIAQ&sclient=gws-wiz&sei=Jic_af7zFdit0PEPm8__kAY
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765746452135_6krs7w754',
  sessionId: '590c9c25-5e1f-4914-884e-36fdb8efd35f',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 16ms (compile: 1359µs, render: 14ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765746452135_6krs7w754',
  sessionId: '590c9c25-5e1f-4914-884e-36fdb8efd35f',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765746452135_6krs7w754', actionsCount: 22 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 22 raw actions...
[ActionRecorder] Grouped into 3 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 3 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=how+old+is+brad+pitt&sca_esv=4063a013568e4ff8&source=hp&ei=GSc_afyVErrK0PEPnKejuQo&iflsig=AOw8s4IAAAAAaT81KST_0vbv-B2w_0iAiTd13ccaIhUp&ved=0ahUKEwi8hueS_r2RAxU6JTQIHZzTKKcQ4dUDCBY&oq=how+old+is+brad+pitt&gs_lp=Egdnd3Mtd2l6IhRob3cgb2xkIGlzIGJyYWQgcGl0dDIIEAAYgAQYsQMyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgARI9TNQiwhYuSdwAXgAkAEAmAF6oAGKCqoBBDE5LjG4AQzIAQD4AQGYAhWgAswLqAIKwgIKEAAYAxiPARjqAsICDhAuGIAEGLEDGMcBGNEDwgIOEAAYgAQYigUYsQMYgwHCAg4QLhiABBiKBRixAxiDAcICERAuGIAEGLEDGIMBGMcBGNEDwgILEAAYgAQYsQMYgwHCAgsQLhiABBixAxiDAcICCBAuGIAEGLEDwgIEEAAYA5gDC5IHBDIwLjGgB4-GAbIHBDE5LjG4B8ELwgcGMi0xNS42yAeLAYAIAQ&sclient=gws-wiz&sei=Jic_af7zFdit0PEPm8__kAY',
  title: 'how old is brad pitt - Google Search',
  headingCount: 5,
  hints: {
    hasPriceElements: false,
    hasDateElements: true,
    hasTableData: true,
    hasListItems: true,
    hasFormElements: true
  }
}
[finishRecordingStep] 🧪 Testing extraction schema before session close...
[Schema Generator] Analysis: {
  goal: 'google search',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main answer or result text extracted from the page'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the result',
      optional: true
    },
    {
      name: 'snippet',
      type: 'string',
      description: 'Text snippet or description from the result',
      optional: true
    }
  ],
  instruction: 'Extract search results based on the query',
  description: 'Extracts main search result and relevant details'
}
[finishRecordingStep] Generated test schema: { fields: 3, instruction: 'Extract search results based on the query' }
[finishRecordingStep] ✅ Extraction test PASSED
[finishRecordingStep] Released keep-alive session
[finishRecordingStep] Extracted semantic values: [
  {
    value: 'how old is brad pitt',
    type: 'text-input',
    label: 'Fill Search',
    actionIndex: 1
  }
]
[finishRecordingStep] Goal appears vague, inferring structured goal...
[finishRecordingStep] Original goal: google search
[Goal Inference] Analyzing user intent: {
  userIntent: 'google search',
  demoQuery: 'how old is brad pitt',
  startUrl: 'https://www.google.com/',
  actionCount: 3
}
[Goal Inference] Inference result: {
  structuredGoal: 'Search Google for %query% and extract the answer',
  variables: [ '%query%' ],
  category: 'generic_search',
  confidence: 0.95
}
[finishRecordingStep] Inferred goal: {
  original: 'google search',
  structured: 'Search Google for %query% and extract the answer',
  variables: [ '%query%' ],
  category: 'generic_search',
  confidence: 0.95
}
[finishRecordingStep] ✅ Using inferred goal (confidence >= 0.7)
[Variable Detector Enhanced] Mapping result: {
  mappings: { 'how old is brad pitt': '%query%' },
  explanation: "The captured value 'how old is brad pitt' is a text-input type and matches the context of a search query. The goal is to search Google for a specific query, and the variable in the goal is '%query%'. Therefore, the value maps directly to '%query%' based on its semantic meaning and context."
}
[finishRecordingStep] Variable mapping (enhanced): { 'how old is brad pitt': '%query%' }
[finishRecordingStep] Applied variable mapping to 1 actions
[finishRecordingStep] Prepended initial navigation to: https://www.google.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (6.2s later)
[filterRedundantNavigations] ✓ Created submit action: Press Enter to submit search
[finishRecordingStep] Filtered actions: { before: 4, after: 4, removed: 0 }
[Schema Generator] Analysis: {
  goal: 'Search Google for %query% and extract the answer',
  hasVariables: true,
  variables: [ '%query%' ],
  contextProvided: true
}
[Schema Generator] Variable-based goal detected, using template: { category: 'generic_search', variables: [ '%query%' ] }
[Schema Generator] Using template for category: generic_search {
  fields: [ 'answer', 'source', 'title', 'url', 'snippet' ],
  variables: [ '%query%' ]
}
[finishRecordingStep] Generated extraction schema: {
  fields: 5,
  instruction: 'Extract the main answer and source information from search results',
  withContext: true
}
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 4 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] Executing action: navigate Navigate to https://www.google.com/
[replayWorkflow] Executing action: act Click Search
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill Search with value %query%
[replayWorkflow] Reverse-substituted variable: { from: '%query%', to: 'how old is brad pitt' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Press Enter to submit search
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[2025-12-14T21:08:15.425Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
[2025-12-14T21:08:15.426Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
[2025-12-14T21:08:15.586Z] ERROR: Browserbase session status: COMPLETED
[finishRecordingStep] Session close timed out after 10s, continuing anyway
[finishRecordingStep] Skill saved to database: skill_1765746505021_vuve0q5ol
 POST /.well-known/workflow/v1/step 200 in 26.1s (compile: 1086µs, render: 26.1s)
 POST /.well-known/workflow/v1/flow 200 in 9ms (compile: 1383µs, render: 8ms)
[POST /api/skills/finish-recording] Skill created: skill_1765746505021_vuve0q5ol
 POST /api/skills/finish-recording 200 in 27.7s (compile: 446ms, render: 27.2s)
 GET /skills/skill_1765746505021_vuve0q5ol 200 in 1567ms (compile: 1543ms, render: 24ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765746505021_vuve0q5ol
[GET /api/skills/[skillId]] Fetching skill: skill_1765746505021_vuve0q5ol
 GET /api/skills/skill_1765746505021_vuve0q5ol 200 in 1156ms (compile: 1130ms, render: 27ms)
 GET /api/skills/skill_1765746505021_vuve0q5ol 200 in 1299ms (compile: 1132ms, render: 167ms)
