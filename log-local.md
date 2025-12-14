ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1804ms
Created steps bundle 27ms
Created intermediate workflow bundle 10ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.98:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.7s
Discovering workflow directives 2103ms
Created steps bundle 19ms
Created intermediate workflow bundle 11ms
 ○ Compiling /skills/record ...
 GET /skills/record 200 in 1152ms (compile: 794ms, render: 358ms)
Discovering workflow directives 3269ms
Created steps bundle 24ms
Created intermediate workflow bundle 8ms
(node:28406) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 162ms (compile: 149ms, render: 13ms)
[startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[startRecordingStep] Creating Browserbase session
[startRecordingStep] Browserbase response: {
  id: 'e4226230-5d54-4c38-b0be-c3c3fe90e5c5',
  createdAt: '2025-12-14T20:31:23.150429+00:00',
  updatedAt: '2025-12-14T20:31:23.150429+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T20:31:23.14+00:00',
  expiresAt: '2025-12-14T20:36:23.14+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.BC8yP9mOVWAXKHsZfor067ckMnyHYvVZHz95ZQAWU6t2Mi4itxcXRQ.Yfe0355-nXw5p5r8.euCStWBVfX9Hds6aAxlL_ztNW-QRckaqwteZcJgp41qGRK2gt39lwayCsVLu4OucQjntq1qeW-PP_ZgUGewv3GPIW-Aux6rIUbKMadESbGHEvo4lbLbdLdiH4oRhPCQleP8EiqKX9Jb1kVldQWx3p6D240hdeSXOR8wBSld3CbttjNzPQa_hFxpfxTS8hfscCwQ0ySzHmBBW9MBNvA48t_FyE7yjBd0c6RQ89anaafkzEkzkFtxGM189HrEjjyRVfFM2QtuOHbv2PGNbmyZHQwKjDi_CAy2IcKMycPUpk8PaQkybBho4X5oWOW0wx1oDTmNSLQgW7DXWJPE75Rwu53rXdMkCu_dYUIzImOqKZsn-9MO1WEX3thMKHxDawIZovquFF1rriT34LOtZ4C8pWD_YHJfJPRa__-A0tZ0U8DDheuEYgYmTDhpdZ5orgyD0.7xNjBK8MqBaCrAffiuJZPw',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.BC8yP9mOVWAXKHsZfor067ckMnyHYvVZHz95ZQAWU6t2Mi4itxcXRQ.Yfe0355-nXw5p5r8.euCStWBVfX9Hds6aAxlL_ztNW-QRckaqwteZcJgp41qGRK2gt39lwayCsVLu4OucQjntq1qeW-PP_ZgUGewv3GPIW-Aux6rIUbKMadESbGHEvo4lbLbdLdiH4oRhPCQleP8EiqKX9Jb1kVldQWx3p6D240hdeSXOR8wBSld3CbttjNzPQa_hFxpfxTS8hfscCwQ0ySzHmBBW9MBNvA48t_FyE7yjBd0c6RQ89anaafkzEkzkFtxGM189HrEjjyRVfFM2QtuOHbv2PGNbmyZHQwKjDi_CAy2IcKMycPUpk8PaQkybBho4X5oWOW0wx1oDTmNSLQgW7DXWJPE75Rwu53rXdMkCu_dYUIzImOqKZsn-9MO1WEX3thMKHxDawIZovquFF1rriT34LOtZ4C8pWD_YHJfJPRa__-A0tZ0U8DDheuEYgYmTDhpdZ5orgyD0.7xNjBK8MqBaCrAffiuJZPw'
}
[startRecordingStep] Browserbase session created: e4226230-5d54-4c38-b0be-c3c3fe90e5c5
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/e4226230-5d54-4c38-b0be-c3c3fe90e5c5/devtools/page/A460A84FE7D3E92D97EAB075967C499D?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.google.com/
[ActionRecorder] Starting recording
[ActionRecorder] Initial URL: https://www.google.com/
[ActionRecorder] Started recording
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 5.3s (compile: 322ms, render: 5.0s)
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 3ms, render: 10ms)
[POST /api/skills/start-recording] Recording started: rec_1765744282922_wikh1730h
 POST /api/skills/start-recording 200 in 8.1s (compile: 1534ms, render: 6.6s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] Retrieved 4 actions from page
