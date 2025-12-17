ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1393ms
Created steps bundle 16ms
Created intermediate workflow bundle 7ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.2s
 GET /skills/record 200 in 2.8s (compile: 2.5s, render: 257ms)
(node:71997) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'product price search on Amazon',
  startUrl: 'https://www.amazon.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 171ms (compile: 158ms, render: 13ms)
[startRecordingStep] Starting recording {
  goal: 'product price search on Amazon',
  startUrl: 'https://www.amazon.com/',
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
  id: '4c3f6dc9-7f01-4c2f-a46a-a23d876a7903',
  createdAt: '2025-12-17T19:49:24.437173+00:00',
  updatedAt: '2025-12-17T19:49:24.437173+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-17T19:49:24.425+00:00',
  expiresAt: '2025-12-17T19:54:24.425+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com/?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.LG34eS92Q-sfAnPk4pxgv10P-Ot-j6jyoZhuI4CPf6zqWw-anlnIDA.BR99b3Ou58t8mkrl.xn0g-PxuBXJ_zr36eQQU8SOYsGuWiwO64Od9vLShAKug6TWL2Sd8lXvmw5buBQdX7lepz6fnUKYDTGI8Q_a_z6morDVjCsTIoAaj_FmqutZu62Go3HjFdcV4Xa9hIKxLurqaoXyhIAQjhBXqVneDbrMfTeJn4Q2TMa10YxfXE6gyDEumZZYDrOBVyBVYUU_OnNK-Q3ewOKhMYvNnqQEAYUGtHuE6QLn2nKLuYycVmzvd0e3FmTiq3WZQ28vcBc9tNNlzDhxkNfmWeqd0JjnqXwzEjnX1laeOrf7xxTx5M2Q6iR0U1feB24NBc5jq3s2hDNlzOGBJSSZFWhPq2IMQeLPG2JrcXc3PuC35hY_tM48zNumPCTIJV6MMgwdINCH2HnF7J3iT-QwhJFTJFQllqfQtiiY7oPAq90HW7h3WsQnQRyya5-yhaguGuodrycOy.kJM5wqOpXQzFz3fBYFpV4Q',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.LG34eS92Q-sfAnPk4pxgv10P-Ot-j6jyoZhuI4CPf6zqWw-anlnIDA.BR99b3Ou58t8mkrl.xn0g-PxuBXJ_zr36eQQU8SOYsGuWiwO64Od9vLShAKug6TWL2Sd8lXvmw5buBQdX7lepz6fnUKYDTGI8Q_a_z6morDVjCsTIoAaj_FmqutZu62Go3HjFdcV4Xa9hIKxLurqaoXyhIAQjhBXqVneDbrMfTeJn4Q2TMa10YxfXE6gyDEumZZYDrOBVyBVYUU_OnNK-Q3ewOKhMYvNnqQEAYUGtHuE6QLn2nKLuYycVmzvd0e3FmTiq3WZQ28vcBc9tNNlzDhxkNfmWeqd0JjnqXwzEjnX1laeOrf7xxTx5M2Q6iR0U1feB24NBc5jq3s2hDNlzOGBJSSZFWhPq2IMQeLPG2JrcXc3PuC35hY_tM48zNumPCTIJV6MMgwdINCH2HnF7J3iT-QwhJFTJFQllqfQtiiY7oPAq90HW7h3WsQnQRyya5-yhaguGuodrycOy.kJM5wqOpXQzFz3fBYFpV4Q'
}
[startRecordingStep] Browserbase session created: 4c3f6dc9-7f01-4c2f-a46a-a23d876a7903
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/4c3f6dc9-7f01-4c2f-a46a-a23d876a7903/devtools/page/3A395616A42EE33835D274D782ABFAE0?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.amazon.com/
[ActionRecorder] Starting recording
[ActionRecorder] Installing monitoring script (attempt 1/3)...
[ActionRecorder] Setting up addInitScript for future navigations
[ActionRecorder] Injecting script on current page
[ActionRecorder] ✅ Monitoring script installed successfully
[ActionRecorder] Event listeners will automatically persist across navigations
[ActionRecorder] Event listener installation verified
[ActionRecorder] Initial URL: https://www.amazon.com/
[ActionRecorder] ✅ Started recording with persistent event listeners
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 9.8s (compile: 325ms, render: 9.5s)
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 2ms, render: 11ms)
[POST /api/skills/start-recording] Recording started: rec_1766000963826_bwqc0tvvr
 POST /api/skills/start-recording 200 in 12.0s (compile: 1529ms, render: 10.5s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 3 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 3 actions from page
[ActionRecorder] Retrieved 3 actions from page
[ActionRecorder] Retrieved 3 actions from page
[ActionRecorder] Retrieved 4 actions from page
[ActionRecorder] URL changed: https://www.amazon.com/ -> https://www.amazon.com/s?k=nintendo%20switch%202&i=aps&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17&crid=11JMEXE5JO4BO&sprefix=nintendo%20switch%202%2Caps%2C242
[ActionRecorder] Event listeners will auto-persist via addInitScript
[ActionRecorder] URL changed: https://www.amazon.com/s?k=nintendo%20switch%202&i=aps&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17&crid=11JMEXE5JO4BO&sprefix=nintendo%20switch%202%2Caps%2C242 -> https://www.amazon.com/s?k=nintendo+switch+2&crid=11JMEXE5JO4BO&sprefix=nintendo+switch+2%2Caps%2C242&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1766000963826_bwqc0tvvr',
  sessionId: '4c3f6dc9-7f01-4c2f-a46a-a23d876a7903',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 1860µs, render: 12ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1766000963826_bwqc0tvvr',
  sessionId: '4c3f6dc9-7f01-4c2f-a46a-a23d876a7903',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1766000963826_bwqc0tvvr', actionsCount: 20 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 20 raw actions...
[ActionRecorder] Grouped into 5 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 5 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.amazon.com/s?k=nintendo+switch+2&crid=11JMEXE5JO4BO&sprefix=nintendo+switch+2%2Caps%2C242&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17',
  title: 'Amazon.com : nintendo switch 2',
  headingCount: 5,
  hints: {
    hasPriceElements: true,
    hasDateElements: true,
    hasTableData: true,
    hasListItems: true,
    hasFormElements: true
  }
}
[finishRecordingStep] 🧪 Testing extraction schema before session close...
[Schema Generator] Analysis: {
  goal: 'product price search on Amazon',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: 'Current price with currency symbol for the product.'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Product title for validation.'
    },
    {
      name: 'availability',
      type: 'string',
      description: 'Stock availability status.'
    },
    {
      name: 'rating',
      type: 'string',
      description: 'Average customer rating.',
      optional: true
    },
    {
      name: 'productUrl',
      type: 'string',
      description: 'URL of the product page.'
    }
  ],
  instruction: 'Extract product price, title, availability, and rating from Amazon search results.',
  description: "Extracts product information from Amazon search results for 'nintendo switch 2'."
}
[finishRecordingStep] Generated test schema: {
  fields: 5,
  instruction: 'Extract product price, title, availability, and rating from Amazon search results.'
}
[finishRecordingStep] ✅ Extraction test PASSED
[finishRecordingStep] Released keep-alive session
[finishRecordingStep] Extracted semantic values: [
  {
    value: 'nint',
    type: 'text-input',
    label: 'Fill Search Amazon',
    actionIndex: 1
  },
  {
    value: 'nintendo switch 2',
    type: 'text-input',
    label: 'Fill Search Amazon',
    actionIndex: 2
  }
]
[finishRecordingStep] Goal appears vague, inferring structured goal...
[finishRecordingStep] Original goal: product price search on Amazon
[Goal Inference] Analyzing user intent: {
  userIntent: 'product price search on Amazon',
  demoQuery: 'nint',
  startUrl: 'https://www.amazon.com/',
  actionCount: 5
}
[Goal Inference] Inference result: {
  structuredGoal: 'Find price for %product% on Amazon',
  variables: [ '%product%' ],
  category: 'product_search',
  confidence: 0.95
}
[finishRecordingStep] Inferred goal: {
  original: 'product price search on Amazon',
  structured: 'Find price for %product% on Amazon',
  variables: [ '%product%' ],
  category: 'product_search',
  confidence: 0.95
}
[finishRecordingStep] ✅ Using inferred goal (confidence >= 0.7)
[Variable Detector Enhanced] Mapping result: {
  mappings: { nint: '%product%', 'nintendo switch 2': '%product%' },
  explanation: "In this task, the goal is to find the price for a product on Amazon. The variable in the goal is %product%. Both captured values ('nint' and 'nintendo switch 2') are related to the search query for a product on Amazon, which corresponds to the %product% variable. Since both values are text inputs used in the context of filling the search bar on Amazon, they both map to %product%."
}
[finishRecordingStep] Variable mapping (enhanced): { nint: '%product%', 'nintendo switch 2': '%product%' }
[finishRecordingStep] Applied variable mapping to 2 actions
[finishRecordingStep] Prepended initial navigation to: https://www.amazon.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.amazon.com/
[filterRedundantNavigations] 🚫 Detected result page navigation: https://www.amazon.com/s?k=nintendo%20switch%202&i=aps&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17&c
[filterRedundantNavigations]    Previous page: /
[filterRedundantNavigations]    Result page:   /s
[filterRedundantNavigations] ✓ Removed result page navigation, created submit action
[filterRedundantNavigations] Keeping navigation: https://www.amazon.com/s?k=nintendo+switch+2&crid=11JMEXE5JO4BO&sprefix=nintendo+switch+2%2Caps%2C24
[finishRecordingStep] Filtered actions: { before: 6, after: 6, removed: 0 }
[Schema Generator] Analysis: {
  goal: 'Find price for %product% on Amazon',
  hasVariables: true,
  variables: [ '%product%' ],
  contextProvided: true
}
[Schema Generator] Variable-based goal detected, using template: { category: 'product_search', variables: [ '%product%' ] }
[Schema Generator] Using template for category: product_search {
  fields: [
    'price',
    'title',
    'availability',
    'rating',
    'reviewCount',
    'seller',
    'shipping',
    'url'
  ],
  variables: [ '%product%' ]
}
[finishRecordingStep] Generated extraction schema: {
  fields: 8,
  instruction: 'Extract product details including price, title, availability, and ratings',
  withContext: true
}
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 6 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] Executing action: navigate Navigate to https://www.amazon.com/
[replayWorkflow] Executing action: act Click Search Amazon
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill Search Amazon with value %product%
[replayWorkflow] Reverse-substituted variable: { from: '%product%', to: 'nintendo switch 2' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill Search Amazon with value %product%endo switch 2
[replayWorkflow] Reverse-substituted variable: {
  from: '%product%endo switch 2',
  to: 'nintendo switch 2endo switch 2'
}
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Submit and wait for navigation
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: navigate Navigate to https://www.amazon.com/s?k=nintendo+switch+2&crid=11JMEXE5JO4BO&sprefix=nintendo+switch+2%2Caps%2C242&ref=nb_sb_ss_p13n-expert-pd-ops-ranker_1_17
[finishRecordingStep] Workflow validation successful
[2025-12-17T19:50:42.973Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
[2025-12-17T19:50:42.973Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
[2025-12-17T19:50:43.066Z] ERROR: Browserbase session status: COMPLETED
[finishRecordingStep] Session close timed out after 10s, continuing anyway
[finishRecordingStep] Skill saved to database: skill_1766001052448_2bq9oledp
 POST /.well-known/workflow/v1/step 200 in 42s (compile: 1872µs, render: 42s)
 POST /.well-known/workflow/v1/flow 200 in 10ms (compile: 1193µs, render: 9ms)
[POST /api/skills/finish-recording] Skill created: skill_1766001052448_2bq9oledp
 POST /api/skills/finish-recording 200 in 44s (compile: 500ms, render: 43s)
 GET /skills/skill_1766001052448_2bq9oledp 200 in 2.1s (compile: 2.1s, render: 26ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766001052448_2bq9oledp
 GET /api/skills/skill_1766001052448_2bq9oledp 200 in 1098ms (compile: 1074ms, render: 24ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766001052448_2bq9oledp
 GET /api/skills/skill_1766001052448_2bq9oledp 200 in 27ms (compile: 7ms, render: 20ms)
[PATCH /api/skills/[skillId]] Updating skill: skill_1766001052448_2bq9oledp {
  updatedAt: '2025-12-17T19:51:30.687Z',
  name: 'Amazon Product Price Search'
}
 PATCH /api/skills/skill_1766001052448_2bq9oledp 200 in 281ms (compile: 8ms, render: 273ms)
