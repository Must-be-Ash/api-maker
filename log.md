ashnouruzi@C357PRGCH2 api-maker % rm -rf .next
ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1937ms
Created steps bundle 25ms
Created intermediate workflow bundle 10ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.58:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.7s
Discovering workflow directives 2485ms
Created steps bundle 23ms
Created intermediate workflow bundle 12ms
 ○ Compiling /skills/record ...
 GET /skills/record 200 in 4.0s (compile: 3.6s, render: 325ms)
(node:20491) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  startUrl: 'https://www.farecompare.co.in/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 170ms (compile: 148ms, render: 21ms)
[startRecordingStep] Starting recording {
  goal: 'Find the cheapest flight from %origin% to %destination% for dates %start_date% to %end_date%',
  startUrl: 'https://www.farecompare.co.in/',
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
  id: '3a54498d-44a7-49c5-a164-59b2cae1c225',
  createdAt: '2025-12-19T20:08:51.689039+00:00',
  updatedAt: '2025-12-19T20:08:51.689039+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-19T20:08:51.679+00:00',
  expiresAt: '2025-12-19T20:13:51.679+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com/?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.tdFMD_sXmImHDMKoA0imtcxbDjOnKCwI5_C3jg5oW3ymbdPRQPYyrw.TvXl2F0bU-F5UdnK.IOrkRm3r0WkO_p4QHCsyqM3h-_d-mj1Tq1riMhTSDjcSbBde44TZmmOYdijSQWdW_q0FZg2jBda2xsgaQz_ATajiiJkDTyqeiRoVR4G4Fwu9CGFoztdG6WOcsWKQWMcyrOqLKlHX_JJQUyZg5NNNLvJqIGEf_RPkQvyuuKa2AQucDtEpMgtnrvcs28p9SIHnPAGhdvsLPGFafSPKUvvX5gfnSSb8MVMCXaZxfXLXVZNs8ctVfuWP1OM4xdP_i3t91zeMwoZfoaqEfGjH_NPvpY_3hPmHpc20IiKvOE_MBb6JrPktzjxeUBcRSAcQE5CLwp9vmd9QwleUvquYYWI5zwR8GW7DfaKpgmtpZcHouUM8gAPZILHl-F0inM_vKlJKnpo2TMWOJKDjsmhij6St4NZRnaMXiyq0XEQuWxCtJfQRz0_NscKxW3kLRVVw32BR.ZtFOY85-RkZoMIi9OKefJA',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.tdFMD_sXmImHDMKoA0imtcxbDjOnKCwI5_C3jg5oW3ymbdPRQPYyrw.TvXl2F0bU-F5UdnK.IOrkRm3r0WkO_p4QHCsyqM3h-_d-mj1Tq1riMhTSDjcSbBde44TZmmOYdijSQWdW_q0FZg2jBda2xsgaQz_ATajiiJkDTyqeiRoVR4G4Fwu9CGFoztdG6WOcsWKQWMcyrOqLKlHX_JJQUyZg5NNNLvJqIGEf_RPkQvyuuKa2AQucDtEpMgtnrvcs28p9SIHnPAGhdvsLPGFafSPKUvvX5gfnSSb8MVMCXaZxfXLXVZNs8ctVfuWP1OM4xdP_i3t91zeMwoZfoaqEfGjH_NPvpY_3hPmHpc20IiKvOE_MBb6JrPktzjxeUBcRSAcQE5CLwp9vmd9QwleUvquYYWI5zwR8GW7DfaKpgmtpZcHouUM8gAPZILHl-F0inM_vKlJKnpo2TMWOJKDjsmhij6St4NZRnaMXiyq0XEQuWxCtJfQRz0_NscKxW3kLRVVw32BR.ZtFOY85-RkZoMIi9OKefJA'
}
[startRecordingStep] Browserbase session created: 3a54498d-44a7-49c5-a164-59b2cae1c225
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/3a54498d-44a7-49c5-a164-59b2cae1c225/devtools/page/3D566777BD77D3918E57E100E1F02612?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
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
 POST /.well-known/workflow/v1/step 200 in 8.3s (compile: 378ms, render: 7.9s)
 POST /.well-known/workflow/v1/flow 200 in 15ms (compile: 2ms, render: 12ms)
