ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1941ms
Created steps bundle 18ms
Created intermediate workflow bundle 6ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.98:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.8s
Discovering workflow directives 2290ms
Created steps bundle 24ms
Created intermediate workflow bundle 11ms
 ○ Compiling / ...
 GET / 200 in 3.6s (compile: 3.3s, render: 296ms)
 GET /skills 200 in 1954ms (compile: 1101ms, render: 854ms)
 GET /skills/record 200 in 609ms (compile: 592ms, render: 17ms)
(node:40150) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 166ms (compile: 149ms, render: 18ms)
[startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[startRecordingStep] Creating Browserbase session
[startRecordingStep] Browserbase response: {
  id: '9598b878-dc38-4e74-990c-108490906656',
  createdAt: '2025-12-14T20:45:09.948474+00:00',
  updatedAt: '2025-12-14T20:45:09.948474+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T20:45:09.938+00:00',
  expiresAt: '2025-12-14T20:50:09.938+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.tmv9pEeJu0vXtzemeS5i6hu9w-Oy9TXwUCvqaJQUj-2-h71FLEnSXw.OEKXQbQzfluev_t5.ZioS_Jwev1S92FmhqproQbujOODEYvrVKLmF7rusuL5ZV9nUAwKRPk0-dNIwyJ5Ad-VR_fc96gWZPuho0Nw1EdBPe5XEghsxLSNMTj-oParDfZtE7LGajEuGsP6C_-lBqF9WlEEjLZ3RJIsQPeJJgsz-dZQQJOmUx9BfpZ57XdCW6TC5e66zlpco70Y5nPS1KbU_I33rCqcDWwDuJFkyHrMyydoo72zl6m-0mSWcPpmZGy4v4-FlS5xuHgBFNIvxW8_A80xqSBJc-xjCteF6V-ToCpe4cedMi3cR03OInrU5iw204rgaMK64hrEjWqlm0-FkfiSuDep9kLyJbMFW9fOZmZCzKERJehjs24Q_cNvfx-l5xVRZIJnp3GUADNv_EhpTpIFXvKU0MiHGH5QbM7uM6hnsuzR5V61qgqtAEou_BkqgDKmRiF7zQ0SFBOP2.8wFgfE6pgUQDdTONN5h2eQ',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.tmv9pEeJu0vXtzemeS5i6hu9w-Oy9TXwUCvqaJQUj-2-h71FLEnSXw.OEKXQbQzfluev_t5.ZioS_Jwev1S92FmhqproQbujOODEYvrVKLmF7rusuL5ZV9nUAwKRPk0-dNIwyJ5Ad-VR_fc96gWZPuho0Nw1EdBPe5XEghsxLSNMTj-oParDfZtE7LGajEuGsP6C_-lBqF9WlEEjLZ3RJIsQPeJJgsz-dZQQJOmUx9BfpZ57XdCW6TC5e66zlpco70Y5nPS1KbU_I33rCqcDWwDuJFkyHrMyydoo72zl6m-0mSWcPpmZGy4v4-FlS5xuHgBFNIvxW8_A80xqSBJc-xjCteF6V-ToCpe4cedMi3cR03OInrU5iw204rgaMK64hrEjWqlm0-FkfiSuDep9kLyJbMFW9fOZmZCzKERJehjs24Q_cNvfx-l5xVRZIJnp3GUADNv_EhpTpIFXvKU0MiHGH5QbM7uM6hnsuzR5V61qgqtAEou_BkqgDKmRiF7zQ0SFBOP2.8wFgfE6pgUQDdTONN5h2eQ'
}
[startRecordingStep] Browserbase session created: 9598b878-dc38-4e74-990c-108490906656
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/9598b878-dc38-4e74-990c-108490906656/devtools/page/FCB3911F03B1C465463C8F6068078F2A?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.google.com/
[ActionRecorder] Starting recording
[ActionRecorder] Injecting monitoring script (attempt 1/3)...
[ActionRecorder] ✅ Monitoring script injected successfully
[ActionRecorder] Event listener injection verified
[ActionRecorder] Initial URL: https://www.google.com/
[ActionRecorder] ✅ Started recording with event listeners active
[startRecordingStep] ✅ Action recorder started with event listeners verified
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 5.9s (compile: 314ms, render: 5.6s)
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1420µs, render: 11ms)
[POST /api/skills/start-recording] Recording started: rec_1765745109737_152gjw5de
 POST /api/skills/start-recording 200 in 9.1s (compile: 1886ms, render: 7.2s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 6 actions from page
[ActionRecorder] Retrieved 6 actions from page
[ActionRecorder] Retrieved 6 actions from page
[ActionRecorder] Retrieved 3 actions from page
[ActionRecorder] URL changed: https://www.google.com/ -> https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=a0bb12506671175f&source=hp&ei=2SE_aa_vMJql0PEPgZHxoAI&iflsig=AOw8s4IAAAAAaT8v6eNLML4IGyaWCKc-DYS6VkqEuBFy&ved=0ahUKEwjvv5aS-b2RAxWaEjQIHYFIHCQQ4dUDCBE&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESJxOUMAFWKM9cAF4AJABAJgBU6AB-gmqAQIyMbgBDMgBAPgBAZgCFqACkQuoAgrCAgoQABgDGOoCGI8BwgIOEC4YgAQYsQMY0QMYxwHCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgIOEC4YgAQYsQMYgwEYigXCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQLhiABBixA8ICBBAAGAOYAwnxBUa2ZvL0ysp_kgcCMjKgB9aYAbIHAjIxuAeHC8IHBjItMjAuMsgHd4AIAA&sclient=gws-wiz
[ActionRecorder] Re-injecting script after navigation
[ActionRecorder] Injecting monitoring script (attempt 1/3)...
[ActionRecorder] ✅ Monitoring script injected successfully
[ActionRecorder] URL changed: https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=a0bb12506671175f&source=hp&ei=2SE_aa_vMJql0PEPgZHxoAI&iflsig=AOw8s4IAAAAAaT8v6eNLML4IGyaWCKc-DYS6VkqEuBFy&ved=0ahUKEwjvv5aS-b2RAxWaEjQIHYFIHCQQ4dUDCBE&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESJxOUMAFWKM9cAF4AJABAJgBU6AB-gmqAQIyMbgBDMgBAPgBAZgCFqACkQuoAgrCAgoQABgDGOoCGI8BwgIOEC4YgAQYsQMY0QMYxwHCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgIOEC4YgAQYsQMYgwEYigXCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQLhiABBixA8ICBBAAGAOYAwnxBUa2ZvL0ysp_kgcCMjKgB9aYAbIHAjIxuAeHC8IHBjItMjAuMsgHd4AIAA&sclient=gws-wiz -> https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=a0bb12506671175f&source=hp&ei=2SE_aa_vMJql0PEPgZHxoAI&iflsig=AOw8s4IAAAAAaT8v6eNLML4IGyaWCKc-DYS6VkqEuBFy&ved=0ahUKEwjvv5aS-b2RAxWaEjQIHYFIHCQQ4dUDCBE&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESJxOUMAFWKM9cAF4AJABAJgBU6AB-gmqAQIyMbgBDMgBAPgBAZgCFqACkQuoAgrCAgoQABgDGOoCGI8BwgIOEC4YgAQYsQMY0QMYxwHCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgIOEC4YgAQYsQMYgwEYigXCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQLhiABBixA8ICBBAAGAOYAwnxBUa2ZvL0ysp_kgcCMjKgB9aYAbIHAjIxuAeHC8IHBjItMjAuMsgHd4AIAA&sclient=gws-wiz&sei=6iE_abyCPYqP0PEPy6bP-A8
[ActionRecorder] Re-injecting script after navigation
[ActionRecorder] Injecting monitoring script (attempt 1/3)...
[ActionRecorder] ✅ Monitoring script injected successfully
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765745109737_152gjw5de',
  sessionId: '9598b878-dc38-4e74-990c-108490906656',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 2ms, render: 12ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765745109737_152gjw5de',
  sessionId: '9598b878-dc38-4e74-990c-108490906656',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765745109737_152gjw5de', actionsCount: 24 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 24 raw actions...
[ActionRecorder] Grouped into 4 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 4 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=a0bb12506671175f&source=hp&ei=2SE_aa_vMJql0PEPgZHxoAI&iflsig=AOw8s4IAAAAAaT8v6eNLML4IGyaWCKc-DYS6VkqEuBFy&ved=0ahUKEwjvv5aS-b2RAxWaEjQIHYFIHCQQ4dUDCBE&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESJxOUMAFWKM9cAF4AJABAJgBU6AB-gmqAQIyMbgBDMgBAPgBAZgCFqACkQuoAgrCAgoQABgDGOoCGI8BwgIOEC4YgAQYsQMY0QMYxwHCAg4QABiABBixAxiDARiKBcICCBAAGIAEGLEDwgIOEC4YgAQYsQMYgwEYigXCAgsQLhiABBixAxiDAcICCxAAGIAEGLEDGIMBwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQLhiABBixA8ICBBAAGAOYAwnxBUa2ZvL0ysp_kgcCMjKgB9aYAbIHAjIxuAeHC8IHBjItMjAuMsgHd4AIAA&sclient=gws-wiz&sei=6iE_abyCPYqP0PEPy6bP-A8',
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
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the page with the result',
      optional: true
    }
  ],
  instruction: 'Extract search results based on the query',
  description: 'Extracts main search result and relevant details'
}
[finishRecordingStep] Generated test schema: { fields: 4, instruction: 'Extract search results based on the query' }
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
  actionCount: 4
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
  explanation: "The captured value 'how old is brad pitt?' is a text-input type and matches the variable %query% based on the context of filling a search query in Google. The semantic meaning and context of the task align with the goal of searching Google for a specific query."
}
[finishRecordingStep] Variable mapping (enhanced): { 'how old is brad pitt?': '%query%' }
[finishRecordingStep] Applied variable mapping to 1 actions
[finishRecordingStep] Prepended initial navigation to: https://www.google.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (9.6s later)
[filterRedundantNavigations] ✓ Created submit action: Press Enter to submit search
[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after type (11.6s later)
[filterRedundantNavigations] ✓ Created submit action: Press Enter to submit search
[finishRecordingStep] Filtered actions: { before: 5, after: 5, removed: 0 }
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
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 5 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] Executing action: navigate Navigate to https://www.google.com/
[replayWorkflow] Executing action: act Click Search
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill Search with value %query%
[replayWorkflow] Reverse-substituted variable: { from: '%query%', to: 'how old is brad pitt?' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Press Enter to submit search
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Press Enter to submit search
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[finishRecordingStep] Validation session closed successfully
[finishRecordingStep] Skill saved to database: skill_1765745161125_6whrixo6c
 POST /.well-known/workflow/v1/step 200 in 20.7s (compile: 1259µs, render: 20.7s)
 POST /.well-known/workflow/v1/flow 200 in 9ms (compile: 846µs, render: 8ms)
[POST /api/skills/finish-recording] Skill created: skill_1765745161125_6whrixo6c
 POST /api/skills/finish-recording 200 in 21.7s (compile: 450ms, render: 21.2s)
 GET /skills/skill_1765745161125_6whrixo6c 200 in 1299ms (compile: 1276ms, render: 23ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1765745161125_6whrixo6c
[GET /api/skills/[skillId]] Fetching skill: skill_1765745161125_6whrixo6c
 GET /api/skills/skill_1765745161125_6whrixo6c 200 in 1085ms (compile: 1055ms, render: 30ms)
 GET /api/skills/skill_1765745161125_6whrixo6c 200 in 1232ms (compile: 1054ms, render: 178ms)