[ActionRecorder] Retrieved 6 actions from page
[ActionRecorder] URL changed: https://www.google.com/ -> https://www.google.com/search?q=brad+pitt%27s+age&sca_esv=a0bb12506671175f&source=hp&ei=nh4_aZfQFNex0PEP4YyKiAU&iflsig=AOw8s4IAAAAAaT8srk9I-s5FzuTuWf3v6sMSZAXwJ4Ye&ved=0ahUKEwiXl86H9r2RAxXXGDQIHWGGAlEQ4dUDCBY&oq=brad+pitt%27s+age&gs_lp=Egdnd3Mtd2l6Ig9icmFkIHBpdHQncyBhZ2UyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB5Il0NQjgxYrDRwAXgAkAEAmAHnAaABzAqqAQYxMy4xLjG4AQzIAQD4AQGYAhCgAswLqAIKwgIKEAAYAxjqAhiPAcICChAuGAMY6gIYjwHCAg4QLhiABBixAxiDARiKBcICERAuGIAEGLEDGNEDGIMBGMcBwgILEAAYgAQYsQMYgwHCAgsQLhiABBixAxiDAcICBBAAGAPCAggQABiABBixA8ICCxAuGIAEGNEDGMcBwgIOEAAYgAQYsQMYigUYjQbCAggQLhiABBixA8ICDhAAGIAEGLEDGIMBGIoFwgIFEC4YgATCAgsQLhiABBjHARivAZgDCvEFlwi0S-UE9zWSBwYxMi4zLjGgB7uqAbIHBjExLjMuMbgHwQvCBwYyLTEzLjPIB2WACAA&sclient=gws-wiz&sei=rB4_aaHBNubf0PEPzfm9yQw
[ActionRecorder] Re-injecting script after navigation
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765744282922_wikh1730h',
  sessionId: 'e4226230-5d54-4c38-b0be-c3c3fe90e5c5',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1950µs, render: 12ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765744282922_wikh1730h',
  sessionId: 'e4226230-5d54-4c38-b0be-c3c3fe90e5c5',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765744282922_wikh1730h', actionsCount: 17 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 17 raw actions...
[ActionRecorder] Grouped into 3 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 3 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=brad+pitt%27s+age&sca_esv=a0bb12506671175f&source=hp&ei=nh4_aZfQFNex0PEP4YyKiAU&iflsig=AOw8s4IAAAAAaT8srk9I-s5FzuTuWf3v6sMSZAXwJ4Ye&ved=0ahUKEwiXl86H9r2RAxXXGDQIHWGGAlEQ4dUDCBY&oq=brad+pitt%27s+age&gs_lp=Egdnd3Mtd2l6Ig9icmFkIHBpdHQncyBhZ2UyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMgYQABgWGB5Il0NQjgxYrDRwAXgAkAEAmAHnAaABzAqqAQYxMy4xLjG4AQzIAQD4AQGYAhCgAswLqAIKwgIKEAAYAxjqAhiPAcICChAuGAMY6gIYjwHCAg4QLhiABBixAxiDARiKBcICERAuGIAEGLEDGNEDGIMBGMcBwgILEAAYgAQYsQMYgwHCAgsQLhiABBixAxiDAcICBBAAGAPCAggQABiABBixA8ICCxAuGIAEGNEDGMcBwgIOEAAYgAQYsQMYigUYjQbCAggQLhiABBixA8ICDhAAGIAEGLEDGIMBGIoFwgIFEC4YgATCAgsQLhiABBjHARivAZgDCvEFlwi0S-UE9zWSBwYxMi4zLjGgB7uqAbIHBjExLjMuMbgHwQvCBwYyLTEzLjPIB2WACAA&sclient=gws-wiz&sei=rB4_aaHBNubf0PEPzfm9yQw',
  title: "brad pitt's age - Google Search",
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
    value: "brad pitt's age",
    type: 'text-input',
    label: 'Fill Search',
    actionIndex: 1
  }
]
[finishRecordingStep] Goal appears vague, inferring structured goal...
[finishRecordingStep] Original goal: google search
[Goal Inference] Analyzing user intent: {
  userIntent: 'google search',
  demoQuery: "brad pitt's age",
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
  mappings: { "brad pitt's age": '%query%' },
  explanation: `The captured value "brad pitt's age" is a text input used in the context of filling a search query. The goal is to search Google for a specific query, which directly corresponds to the variable %query%. Therefore, the value maps to %query% based on its semantic meaning and context.`
}
[finishRecordingStep] Variable mapping (enhanced): { "brad pitt's age": '%query%' }
[finishRecordingStep] Applied variable mapping to 1 actions
[finishRecordingStep] Prepended initial navigation to: https://www.google.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (7.7s later)
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
[replayWorkflow] Reverse-substituted variable: { from: '%query%', to: "brad pitt's age" }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Press Enter to submit search
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[finishRecordingStep] Validation session closed successfully
[finishRecordingStep] Skill saved to database: skill_1765744328219_g98c7qpuw
 POST /.well-known/workflow/v1/step 200 in 19.9s (compile: 1904µs, render: 19.9s)
 POST /.well-known/workflow/v1/flow 200 in 11ms (compile: 972µs, render: 10ms)
[POST /api/skills/finish-recording] Skill created: skill_1765744328219_g98c7qpuw
 POST /api/skills/finish-recording 200 in 20.7s (compile: 457ms, render: 20.2s)
 GET /skills/skill_1765744328219_g98c7qpuw 200 in 1300ms (compile: 1279ms, render: 21ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765744328219_g98c7qpuw
[GET /api/skills/[skillId]] Fetching skill: skill_1765744328219_g98c7qpuw
 GET /api/skills/skill_1765744328219_g98c7qpuw 200 in 1120ms (compile: 1090ms, render: 30ms)
 GET /api/skills/skill_1765744328219_g98c7qpuw 200 in 1264ms (compile: 1091ms, render: 173ms)