[POST /api/skills/start-recording] Recording started: rec_1766174931271_p2y53v3d6
 POST /api/skills/start-recording 200 in 11.4s (compile: 1993ms, render: 9.4s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 9 actions from page
[ActionRecorder] Retrieved 4 actions from page
[ActionRecorder] Retrieved 9 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] URL changed: https://www.farecompare.co.in/ -> https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_date=2025-12-19&destination_iata=LAX&destination_name=Los+Angeles&infants=0&locale=en&marker=201840.Zzab2b9800e4bc419b8939b16-201840&one_way=false&origin_iata=YVR&origin_name=Vancouver&return_date=2025-12-26&trip_class=0&with_request=true
[ActionRecorder] Event listeners will auto-persist via addInitScript
[ActionRecorder] URL changed: https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_date=2025-12-19&destination_iata=LAX&destination_name=Los+Angeles&infants=0&locale=en&marker=201840.Zzab2b9800e4bc419b8939b16-201840&one_way=false&origin_iata=YVR&origin_name=Vancouver&return_date=2025-12-26&trip_class=0&with_request=true -> https://www.farecompare.co.in/flights/YVR1912LAX26121
[ActionRecorder] Event listeners will auto-persist via addInitScript
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1766174931271_p2y53v3d6',
  sessionId: '3a54498d-44a7-49c5-a164-59b2cae1c225',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1119µs, render: 12ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1766174931271_p2y53v3d6',
  sessionId: '3a54498d-44a7-49c5-a164-59b2cae1c225',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1766174931271_p2y53v3d6', actionsCount: 28 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 28 raw actions...
