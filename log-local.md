ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1883ms
Created steps bundle 25ms
Created intermediate workflow bundle 30ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.98:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.7s
 GET /skills/record 200 in 3.1s (compile: 2.8s, render: 295ms)
(node:76509) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 155ms (compile: 140ms, render: 15ms)
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
  id: '6572bbf3-26ff-4580-a1f1-96b6de806ab8',
  createdAt: '2025-12-15T00:08:43.498276+00:00',
  updatedAt: '2025-12-15T00:08:43.498276+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-15T00:08:43.488+00:00',
  expiresAt: '2025-12-15T00:13:43.488+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.HwpomwOa8MEvm8PKgXl_7iV2QGM6AdEf_D-AiZ5MuNJfaLYE3g-9-g.rKvTj7rvOW6tLJc0.q7EXc3sRnB9J0Vm28noIt-a2tjp2Xj4K5od7t96e419vIRkfOtD-GF9VC6N84BZolRlyzRs3YpKH6pS8iieo48cklcrBcVo9CVbQ4TIIwsnJjFXP7ZBJKrXmxVh88iT3_oI6edjQHvMo0et7Pd-gbKz62Z37hxA3PeqGAH-fEcJv1V0m2Hcs68msWJZ7LQrOVtF4pFOx6856btYX5b4rNZZT4sAdlgk9DLQDGK1o448J6J97EI05xwshuh4bAhvAQ47qTQQw91sHW9WD1G58sWukbZI-EZ-4kUNd6pUJEBUpMP65VqAu_hapOVBW8jcX0rB5-q70RyIrNZaYV7FQ5Sp9wVgXgGmR-ILONTtZ2crh-K40H6AEoEAls5mMx7h8YxMSFzanihXJ5bOUjl1UUdSPRHmXpAYueJxdIZU1uL6ncyoBaPJNGIAzd_SHyOdw.J0h8HuuWjqb1BtZUQY1XlQ',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.HwpomwOa8MEvm8PKgXl_7iV2QGM6AdEf_D-AiZ5MuNJfaLYE3g-9-g.rKvTj7rvOW6tLJc0.q7EXc3sRnB9J0Vm28noIt-a2tjp2Xj4K5od7t96e419vIRkfOtD-GF9VC6N84BZolRlyzRs3YpKH6pS8iieo48cklcrBcVo9CVbQ4TIIwsnJjFXP7ZBJKrXmxVh88iT3_oI6edjQHvMo0et7Pd-gbKz62Z37hxA3PeqGAH-fEcJv1V0m2Hcs68msWJZ7LQrOVtF4pFOx6856btYX5b4rNZZT4sAdlgk9DLQDGK1o448J6J97EI05xwshuh4bAhvAQ47qTQQw91sHW9WD1G58sWukbZI-EZ-4kUNd6pUJEBUpMP65VqAu_hapOVBW8jcX0rB5-q70RyIrNZaYV7FQ5Sp9wVgXgGmR-ILONTtZ2crh-K40H6AEoEAls5mMx7h8YxMSFzanihXJ5bOUjl1UUdSPRHmXpAYueJxdIZU1uL6ncyoBaPJNGIAzd_SHyOdw.J0h8HuuWjqb1BtZUQY1XlQ'
}
[startRecordingStep] Browserbase session created: 6572bbf3-26ff-4580-a1f1-96b6de806ab8
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/6572bbf3-26ff-4580-a1f1-96b6de806ab8/devtools/page/F6D42ED563F74C7FFEAA0DED04B61C2E?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔑 add access controls to secrets: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com
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
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 8.2s (compile: 312ms, render: 7.9s)
 POST /.well-known/workflow/v1/flow 200 in 15ms (compile: 2ms, render: 13ms)
[POST /api/skills/start-recording] Recording started: rec_1765757323198_v5n45n0av
 POST /api/skills/start-recording 200 in 11.4s (compile: 1860ms, render: 9.5s)
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 10 actions from page
[ActionRecorder] Retrieved 8 actions from page
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] URL changed: https://www.google.com/ -> https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=c60b7adb80dd77ce&source=hp&ei=kFE_acHhJKeo0PEPqtm1oQw&iflsig=AOw8s4IAAAAAaT9foPtHK6x71gA0TOQil6nnTQGUQt4M&ved=0ahUKEwjB6dLSpr6RAxUnFDQIHapsLcQQ4dUDCBY&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESMw2UKwEWKcqcAF4AJABAJgBtgGgAYALqgEEMTkuMrgBDMgBAPgBAZgCFqACtQyoAgrCAgoQLhgDGI8BGOoCwgIKEAAYAxiPARjqAsICDhAuGIAEGLEDGMcBGNEDwgIOEAAYgAQYigUYsQMYgwHCAhEQLhiABBixAxiDARjHARjRA8ICDhAuGIAEGIoFGLEDGIMBwgIIEAAYgAQYsQPCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIIEC4YgAQYsQPCAgQQABgDmAMRkgcEMjAuMqAHg44BsgcEMTkuMrgHowzCBwgyLTE2LjUuMcgHkwGACAE&sclient=gws-wiz&sei=nlE_acHdL-q60PEPsdDYyA0
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765757323198_v5n45n0av',
  sessionId: '6572bbf3-26ff-4580-a1f1-96b6de806ab8',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1100µs, render: 11ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765757323198_v5n45n0av',
  sessionId: '6572bbf3-26ff-4580-a1f1-96b6de806ab8',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765757323198_v5n45n0av', actionsCount: 23 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 23 raw actions...
