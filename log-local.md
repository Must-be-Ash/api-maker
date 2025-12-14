ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1730ms
Created steps bundle 20ms
Created intermediate workflow bundle 7ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.98:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.6s
Discovering workflow directives 2136ms
Created steps bundle 14ms
Created intermediate workflow bundle 9ms
 ○ Compiling /skills/record ...
 GET /skills/record 200 in 3.7s (compile: 3.4s, render: 310ms)
(node:42332) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 161ms (compile: 146ms, render: 14ms)
[startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[startRecordingStep] Creating Browserbase session
[startRecordingStep] Extension ID: b12a26d9-e4b8-47d9-84e8-507610fc3c25
[startRecordingStep] Session payload: {
  "projectId": "26b0ffe0-6897-4cf1-a66c-3a927c7f9456",
  "keepAlive": true,
  "extensionId": "b12a26d9-e4b8-47d9-84e8-507610fc3c25",
  "browserSettings": {
    "recordSession": true,
    "logSession": true
  }
}
[startRecordingStep] Browserbase response: {
  id: '81f9a6f9-b4c0-446d-862c-8c0274789450',
  createdAt: '2025-12-14T23:19:27.926465+00:00',
  updatedAt: '2025-12-14T23:19:27.926465+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T23:19:27.917+00:00',
  expiresAt: '2025-12-14T23:24:27.917+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.xs8M8NlJ3vF0q_A99EC9ZM1lZeHvCBIgd2zT44yPh_XHCMqQ6KIZGA.bwVfENf6R6SYBBHH.-R4xks-MmH3yjkBnTNIpVIVHEQGXprtYLegXPEdcNOi0l7NeMtqoTCJ2d_4A57QoXRozBmaP83F8kcOPRgAp72kf8STTM8FScadlVGkTgToghebuKJyQmTWo4qKC736yoxqX8z97dPkaAAOoJE6z6HXlppvghV8V25QkA0m1iP1kPNCV9UmD_Aiccy7FsmTTnzCJvhOQJf6sJXb-l7n_UTjbKvrR2phVlXcDxgPy30HgQrG-k940H7FQWnxgTmobv75LVOm_ANfEOO6cA15eCs4ThYiK1fVcejOtrOIecpN9BhCfzEqc-igWsQdSBA2eC7hVX265-QtJa_4Pj1Hsue9X6JcUrGEHyQGsPJ1WM7GjSgBES10N1HHFNvK73sx4KL5RFncJQSYTOMy9iafROkHHTUT6fBcExjTgzW_3IJkOYwEoEpt6LqbQv2GEJyMO.wo9Z9qtE0-wsIQcIhCXkGA',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.xs8M8NlJ3vF0q_A99EC9ZM1lZeHvCBIgd2zT44yPh_XHCMqQ6KIZGA.bwVfENf6R6SYBBHH.-R4xks-MmH3yjkBnTNIpVIVHEQGXprtYLegXPEdcNOi0l7NeMtqoTCJ2d_4A57QoXRozBmaP83F8kcOPRgAp72kf8STTM8FScadlVGkTgToghebuKJyQmTWo4qKC736yoxqX8z97dPkaAAOoJE6z6HXlppvghV8V25QkA0m1iP1kPNCV9UmD_Aiccy7FsmTTnzCJvhOQJf6sJXb-l7n_UTjbKvrR2phVlXcDxgPy30HgQrG-k940H7FQWnxgTmobv75LVOm_ANfEOO6cA15eCs4ThYiK1fVcejOtrOIecpN9BhCfzEqc-igWsQdSBA2eC7hVX265-QtJa_4Pj1Hsue9X6JcUrGEHyQGsPJ1WM7GjSgBES10N1HHFNvK73sx4KL5RFncJQSYTOMy9iafROkHHTUT6fBcExjTgzW_3IJkOYwEoEpt6LqbQv2GEJyMO.wo9Z9qtE0-wsIQcIhCXkGA'
}
[startRecordingStep] Browserbase session created: 81f9a6f9-b4c0-446d-862c-8c0274789450
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/81f9a6f9-b4c0-446d-862c-8c0274789450/devtools/page/FD9AB3884B4958216A507F8E67F40A77?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.google.com/
[ActionRecorder] Starting recording
[ActionRecorder] Installing monitoring script (attempt 1/3)...
[ActionRecorder] Injecting script on current page
[ActionRecorder] ✅ Monitoring script installed successfully
[ActionRecorder] Event listeners will automatically persist across navigations
[ActionRecorder] Event listener installation verified
[ActionRecorder] Initial URL: https://www.google.com/
[ActionRecorder] ✅ Started recording with persistent event listeners
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 7.9s (compile: 337ms, render: 7.5s)
 POST /.well-known/workflow/v1/flow 200 in 16ms (compile: 2ms, render: 13ms)
[POST /api/skills/start-recording] Recording started: rec_1765754367577_6dyk31sa7
 POST /api/skills/start-recording 200 in 10.3s (compile: 1987ms, render: 8.3s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 6 actions from page
[ActionRecorder] Retrieved 9 actions from page
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] URL changed: https://www.google.com/ -> https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=295c40e6b26b4887&source=hp&ei=BUY_ae4lr9jQ8Q-b_en4Cw&iflsig=AOw8s4IAAAAAaT9UFX_PBWRDllfjbm2qnD1ycT8D5t7E&ved=0ahUKEwiuvKfRm76RAxUvLDQIHZt-Gr8Q4dUDCBY&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESLQ9UIAGWLUwcAF4AJABAJgBgAGgAfQJqgEEMjAuMbgBDMgBAPgBAZgCFqACsguoAgrCAgoQABgDGI8BGOoCwgIOEC4YgAQYsQMYxwEY0QPCAg4QABiABBiKBRixAxiDAcICERAuGIAEGLEDGIMBGMcBGNEDwgIOEC4YgAQYigUYsQMYgwHCAggQABiABBixA8ICCxAuGIAEGLEDGIMBwgILEAAYgAQYsQMYgwHCAggQLhiABBixA8ICBBAAGAOYAwqSBwQyMS4xoAfyjQGyBwQyMC4xuAeoC8IHCDItMTguMy4xyAebAYAIAQ&sclient=gws-wiz&sei=EkY_aZXpJZ_G0PEPsrqSkAE
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765754367577_6dyk31sa7',
  sessionId: '81f9a6f9-b4c0-446d-862c-8c0274789450',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 12ms (compile: 1310µs, render: 11ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765754367577_6dyk31sa7',
  sessionId: '81f9a6f9-b4c0-446d-862c-8c0274789450',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765754367577_6dyk31sa7', actionsCount: 22 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 22 raw actions...
[ActionRecorder] Grouped into 3 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 3 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=295c40e6b26b4887&source=hp&ei=BUY_ae4lr9jQ8Q-b_en4Cw&iflsig=AOw8s4IAAAAAaT9UFX_PBWRDllfjbm2qnD1ycT8D5t7E&ved=0ahUKEwiuvKfRm76RAxUvLDQIHZt-Gr8Q4dUDCBY&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESLQ9UIAGWLUwcAF4AJABAJgBgAGgAfQJqgEEMjAuMbgBDMgBAPgBAZgCFqACsguoAgrCAgoQABgDGI8BGOoCwgIOEC4YgAQYsQMYxwEY0QPCAg4QABiABBiKBRixAxiDAcICERAuGIAEGLEDGIMBGMcBGNEDwgIOEC4YgAQYigUYsQMYgwHCAggQABiABBixA8ICCxAuGIAEGLEDGIMBwgILEAAYgAQYsQMYgwHCAggQLhiABBixA8ICBBAAGAOYAwqSBwQyMS4xoAfyjQGyBwQyMC4xuAeoC8IHCDItMTguMy4xyAebAYAIAQ&sclient=gws-wiz&sei=EkY_aZXpJZ_G0PEPsrqSkAE',
  title: 'how old is brad pitt? - Google Search',
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
  explanation: 'The captured value "how old is brad pitt" is a text input used in the context of a search query. The goal is to search Google for a specific query, which directly corresponds to the variable %query%. Therefore, the mapping is straightforward: the text input value maps to the %query% variable.'
}
[finishRecordingStep] Variable mapping (enhanced): { 'how old is brad pitt': '%query%' }
[finishRecordingStep] Applied variable mapping to 1 actions
[finishRecordingStep] Prepended initial navigation to: https://www.google.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (9.2s later)
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
[2025-12-14T23:20:11.863Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
[2025-12-14T23:20:11.863Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
[2025-12-14T23:20:12.215Z] ERROR: Browserbase session status: COMPLETED
[finishRecordingStep] Session close timed out after 10s, continuing anyway
[finishRecordingStep] Skill saved to database: skill_1765754421195_ot94whekg
 POST /.well-known/workflow/v1/step 200 in 26.1s (compile: 1318µs, render: 26.1s)
 POST /.well-known/workflow/v1/flow 200 in 8ms (compile: 938µs, render: 7ms)
[POST /api/skills/finish-recording] Skill created: skill_1765754421195_ot94whekg
 POST /api/skills/finish-recording 200 in 27.8s (compile: 466ms, render: 27.3s)
 GET /skills/skill_1765754421195_ot94whekg 200 in 1621ms (compile: 1595ms, render: 27ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765754421195_ot94whekg
[GET /api/skills/[skillId]] Fetching skill: skill_1765754421195_ot94whekg
 GET /api/skills/skill_1765754421195_ot94whekg 200 in 1180ms (compile: 1134ms, render: 46ms)
 GET /api/skills/skill_1765754421195_ot94whekg 200 in 1395ms (compile: 1136ms, render: 260ms)
