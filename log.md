ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1981ms
Created steps bundle 36ms
Created intermediate workflow bundle 8ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 3.3s
Discovering workflow directives 2062ms
Created steps bundle 28ms
Created intermediate workflow bundle 16ms
 ○ Compiling /skills/record ...
 GET /skills/record 200 in 3.7s (compile: 3.4s, render: 309ms)
(node:42687) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  startUrl: 'https://www.farecompare.co.in/',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
 POST /.well-known/workflow/v1/flow 200 in 256ms (compile: 201ms, render: 55ms)
[startRecordingStep] Starting recording {
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  startUrl: 'https://www.farecompare.co.in/',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
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
  id: 'c9f05b18-130e-40cc-988e-649cc4a141eb',
  createdAt: '2025-12-20T20:37:38.382478+00:00',
  updatedAt: '2025-12-20T20:37:38.382478+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-20T20:37:38.373+00:00',
  expiresAt: '2025-12-20T20:42:38.373+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com/?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.JflXLUCzOTBM62SC3Ag047XH5VMNfks5xXjG0FsMc3IWAeqPQxnftg.yBEEIZVdnOC1FSrz.jpvveXgzpeIt4iGart07mQWKwkLPFQD5WPuWwh5qKSByWSygiBJ203U1MsE6mvc837dMjaENqSXJz_Or5VHXcPDPBKVrBq0wBA4iXDWUHw5m_WqmEwMLADzrvrwSPnwWkUd_xBNnsShMxyRaCANUZ9qp10qwSQ31n5krkboljHQuEDZO1LS8Uba5nr_tAJGzA2_h0WqDCtobeFAB64qp9otTiUPyBvYzm7v3932UFRmadS1bG17nvhNz9BXf8gSnHEDljOXXvurevjQgPsq_pblxOcSCX1lXYlY5lL_FBkg7ijAc3cv4pEHCDfOIAfVnLZQ3qNhKdrKEZdQYHGESGwXlz2DP9-B_CR8LV0CewYFa-tK86dnBM_6-XFQG5Z5NgB-jgdLBTvlQnXqihTMWTgS_RhpN0agtuTKm-dEUaVgjHA2zbVOw2iL1lyyEZffL.nQLzjs1mKsKt8xtLD-TzVQ',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.JflXLUCzOTBM62SC3Ag047XH5VMNfks5xXjG0FsMc3IWAeqPQxnftg.yBEEIZVdnOC1FSrz.jpvveXgzpeIt4iGart07mQWKwkLPFQD5WPuWwh5qKSByWSygiBJ203U1MsE6mvc837dMjaENqSXJz_Or5VHXcPDPBKVrBq0wBA4iXDWUHw5m_WqmEwMLADzrvrwSPnwWkUd_xBNnsShMxyRaCANUZ9qp10qwSQ31n5krkboljHQuEDZO1LS8Uba5nr_tAJGzA2_h0WqDCtobeFAB64qp9otTiUPyBvYzm7v3932UFRmadS1bG17nvhNz9BXf8gSnHEDljOXXvurevjQgPsq_pblxOcSCX1lXYlY5lL_FBkg7ijAc3cv4pEHCDfOIAfVnLZQ3qNhKdrKEZdQYHGESGwXlz2DP9-B_CR8LV0CewYFa-tK86dnBM_6-XFQG5Z5NgB-jgdLBTvlQnXqihTMWTgS_RhpN0agtuTKm-dEUaVgjHA2zbVOw2iL1lyyEZffL.nQLzjs1mKsKt8xtLD-TzVQ'
}
[startRecordingStep] Browserbase session created: c9f05b18-130e-40cc-988e-649cc4a141eb
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/c9f05b18-130e-40cc-988e-649cc4a141eb/devtools/page/E6974163AC224A559E97965A364F6F63?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  override existing env vars with { override: true }
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.farecompare.co.in/
[ActionRecorder] Starting recording
[ActionRecorder] Installing monitoring script (attempt 1/3)...
[ActionRecorder] Setting up addInitScript for future navigations
[ActionRecorder] Injecting script on current page
[ActionRecorder] ✅ Monitoring script installed successfully
[ActionRecorder] Event listeners will automatically persist across navigations
[ActionRecorder] Event listener installation verified
[ActionRecorder] Initial URL: https://www.farecompare.co.in/
[ActionRecorder] ✅ Started recording with persistent event listeners
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 8.5s (compile: 423ms, render: 8.1s)
 POST /.well-known/workflow/v1/flow 200 in 17ms (compile: 3ms, render: 14ms)