[action-grouper] 🔍 Autocomplete pattern detected: {
  typedValue: 'vancouver',
  clickedText: 'Click "Vancouver, BC CanadaAll airportsYVR"',
  clickSemanticType: 'autocomplete',
  clickSemanticValue: 'Vancouver, BC CanadaAll airportsYVR',
  timeGap: '11873ms',
  detectionMethod: 'semantic-type'
}
[action-grouper] ⏭️  Skipped hardcoded dropdown click: Click "Vancouver, BC CanadaAll airportsYVR"
[action-grouper] ✅ Created autocomplete action with semanticType: autocomplete
[action-grouper] 🔍 Autocomplete pattern detected: {
  typedValue: 'los angeles',
  clickedText: 'Click "United States"',
  clickSemanticType: 'autocomplete',
  clickSemanticValue: 'United States',
  timeGap: '3701ms',
  detectionMethod: 'semantic-type'
}
[action-grouper] ⏭️  Skipped hardcoded dropdown click: Click "United States"
[action-grouper] ✅ Created autocomplete action with semanticType: autocomplete
[ActionRecorder] Grouped into 8 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 8 }
[finishRecordingStep] Captured page context: {
  url: 'https://www.farecompare.co.in/flights/YVR1912LAX26121',
  title: 'Vancouver - Los Angeles, 2025-12-19 - 2025-12-26 - Flights search',
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
    value: 'Vancouver, BC CanadaAll airportsYVR',
    type: 'autocomplete',
    label: 'location',
    actionIndex: 1
  },
  {
    value: 'United States',
    type: 'autocomplete',
    label: 'location',
    actionIndex: 3
  }
]
[Variable Detector Enhanced] Mapping result: {
  mappings: {
    'Vancouver, BC CanadaAll airportsYVR': '%origin%',
    'United States': '%destination%'
  },
  explanation: "Based on the semantic meaning and context, the first location value 'Vancouver, BC CanadaAll airportsYVR' is mapped to '%origin%' as it is the first location mentioned, indicating the starting point of the flight. The second location value 'United States' is mapped to '%destination%' as it is the second location mentioned, indicating the destination of the flight. The order of occurrence and the context of location help determine these mappings."
}
[finishRecordingStep] Variable mapping (enhanced): {
  'Vancouver, BC CanadaAll airportsYVR': '%origin%',
  'United States': '%destination%'
}
[Variable Mapping] Semantic match: "vancouver" → %origin% (via semanticValue: "Vancouver, BC CanadaAll airportsYVR")
[Variable Mapping] Semantic match: "los angeles" → %destination% (via semanticValue: "United States")
[finishRecordingStep] Applied variable mapping to 2 actions
[finishRecordingStep] Prepended initial navigation to: https://www.farecompare.co.in/
[filterRedundantNavigations] Keeping initial navigation: https://www.farecompare.co.in/
[filterRedundantNavigations] 🚫 Detected result page navigation: https://www.farecompare.co.in/flights?=&adults=1&children=0&ct_guests=1+passenger&ct_rooms=1&depart_
[filterRedundantNavigations]    Previous page: /
[filterRedundantNavigations]    Result page:   /flights
[filterRedundantNavigations] ✓ Removed result page navigation, created submit action
[filterRedundantNavigations] 🚫 Detected result page navigation: https://www.farecompare.co.in/flights/YVR1912LAX26121
[filterRedundantNavigations]    Previous page: /flights
[filterRedundantNavigations]    Result page:   /flights/YVR1912LAX26121
[filterRedundantNavigations] ✓ Removed result page navigation, created submit action
[finishRecordingStep] Filtered actions: { before: 9, after: 9, removed: 0 }
[finishRecordingStep] ⏭️  Filtering out intermediate click: Click field with placeholder "Origin"
[finishRecordingStep] ⏭️  Filtering out intermediate click: Click field with placeholder "Destination"
[finishRecordingStep] ⏭️  Filtering out intermediate click: Click field with placeholder "Depart date"
[finishRecordingStep] ⏭️  Filtering out intermediate click: Click "19"
[finishRecordingStep] Filtered intermediate clicks: { before: 9, after: 5, removed: 4 }
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
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 5 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] Filtered workflow: { original: 5, executable: 5, skipped: 0 }
[replayWorkflow] Executing action: navigate Navigate to https://www.farecompare.co.in/
[replayWorkflow] Executing action: act Type %origin% into the location field
[replayWorkflow] Reverse-substituted variable: { from: '%origin%', to: 'Vancouver, BC CanadaAll airportsYVR' }
[2025-12-19T20:10:00.885Z] DEBUG: css pierce-fallback
    frameId: 9F5A97C6EE626B55D6B7F9FAB2B11B8D
    selector: #flights-origin-prepop-whitelabel_en
[replayWorkflow] Exact selector failed, using natural language instruction
[replayWorkflow] Executing action: act Type %destination% into the location field
[replayWorkflow] Reverse-substituted variable: { from: '%destination%', to: 'United States' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Submit and wait for navigation
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Submit and wait for navigation
[replayWorkflow] Action executed with exact selector
[finishRecordingStep] Workflow validation successful
[finishRecordingStep] Validation session closed successfully
[finishRecordingStep] Skill saved to database: skill_1766175014184_jownnrgjs
 POST /.well-known/workflow/v1/step 200 in 28.0s (compile: 1361µs, render: 28.0s)
 POST /.well-known/workflow/v1/flow 200 in 10ms (compile: 1819µs, render: 8ms)
[POST /api/skills/finish-recording] Skill created: skill_1766175014184_jownnrgjs
 POST /api/skills/finish-recording 200 in 28.9s (compile: 471ms, render: 28.4s)
 GET /skills/skill_1766175014184_jownnrgjs 200 in 2.1s (compile: 2.1s, render: 28ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766175014184_jownnrgjs
 GET /api/skills/skill_1766175014184_jownnrgjs 200 in 1212ms (compile: 1184ms, render: 28ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766175014184_jownnrgjs
 GET /api/skills/skill_1766175014184_jownnrgjs 200 in 26ms (compile: 6ms, render: 19ms)
