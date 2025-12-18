ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1365ms
Created steps bundle 17ms
Created intermediate workflow bundle 10ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.2s
Discovering workflow directives 2450ms
Created steps bundle 28ms
Created intermediate workflow bundle 16ms
 ○ Compiling / ...
motion() is deprecated. Use motion.create() instead.
 GET / 200 in 3.9s (compile: 3.6s, render: 310ms)
 GET /skills 200 in 1785ms (compile: 1215ms, render: 570ms)
 GET /skills/record 200 in 624ms (compile: 606ms, render: 18ms)
(node:60070) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
[POST /api/skills/start-recording] Starting recording workflow {
  goal: 'find the cheapest flight from A to B from date C to D',
  startUrl: 'https://www.flightnetwork.com/',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
 POST /.well-known/workflow/v1/flow 200 in 168ms (compile: 155ms, render: 13ms)
[startRecordingStep] Starting recording {
  goal: 'find the cheapest flight from A to B from date C to D',
  startUrl: 'https://www.flightnetwork.com/',
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
  id: '02a157ad-a827-4619-a6b0-716692c6fe58',
  createdAt: '2025-12-18T20:02:10.543826+00:00',
  updatedAt: '2025-12-18T20:02:10.543826+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-18T20:02:10.534+00:00',
  expiresAt: '2025-12-18T20:07:10.534+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com/?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.Uy8Lgez4zWGaYfzxNq7eFAsJNK2Svdk4QAcmvVjzDSXT-v-jnLF3Dg.7C8zru8DyBBHN0Gm.riQHpgLZfrgaK8t-i941m-htbGuqytICKvMmduh-8eq9irz-b07j5WjoCPqjqWKWo0DbLavt595JUF-BaRJ_tBgjQiV1Fx3Dm1FC0I5Y-pr_OfWMxKRhE1-8UlTAmDc_Ku-Aje2XWv7Rv59IFJb14FIWXhAhAckYmN4_FkT6jET1G7NIzPitUeZjqM2_9GMyjJP7OUA2XMiXFZlK3Fw0jhxzdudSo0RdXabDTS2j25rgtBkYjun0UnwXo8bRtc4ZFDDqlBAGDy3kieK6vGM3OEFsk3irk4K8UCS5McAiHeLQmoVY8GB0mjUW4DCFcGzQJZxBnKBRnndanNlVarn39J3FaR4jGHxSZODD86h1iCEqsb1OEW_LefwaWatyZX-wLd1L-QLKWVK2rJ0icoOq5lpGPl_JE-jSbgGO_G2BsP300qBbhWthbvYenT2Avwxp.jk1DCIW9fquGpr6cAgheCw',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.Uy8Lgez4zWGaYfzxNq7eFAsJNK2Svdk4QAcmvVjzDSXT-v-jnLF3Dg.7C8zru8DyBBHN0Gm.riQHpgLZfrgaK8t-i941m-htbGuqytICKvMmduh-8eq9irz-b07j5WjoCPqjqWKWo0DbLavt595JUF-BaRJ_tBgjQiV1Fx3Dm1FC0I5Y-pr_OfWMxKRhE1-8UlTAmDc_Ku-Aje2XWv7Rv59IFJb14FIWXhAhAckYmN4_FkT6jET1G7NIzPitUeZjqM2_9GMyjJP7OUA2XMiXFZlK3Fw0jhxzdudSo0RdXabDTS2j25rgtBkYjun0UnwXo8bRtc4ZFDDqlBAGDy3kieK6vGM3OEFsk3irk4K8UCS5McAiHeLQmoVY8GB0mjUW4DCFcGzQJZxBnKBRnndanNlVarn39J3FaR4jGHxSZODD86h1iCEqsb1OEW_LefwaWatyZX-wLd1L-QLKWVK2rJ0icoOq5lpGPl_JE-jSbgGO_G2BsP300qBbhWthbvYenT2Avwxp.jk1DCIW9fquGpr6cAgheCw'
}
[startRecordingStep] Browserbase session created: 02a157ad-a827-4619-a6b0-716692c6fe58
[startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/02a157ad-a827-4619-a6b0-716692c6fe58/devtools/page/4BE1C5210D10C932B91DB9C7C150B905?debug=true
[dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops
[dotenv@17.2.3] injecting env (0) from .env -- tip: 📡 add observability to secrets: https://dotenvx.com/ops
[startRecordingStep] Stagehand initialized
[startRecordingStep] Navigated to start URL: https://www.flightnetwork.com/
[ActionRecorder] Starting recording
[ActionRecorder] Installing monitoring script (attempt 1/3)...
[ActionRecorder] Setting up addInitScript for future navigations
[ActionRecorder] Injecting script on current page
[ActionRecorder] ✅ Monitoring script installed successfully
[ActionRecorder] Event listeners will automatically persist across navigations
[ActionRecorder] Event listener installation verified
[ActionRecorder] Initial URL: https://us-en.flightnetwork.com/?ibe.mass=1
[ActionRecorder] ✅ Started recording with persistent event listeners
[startRecordingStep] Action recorder started
[startRecordingStep] Recording session saved to database
 POST /.well-known/workflow/v1/step 200 in 10.6s (compile: 290ms, render: 10.3s)
 POST /.well-known/workflow/v1/flow 200 in 16ms (compile: 3ms, render: 14ms)
[POST /api/skills/start-recording] Recording started: rec_1766088130183_sfasdafwc
 POST /api/skills/start-recording 200 in 13.6s (compile: 1983ms, render: 11.6s)
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 8 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] Retrieved 5 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] Retrieved 1 actions from page
[ActionRecorder] URL changed: https://us-en.flightnetwork.com/?ibe.mass=1 -> https://us-en.flightnetwork.com/rf/result
[ActionRecorder] Event listeners will auto-persist via addInitScript
[ActionRecorder] Retrieved 2 actions from page
[ActionRecorder] Retrieved 1 actions from page
[POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1766088130183_sfasdafwc',
  sessionId: '02a157ad-a827-4619-a6b0-716692c6fe58',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 1231µs, render: 12ms)
[finishRecordingStep] Finishing recording {
  recordingId: 'rec_1766088130183_sfasdafwc',
  sessionId: '02a157ad-a827-4619-a6b0-716692c6fe58',
  creatorAddress: '0x67c8c22e7edc7bf25c299e2c3b9aad4cf2ee6c79'
}
[finishRecordingStep] Loaded recording session: { recordingId: 'rec_1766088130183_sfasdafwc', actionsCount: 33 }
[ActionRecorder] Performing final action retrieval from browser...
[ActionRecorder] No additional actions found in browser
[ActionRecorder] Grouping 33 raw actions...
[ActionRecorder] Grouped into 15 semantic actions
[finishRecordingStep] Stopped action recorder
[finishRecordingStep] Reloaded recording with grouped actions: { actionsCount: 15 }
[finishRecordingStep] Captured page context: {
  url: 'https://us-en.flightnetwork.com/rf/result',
  title: 'Flight Network',
  headingCount: 5,
  hints: {
    hasPriceElements: true,
    hasDateElements: true,
    hasTableData: false,
    hasListItems: true,
    hasFormElements: true
  }
}
[finishRecordingStep] 🧪 Testing extraction schema before session close...
[Schema Generator] Analysis: {
  goal: 'find the cheapest flight from A to B from date C to D',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: "Total price with currency symbol (e.g., '$245')"
    },
    {
      name: 'airline',
      type: 'string',
      description: 'Airline name for the flight'
    },
    {
      name: 'route',
      type: 'string',
      description: "Route in format 'Origin → Destination' for validation"
    },
    {
      name: 'departureDate',
      type: 'string',
      description: "Departure date in ISO format (e.g., '2023-12-18')"
    },
    {
      name: 'arrivalDate',
      type: 'string',
      description: "Arrival date in ISO format (e.g., '2023-12-25')"
    },
    {
      name: 'departureTime',
      type: 'string',
      description: 'Departure time',
      optional: true
    },
    {
      name: 'arrivalTime',
      type: 'string',
      description: 'Arrival time',
      optional: true
    },
    {
      name: 'duration',
      type: 'string',
      description: 'Flight duration',
      optional: true
    },
    {
      name: 'stops',
      type: 'string',
      description: "Number of stops (e.g., 'Nonstop', '1 stop')",
      optional: true
    },
    {
      name: 'bookingUrl',
      type: 'string',
      description: 'URL to book the flight',
      optional: true
    }
  ],
  instruction: 'Extract the cheapest flight details including price, airline, route, and flight times',
  description: 'Extracts flight search results with price and details from Flight Network.'
}
[finishRecordingStep] Generated test schema: {
  fields: 10,
  instruction: 'Extract the cheapest flight details including price, airline, route, and flight times'
}
[finishRecordingStep] ✅ Extraction test PASSED
[finishRecordingStep] Released keep-alive session
[finishRecordingStep] Extracted semantic values: [
  {
    value: 'vancouver',
    type: 'text-input',
    label: 'Fill field with placeholder "From"',
    actionIndex: 2
  },
  {
    value: 'los angeles',
    type: 'text-input',
    label: 'Fill field with placeholder "To"',
    actionIndex: 5
  }
]
[finishRecordingStep] Goal appears vague, inferring structured goal...
[finishRecordingStep] Original goal: find the cheapest flight from A to B from date C to D
[Goal Inference] Analyzing user intent: {
  userIntent: 'find the cheapest flight from A to B from date C to D',
  demoQuery: 'vancouver',
  startUrl: 'https://www.flightnetwork.com/',
  actionCount: 15
}
[Goal Inference] Inference result: {
  structuredGoal: 'Find the cheapest flight from %origin% to %destination% from %start_date% to %end_date%',
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ],
  category: 'flight_search',
  confidence: 0.95
}
[finishRecordingStep] Inferred goal: {
  original: 'find the cheapest flight from A to B from date C to D',
  structured: 'Find the cheapest flight from %origin% to %destination% from %start_date% to %end_date%',
  variables: [ '%origin%', '%destination%', '%start_date%', '%end_date%' ],
  category: 'flight_search',
  confidence: 0.95
}
[finishRecordingStep] ✅ Using inferred goal (confidence >= 0.7)
[Variable Detector Enhanced] Mapping result: {
  mappings: { vancouver: '%origin%', 'los angeles': '%destination%' },
  explanation: 'Based on the context and order of occurrence:\n' +
    '\n' +
    '1. "vancouver" is entered in the field with placeholder "From", which semantically matches the variable %origin%.\n' +
    '2. "los angeles" is entered in the field with placeholder "To", which semantically matches the variable %destination%.\n' +
    '\n' +
    'The order of occurrence also supports this mapping, with the first location being the origin and the second being the destination.'
}
[finishRecordingStep] Variable mapping (enhanced): { vancouver: '%origin%', 'los angeles': '%destination%' }
[finishRecordingStep] Applied variable mapping to 2 actions
[finishRecordingStep] Prepended initial navigation to: https://www.flightnetwork.com/
[filterRedundantNavigations] Keeping initial navigation: https://www.flightnetwork.com/
[filterRedundantNavigations] Keeping navigation: https://us-en.flightnetwork.com/rf/result
[finishRecordingStep] Filtered actions: { before: 16, after: 16, removed: 0 }
[Schema Generator] Analysis: {
  goal: 'Find the cheapest flight from %origin% to %destination% from %start_date% to %end_date%',
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
[finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 16 }
[finishRecordingStep] Validating workflow by replaying
[replayWorkflow] Executing action: navigate Navigate to https://www.flightnetwork.com/
[replayWorkflow] Executing action: act Click "Accept All"
[2025-12-18T20:04:01.894Z] DEBUG: css pierce-fallback
    frameId: 37F4A74E6CEC2C1B8B0AFB4CAD2934FD
    selector: #onetrust-accept-btn-handler
[replayWorkflow] Exact selector failed, using natural language
[replayWorkflow] Executing action: act Click field with placeholder "From"
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill field with placeholder "From" with value %origin%
[replayWorkflow] Reverse-substituted variable: { from: '%origin%', to: 'vancouver' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click "Vancouver (All Airports), Canada, British Columbia"
[2025-12-18T20:04:09.046Z] DEBUG: css pierce-fallback
    frameId: 37F4A74E6CEC2C1B8B0AFB4CAD2934FD
    selector: #searchForm-singleBound-origin-input-option-0
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click field with placeholder "To"
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Fill field with placeholder "To" with value %destination%
[replayWorkflow] Reverse-substituted variable: { from: '%destination%', to: 'los angeles' }
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click "Los Angeles (All Airports)"
[2025-12-18T20:04:11.897Z] DEBUG: xpath main-world
    frameId: 37F4A74E6CEC2C1B8B0AFB4CAD2934FD
    xp: //*[@id="searchForm-singleBound-destination-input-option-0"]/div[1]/span[1]
    ctxId: 3
[replayWorkflow] Action executed with exact selector
[replayWorkflow] Executing action: act Click svg
[2025-12-18T20:04:12.754Z] DEBUG: xpath main-world
    frameId: 37F4A74E6CEC2C1B8B0AFB4CAD2934FD
    xp: //*[@id="calendar-icon-departureDate-0"]/svg[1]
    ctxId: 3
[replayWorkflow] Exact selector failed, using natural language
[2025-12-18T20:04:15.166Z] ERROR: No object generated: response did not match schema.
    cause: {
      "name": "AI_TypeValidationError",
      "cause": {
        "issues": [
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "undefined",
            "path": [
              "elementId"
            ],
            "message": "Required"
          },
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "undefined",
            "path": [
              "description"
            ],
            "message": "Required"
          },
          {
            "code": "invalid_type",
            "expected": "string",
            "received": "undefined",
            "path": [
              "method"
            ],
            "message": "Required"
          },
          {
            "code": "invalid_type",
            "expected": "array",
            "received": "undefined",
            "path": [
              "arguments"
            ],
            "message": "Required"
          },
          {
            "code": "invalid_type",
            "expected": "boolean",
            "received": "undefined",
            "path": [
              "twoStep"
            ],
            "message": "Required"
          }
        ],
        "name": "ZodError"
      },
      "value": {}
    }
    text: {}
    response: {
      "id": "resp_08c4381955f11ab90069445e3de41c819682299e8a91259501",
      "timestamp": "2025-12-18T20:04:13.000Z",
      "modelId": "gpt-4o-2024-08-06",
      "headers": {
        "alt-svc": "h3=\":443\"; ma=86400",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "9b0144a27cf10ccf-PDX",
        "connection": "keep-alive",
        "content-encoding": "br",
        "content-type": "application/json",
        "date": "Thu, 18 Dec 2025 20:04:15 GMT",
        "openai-organization": "user-n9hzrlewgav4ug2pm6k2m9vx",
        "openai-processing-ms": "1273",
        "openai-project": "proj_HZ0ojXFnPzdAPID8pfaG3Rv4",
        "openai-version": "2020-10-01",
        "server": "cloudflare",
        "set-cookie": "_cfuvid=mYv7QjY3jVKpIOszqM5jMEPApUWMjGTd8YsisTKjPXA-1766088255194-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "transfer-encoding": "chunked",
        "x-content-type-options": "nosniff",
        "x-envoy-upstream-service-time": "1277",
        "x-ratelimit-limit-requests": "5000",
        "x-ratelimit-limit-tokens": "800000",
        "x-ratelimit-remaining-requests": "4999",
        "x-ratelimit-remaining-tokens": "796407",
        "x-ratelimit-reset-requests": "12ms",
        "x-ratelimit-reset-tokens": "269ms",
        "x-request-id": "req_555f6b92657842bab221f76552044c72"
      },
      "body": {
        "id": "resp_08c4381955f11ab90069445e3de41c819682299e8a91259501",
        "object": "response",
        "created_at": 1766088253,
        "status": "completed",
        "background": false,
        "billing": {
          "payer": "developer"
        },
        "completed_at": 1766088255,
        "error": null,
        "incomplete_details": null,
        "instructions": null,
        "max_output_tokens": null,
        "max_tool_calls": null,
        "model": "gpt-4o-2024-08-06",
        "output": [
          {
            "id": "msg_08c4381955f11ab90069445e3f06908196b03de5a89cfa9d29",
            "type": "message",
            "status": "completed",
            "content": [
              {
                "type": "output_text",
                "annotations": [],
                "logprobs": [],
                "text": "{}"
              }
            ],
            "role": "assistant"
          }
        ],
        "parallel_tool_calls": true,
        "previous_response_id": null,
        "prompt_cache_key": null,
        "prompt_cache_retention": null,
        "reasoning": {
          "effort": null,
          "summary": null
        },
        "safety_identifier": null,
        "service_tier": "default",
        "store": true,
        "temperature": 0.1,
        "text": {
          "format": {
            "type": "json_schema",
            "description": null,
            "name": "response",
            "schema": {
              "type": "object",
              "properties": {
                "elementId": {
                  "type": "string",
                  "description": "the ID string associated with the element. Never include surrounding square brackets. This field must follow the format of 'number-number'."
                },
                "description": {
                  "type": "string",
                  "description": "a description of the accessible element and its purpose"
                },
                "method": {
                  "type": "string",
                  "description": "the candidate method/action to interact with the element. Select one of the available Playwright interaction methods."
                },
                "arguments": {
                  "type": "array",
                  "items": {
                    "type": "string",
                    "description": "the arguments to pass to the method. For example, for a click, the arguments are empty, but for a fill, the arguments are the value to fill in."
                  }
                },
                "twoStep": {
                  "type": "boolean"
                }
              },
              "required": [
                "elementId",
                "description",
                "method",
                "arguments",
                "twoStep"
              ],
              "additionalProperties": false
            },
            "strict": false
          },
          "verbosity": "medium"
        },
        "tool_choice": "auto",
        "tools": [],
        "top_logprobs": 0,
        "top_p": 1,
        "truncation": "disabled",
        "usage": {
          "input_tokens": 3574,
          "input_tokens_details": {
            "cached_tokens": 0
          },
          "output_tokens": 2,
          "output_tokens_details": {
            "reasoning_tokens": 0
          },
          "total_tokens": 3576
        },
        "user": null,
        "metadata": {}
      }
    }
    usage: {
      "inputTokens": 3574,
      "outputTokens": 2,
      "totalTokens": 3576,
      "reasoningTokens": 0,
      "cachedInputTokens": 0
    }
    finishReason: stop
[finishRecordingStep] Workflow validation failed: Error [StagehandServerError]: An internal server error occurred
    at Generator.next (<anonymous>)
[finishRecordingStep] Skill saved to database: skill_1766088255171_j3hhjht74
 POST /.well-known/workflow/v1/step 200 in 48s (compile: 1373µs, render: 48s)
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 2ms, render: 12ms)
[POST /api/skills/finish-recording] Skill created: skill_1766088255171_j3hhjht74
 POST /api/skills/finish-recording 200 in 49s (compile: 445ms, render: 48s)
 GET /skills/skill_1766088255171_j3hhjht74 200 in 1812ms (compile: 1786ms, render: 26ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766088255171_j3hhjht74
 GET /api/skills/skill_1766088255171_j3hhjht74 200 in 1148ms (compile: 1120ms, render: 28ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766088255171_j3hhjht74
 GET /api/skills/skill_1766088255171_j3hhjht74 200 in 27ms (compile: 7ms, render: 20ms)