[POST /api/skills/start-recording] Recording started: rec_1766263057837_391puj9n4
 POST /api/skills/start-recording 200 in 12.0s (compile: 2.3s, render: 9.7s)
[ActionRecorder] Retrieved 8 actions from page
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] Retrieved 8 actions from page
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] URL changed: https://www.farecompare.co.in/ -> https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_date=2025-12-19&destination_iata=LAX&destination_name=Los+Angeles&infants=0&locale=en&marker=201840.Zze79a8b3ebe6b47258129ce2-201840&one_way=false&origin_iata=YVR&origin_name=Vancouver&return_date=2025-12-27&trip_class=0&with_request=true
[ActionRecorder] Event listeners will auto-persist via addInitScript
[ActionRecorder] URL changed: https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_date=2025-12-19&destination_iata=LAX&destination_name=Los+Angeles&infants=0&locale=en&marker=201840.Zze79a8b3ebe6b47258129ce2-201840&one_way=false&origin_iata=YVR&origin_name=Vancouver&return_date=2025-12-27&trip_class=0&with_request=true -> https://www.farecompare.co.in/flights/YVR2712LAX03011
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1766263057837_391puj9n4',
  sessionId: 'c9f05b18-130e-40cc-988e-649cc4a141eb',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
 POST /.well-known/workflow/v1/flow 200 in 21ms (compile: 1777µs, render: 19ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1766263057837_391puj9n4',
  sessionId: 'c9f05b18-130e-40cc-988e-649cc4a141eb',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1766263057837_391puj9n4', actionsCount: 29 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 29 raw actions...
[action-grouper] 🔍 Autocomplete pattern detected: {
  typedValue: 'vancouver',
  clickedText: 'Click "Vancouver, BC Canada"',
  clickSemanticType: 'autocomplete',
  clickSemanticValue: 'Vancouver, BC Canada',
  timeGap: '3387ms',
  detectionMethod: 'semantic-type'
}
[action-grouper] 🏷️  Autocomplete semantic label: { from: 'click', value: 'location', fallback: null, final: 'location' }
[action-grouper] ⏭️  Skipped hardcoded dropdown click: Click "Vancouver, BC Canada"
[action-grouper] ✅ Created autocomplete action with semanticType: autocomplete
[action-grouper] 🔍 Autocomplete pattern detected: {
  typedValue: 'los angeles',
  clickedText: 'Click "LAX"',
  clickSemanticType: 'autocomplete',
  clickSemanticValue: 'LAX',
  timeGap: '3175ms',
  detectionMethod: 'semantic-type'
}
[action-grouper] 🏷️  Autocomplete semantic label: { from: 'click', value: 'location', fallback: null, final: 'location' }
[action-grouper] ⏭️  Skipped hardcoded dropdown click: Click "LAX"
[action-grouper] ✅ Created autocomplete action with semanticType: autocomplete
[ActionRecorder] Grouped into 9 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 9 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.farecompare.co.in/flights/YVR2712LAX03011',
  title: 'Vancouver - Los Angeles, 2025-12-19 - 2025-12-27 - Flights search',
  headingCount: 3,
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
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  hasVariables: true,
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ],
  contextProvided: true
}
[Schema Generator] Variable-based goal detected, using template: {
  category: 'flight_search',
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ]
}
[Schema Generator] Using template for category: flight_search {
  fields: [
    'price',
    'airline',
    'route',
    'departureTime',
    'arrivalTime',
    'duration',
    'stops',
    'bookingUrl'
  ],
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ]
}
[finishRecordingStep] Generated test schema: {
  fields: 8,
  instruction: 'Extract flight details including price, airline, route, and timing information'
}
[finishRecordingStep] ✅ Extraction test PASSED
[finishRecordingStep] Released keep-alive session
[finishRecordingStep] Extracted semantic values (filtered): [
  {
    value: 'Vancouver, BC Canada',
    type: 'autocomplete',
    label: 'location',
    actionIndex: 1
  },
  {
    value: 'LAX',
    type: 'autocomplete',
    label: 'location',
    actionIndex: 3
  }
]
[Variable Detector Enhanced] Mapping result: {
  mappings: { 'Vancouver, BC Canada': '%origin%', LAX: '%destination%' },
  explanation: "Based on the semantic meaning and context, the first location value 'Vancouver, BC Canada' is mapped to '%origin%' as it is the starting point of the flight search. The second location value 'LAX' is mapped to '%destination%' as it is the endpoint of the flight search. The order of occurrence helps determine which location is the origin and which is the destination."
}
[finishRecordingStep] Variable mapping (enhanced): { 'Vancouver, BC Canada': '%origin%', LAX: '%destination%' }
[Variable Mapping] Semantic match: "vancouver" → %origin% (via semanticValue: "Vancouver, BC Canada")
[finishRecordingStep] 🔍 Dropdown detected: {
  type: 'type',
  selector: '#flights-origin-prepop-whitelabel_en',
  dropdownType: 'autocomplete',
  isInIframe: false,
  confidence: 'high',
  semanticType: 'autocomplete'
}
[Variable Mapping] Semantic match: "los angeles" → %destination% (via semanticValue: "LAX")
[finishRecordingStep] 🔍 Dropdown detected: {
  type: 'type',
  selector: '#flights-destination-prepop-whitelabel_en',
  dropdownType: 'autocomplete',
  isInIframe: false,
  confidence: 'high',
  semanticType: 'autocomplete'
}
[finishRecordingStep] Applied variable mapping to 2 actions
[finishRecordingStep] Prepended initial navigation to: https://www.farecompare.co.in/
[filterRedundantNavigations] Keeping initial navigation: https://www.farecompare.co.in/
[filterRedundantNavigations] 🚫 Detected result page navigation: https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_
[filterRedundantNavigations]    Previous page: /
[filterRedundantNavigations]    Result page:   /flights
[filterRedundantNavigations] ✓ Removed result page navigation, created submit action
[filterRedundantNavigations] 🚫 Detected result page navigation: https://www.farecompare.co.in/flights/YVR2712LAX03011
[filterRedundantNavigations]    Previous page: /flights
[filterRedundantNavigations]    Result page:   /flights/YVR2712LAX03011
[filterRedundantNavigations] ✓ Removed result page navigation, created submit action
[finishRecordingStep] Filtered actions: { before: 10, after: 10, removed: 0 }
[finishRecordingStep] 🧠 Running LLM semantic inference for actions without metadata...
[Semantic Inference] LLM inferred metadata for actions: {
  inferences: [
    {
      actionIndex: 7,
      semanticType: 'date-picker',
      semanticValue: '2023-12-19',
      semanticLabel: 'depart date'
    },
    {
      actionIndex: 8,
      semanticType: 'date-picker',
      semanticValue: '2024-01-03',
      semanticLabel: 'return date'
    }
  ]
}
[finishRecordingStep] ✅ Semantic enrichment complete
[finishRecordingStep] 📝 Found field opener with label: { label: 'Origin', actionIndex: 1 }
[finishRecordingStep] ✅ Applied field label to autocomplete: { oldLabel: 'location', newLabel: 'Origin', actionIndex: 2 }
[finishRecordingStep] 📝 Found field opener with label: { label: 'Origin', actionIndex: 2 }
[finishRecordingStep] ✅ Applied field label to autocomplete: { oldLabel: 'location', newLabel: 'Origin', actionIndex: 4 }
[finishRecordingStep] 📝 Found field opener with label: { label: 'Destination', actionIndex: 3 }
[finishRecordingStep] ✅ Applied field label to autocomplete: { oldLabel: 'Origin', newLabel: 'Destination', actionIndex: 4 }
[finishRecordingStep] 📝 Found field opener with label: { label: 'Destination', actionIndex: 4 }
[finishRecordingStep] 📝 Found field opener with label: { label: 'Depart date', actionIndex: 5 }
[finishRecordingStep] ⏭️  Filtering out non-date widget opener: Click field with placeholder "Origin"
[finishRecordingStep] ⏭️  Filtering out non-date widget opener: Click field with placeholder "Destination"
[finishRecordingStep] ✅ Keeping date picker opener: Click field with placeholder "Depart date"
[finishRecordingStep] ✅ Keeping semantic click: Click "19" (type: date-picker)
[finishRecordingStep] ✅ Keeping semantic click: Click "27" (type: date-picker)
[finishRecordingStep] Filtered intermediate clicks: { before: 10, after: 8, removed: 2 }
[Schema Generator] Analysis: {
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  hasVariables: true,
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ],
  contextProvided: true
}
[Schema Generator] Variable-based goal detected, using template: {
  category: 'flight_search',
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ]
}
[Schema Generator] Using template for category: flight_search {
  fields: [
    'price',
    'airline',
    'route',
    'departureTime',
    'arrivalTime',
    'duration',
    'stops',
    'bookingUrl'
  ],
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ]
}
[finishRecordingStep] Generated extraction schema: {
  fields: 8,
  instruction: 'Extract flight details including price, airline, route, and timing information',
  withContext: true
}
[finishRecordingStep] Deduped autocomplete actions: { before: 8, after: 8, removed: 0 }
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 8 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] ✅ Keeping date field opener: Click field with placeholder "Depart date"
[replayWorkflow] Filtered workflow: { original: 8, executable: 8, skipped: 0 }
[replayWorkflow] Executing action: navigate Navigate to https://www.farecompare.co.in/
[replayWorkflow] Executing action: act Type %origin% into the Origin field
[replayWorkflow] Reverse-substituted variable: { from: '%origin%', to: 'Vancouver, BC Canada' }
[2025-12-20T20:38:48.722Z] DEBUG: css pierce-fallback
    frameId: 19333CF26D6C28906136364837DF94A9
    selector: #flights-origin-prepop-whitelabel_en