[ActionRecorder] Grouped into 3 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 3 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=c60b7adb80dd77ce&source=hp&ei=kFE_acHhJKeo0PEPqtm1oQw&iflsig=AOw8s4IAAAAAaT9foPtHK6x71gA0TOQil6nnTQGUQt4M&ved=0ahUKEwjB6dLSpr6RAxUnFDQIHapsLcQQ4dUDCBY&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESMw2UKwEWKcqcAF4AJABAJgBtgGgAYALqgEEMTkuMrgBDMgBAPgBAZgCFqACtQyoAgrCAgoQLhgDGI8BGOoCwgIKEAAYAxiPARjqAsICDhAuGIAEGLEDGMcBGNEDwgIOEAAYgAQYigUYsQMYgwHCAhEQLhiABBixAxiDARjHARjRA8ICDhAuGIAEGIoFGLEDGIMBwgIIEAAYgAQYsQPCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIIEC4YgAQYsQPCAgQQABgDmAMRkgcEMjAuMqAHg44BsgcEMTkuMrgHowzCBwgyLTE2LjUuMcgHkwGACAE&sclient=gws-wiz&sei=nlE_acHdL-q60PEPsdDYyA0',
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
      description: "Main answer or featured snippet text about Brad Pitt's age"
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
  instruction: "Extract the main answer about Brad Pitt's age from the search results.",
  description: "Extracts the main search result and relevant details about Brad Pitt's age from Google search."
}
[finishRecordingStep] Generated test schema: {
  fields: 3,
  instruction: "Extract the main answer about Brad Pitt's age from the search results."
}
[finishRecordingStep] ✅ Extraction test PASSED
[finishRecordingStep] Released keep-alive session
[finishRecordingStep] Extracted semantic values: [
  {
    value: 'how old is brad pitt?',
    type: 'text-input',
    label: 'Fill Search',
    actionIndex: 1
  }
]
[finishRecordingStep] Goal appears vague, inferring structured goal...
[finishRecordingStep] Original goal: google search
[Goal Inference] Analyzing user intent: {
  userIntent: 'google search',
  demoQuery: 'how old is brad pitt?',
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
  mappings: { 'how old is brad pitt?': '%query%' },
  explanation: "The captured value 'how old is brad pitt?' is a text-input type and matches the semantic meaning of the variable '%query%' in the goal 'Search Google for %query% and extract the answer.' The context 'Fill Search' indicates it is the search query, aligning with the variable name '%query%'."
}
[finishRecordingStep] Variable mapping (enhanced): { 'how old is brad pitt?': '%query%' }
[finishRecordingStep] Applied variable mapping to 1 actions
[finishRecordingStep] Prepended initial navigation to: https://www.google.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (8.3s later)
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
[replayWorkflow] Reverse-substituted variable: { from: '%query%', to: 'how old is brad pitt?' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Press Enter to submit search
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[finishRecordingStep] Validation session closed successfully
[finishRecordingStep] Skill saved to database: skill_1765757368581_46eus0moo
 POST /.well-known/workflow/v1/step 200 in 16.9s (compile: 1386µs, render: 16.9s)
 POST /.well-known/workflow/v1/flow 200 in 10ms (compile: 862µs, render: 9ms)
[POST /api/skills/finish-recording] Skill created: skill_1765757368581_46eus0moo
 POST /api/skills/finish-recording 200 in 17.6s (compile: 427ms, render: 17.2s)
 GET /skills/skill_1765757368581_46eus0moo 200 in 1513ms (compile: 1491ms, render: 22ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765757368581_46eus0moo
[GET /api/skills/[skillId]] Fetching skill: skill_1765757368581_46eus0moo
 GET /api/skills/skill_1765757368581_46eus0moo 200 in 1132ms (compile: 1103ms, render: 28ms)
 GET /api/skills/skill_1765757368581_46eus0moo 200 in 1268ms (compile: 1104ms, render: 164ms)