[replayWorkflow] Exact selector failed, using observe→act fallback: Could not find an element for the given xPath(s): #flights-origin-prepop-whitelabel_en
[replayWorkflow] 🏷️  Semantic type added: autocomplete
[replayWorkflow] Observing for: autocomplete element: Type %origin% into the Origin field
[replayWorkflow] ⚠️  observe failed, using natural language
[replayWorkflow] Executing action: act Type %destination% into the Destination field
[replayWorkflow] Reverse-substituted variable: { from: '%destination%', to: 'LAX' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] 🎯 Autocomplete detected - field filled successfully (dropdown selection happens during execution)
[replayWorkflow] Executing action: act Click field with placeholder "Depart date"
[replayWorkflow] 🗓️  Date field opener clicked, waiting for calendar widget...
[replayWorkflow] ✓ Calendar widget visible
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click the date picker cell for depart date showing day 19
[2025-12-20T20:38:58.429Z] DEBUG: xpath main-world
    frameId: 19333CF26D6C28906136364837DF94A9
    xp: //*[@id="mewtwo-datepicker-2025-12-19"]/div[1]
    ctxId: 3
[replayWorkflow] 🗓️  Date field opener clicked, waiting for calendar widget...
[replayWorkflow] ✓ Calendar widget visible
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click the date picker cell for return date showing day 3
[2025-12-20T20:38:59.563Z] DEBUG: xpath main-world
    frameId: 19333CF26D6C28906136364837DF94A9
    xp: //*[@id="mewtwo-datepicker-2025-12-27"]/div[1]
    ctxId: 3
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Submit and wait for navigation
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Submit and wait for navigation
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[finishRecordingStep] Validation session closed successfully
[finishRecordingStep] Skill saved to database: skill_1766263143415_232igft55
 POST /.well-known/workflow/v1/step 200 in 32.1s (compile: 2ms, render: 32.1s)
 POST /.well-known/workflow/v1/flow 200 in 8ms (compile: 954µs, render: 7ms)
[POST /api/skills/finish-recording] Skill created: skill_1766263143415_232igft55
 POST /api/skills/finish-recording 200 in 33.8s (compile: 532ms, render: 33.3s)
 GET /skills/skill_1766263143415_232igft55 200 in 2.4s (compile: 2.3s, render: 31ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766263143415_232igft55
 GET /api/skills/skill_1766263143415_232igft55 200 in 1079ms (compile: 1054ms, render: 25ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766263143415_232igft55
 GET /api/skills/skill_1766263143415_232igft55 200 in 29ms (compile: 6ms, render: 23ms)
