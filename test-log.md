      name: 'returnDepartureTime',
      type: 'string',
      description: 'Departure time for the return flight',
      optional: true
    },
    {
      name: 'returnArrivalTime',
      type: 'string',
      description: 'Arrival time for the return flight',
      optional: true
    },
    {
      name: 'duration',
      type: 'string',
      description: 'Total flight duration',
      optional: true
    },
    {
      name: 'stops',
      type: 'string',
      description: "Number of stops (e.g., 'Nonstop', '1 stop')",
      optional: true
    },
    {
      name: 'bookingURL',
      type: 'string',
      description: 'URL to book the flight',
      optional: true
    }
  ],
  instruction: 'Extract the cheapest round-trip flight details including price, airline, route, and flight times',
  fieldCount: 10,
  timestamp: '2025-12-10T22:46:07.838Z'
}
[2025-12-10 14:46:07.839 -0800] INFO: Using Browserbase credentials
    category: "init"
[2025-12-10 14:46:07.839 -0800] INFO: Starting browserbase session
    category: "init"
[2025-12-10 14:46:07.839 -0800] INFO: Creating new browserbase session...
    category: "init"
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[executeExactReplay] Starting exact replay with 22 actions
[executeExactReplay] Variables: {}
[executeExactReplay] Navigating to start URL: https://www.google.com/travel/flights
[2025-12-10 14:46:10.231 -0800] INFO: Browserbase session started
    category: "init"
    sessionUrl: "https://www.browserbase.com/sessions/ad1641ca-b39a-4728-baea-784011578e42"
    debugUrl: "https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/ad1641ca-b39a-4728-baea-784011578e42/devtools/page/0E65301E0F3D36B051B3B2855A162D84?debug=true"
    sessionId: "ad1641ca-b39a-4728-baea-784011578e42"
[2025-12-10 14:46:10.766 -0800] INFO: Connecting to local browser
    category: "init"
[executeExactReplay] Action: navigate Navigate to https://www.google.com/travel/flights
[executeExactReplay] Action: click Click Where from? 
[executeExactReplay] Action: type Fill Where from? 
[executeExactReplay] Variable origin not provided, using placeholder
[executeExactReplay] Action: navigate Navigate to https://www.google.com/travel/flights?tfs=CBwQARoOagwIAxIIL20vMDgwaDIaDnIMCAMSCC9tLzA4MGgyQAFIAXABggELCP___________wGYAQE&tfu=KgIIAw
[executeExactReplay] Action: click Click "Vancouver, British Columbia, Canada"
[2025-12-10T22:46:17.866Z] DEBUG: xpath main-world
    frameId: 0E65301E0F3D36B051B3B2855A162D84
    xp: //*[@id="c322"]/div[2]/div[1]/div[1]
    ctxId: 14
[executeSkillStep] ✗ Strategy 1 failed: Error [StagehandElementNotFoundError]: Could not find an element for the given xPath(s): //*[@id="c322"]/div[2]/div[1]/div[1]
    at Generator.next (<anonymous>)
[executeSkillStep] Attempting Strategy 2: Natural Language
[executeNaturalLanguage] Starting natural language execution with 22 steps
[executeNaturalLanguage] Variables: {}
[executeNaturalLanguage] Navigating to start URL: https://www.google.com/travel/flights
[executeNaturalLanguage] Action: navigate Navigate to https://www.google.com/travel/flights
[executeNaturalLanguage] Action: act Click Where from? 
[executeSkillStep] ✗ Strategy 2 failed: Error [StagehandServerError]: An unexpected error occurred
    at Generator.next (<anonymous>)
[executeSkillStep] Attempting Strategy 3: AI Re-learn
[executeAIRelearn] Starting AI re-learn for goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning %returnDate%
[2025-12-10 14:46:22.844 -0800] ERROR: No object generated: response did not match schema.
    category: "AISDK error"
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
    text: "{}"
    response: {
      "id": "resp_036631f2e061621f006939f83e2f88819c8dd25d7a1dae023e",
      "timestamp": "2025-12-10T22:46:22.000Z",
      "modelId": "gpt-4o-2024-08-06",
      "headers": {
        "alt-svc": "h3=\":443\"; ma=86400",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "9ac047243d19150f-PDX",
        "connection": "keep-alive",
        "content-encoding": "br",
        "content-type": "application/json",
        "date": "Wed, 10 Dec 2025 22:46:22 GMT",
        "openai-organization": "user-n9hzrlewgav4ug2pm6k2m9vx",
        "openai-processing-ms": "530",
        "openai-project": "proj_HZ0ojXFnPzdAPID8pfaG3Rv4",
        "openai-version": "2020-10-01",
        "server": "cloudflare",
        "set-cookie": "_cfuvid=Z44tSXNgKl2YIAh850TfF2ztjRubvR4j0cseBlTmodA-1765406782759-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "transfer-encoding": "chunked",
        "x-content-type-options": "nosniff",
        "x-envoy-upstream-service-time": "533",
        "x-ratelimit-limit-requests": "5000",
        "x-ratelimit-limit-tokens": "800000",
        "x-ratelimit-remaining-requests": "4999",
        "x-ratelimit-remaining-tokens": "795980",
        "x-ratelimit-reset-requests": "12ms",
        "x-ratelimit-reset-tokens": "301ms",
        "x-request-id": "req_5d26b36b8a3f4419866e33e21cc699df"
      },
      "body": {
        "id": "resp_036631f2e061621f006939f83e2f88819c8dd25d7a1dae023e",
        "object": "response",
        "created_at": 1765406782,
        "status": "completed",
        "background": false,
        "billing": {
          "payer": "developer"
        },
        "error": null,
        "incomplete_details": null,
        "instructions": null,
        "max_output_tokens": null,
        "max_tool_calls": null,
        "model": "gpt-4o-2024-08-06",
        "output": [
          {
            "id": "msg_036631f2e061621f006939f83e9938819cbd236258d2354f1c",
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
          "input_tokens": 4001,
          "input_tokens_details": {
            "cached_tokens": 0
          },
          "output_tokens": 2,
          "output_tokens_details": {
            "reasoning_tokens": 0
          },
          "total_tokens": 4003
        },
        "user": null,
        "metadata": {}
      }
    }
    usage: {
      "inputTokens": 4001,
      "outputTokens": 2,
      "totalTokens": 4003,
      "reasoningTokens": 0,
      "cachedInputTokens": 0
    }
    finishReason: "stop"
[executeAIRelearn] Navigated to start URL: https://www.google.com/travel/flights
[executeAIRelearn] Agent created, executing task
[2025-12-10 14:46:24.097 -0800] INFO: Creating v3 agent instance with options: {"systemPrompt":"You are a web automation expert. Your goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning %returnDate%.\n\nIMPORTANT RULES:\n1. You are already on www.google.com - DO NOT navigate to any other website\n2. Complete the entire task on this website only\n\n3. CRITICAL VALIDATION - When making selections, VERIFY they match these criteria:\n\n\n4. After completing the task, extract the following data fields:\n   - price: Total price with currency symbol (e.g., '$245')\n   - airline: Airline name for the flight\n   - route: Route in format 'Origin → Destination' for validation\n   - departureTime: Departure time for the outbound flight\n   - arrivalTime: Arrival time for the outbound flight\n   - returnDepartureTime: Departure time for the return flight\n   - returnArrivalTime: Arrival time for the return flight\n   - duration: Total flight duration\n   - stops: Number of stops (e.g., 'Nonstop', '1 stop')\n   - bookingURL: URL to book the flight\n\n\nPerform the task step by step using act, observe, and extract methods on www.google.com.\nBe precise and thorough. Validate your selections match the search criteria before proceeding."}
    category: "agent"
    cua: false
    model: "gpt-4o"
    systemPrompt: "You are a web automation expert. Your goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning %returnDate%.\n\nIMPORTANT RULES:\n1. You are already on www.google.com - DO NOT navigate to any other website\n2. Complete the entire task on this website only\n\n3. CRITICAL VALIDATION - When making selections, VERIFY they match these criteria:\n\n\n4. After completing the task, extract the following data fields:\n   - price: Total price with currency symbol (e.g., '$245')\n   - airline: Airline name for the flight\n   - route: Route in format 'Origin → Destination' for validation\n   - departureTime: Departure time for the outbound flight\n   - arrivalTime: Arrival time for the outbound flight\n   - returnDepartureTime: Departure time for the return flight\n   - returnArrivalTime: Arrival time for the return flight\n   - duration: Total flight duration\n   - stops: Number of stops (e.g., 'Nonstop', '1 stop')\n   - bookingURL: URL to book the flight\n\n\nPerform the task step by step using act, observe, and extract methods on www.google.com.\nBe precise and thorough. Validate your selections match the search criteria before proceeding."
[2025-12-10 14:46:24.440 -0800] INFO: Creating v3 agent instance with options: {"systemPrompt":"You are a web automation expert. Your goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning %returnDate%.\n\nIMPORTANT RULES:\n1. You are already on www.google.com - DO NOT navigate to any other website\n2. Complete the entire task on this website only\n\n3. CRITICAL VALIDATION - When making selections, VERIFY they match these criteria:\n\n\n4. After completing the task, extract the following data fields:\n   - price: Total price with currency symbol (e.g., '$245')\n   - airline: Airline name for the flight\n   - route: Route in format 'Origin → Destination' for validation\n   - departureTime: Departure time for the outbound flight\n   - arrivalTime: Arrival time for the outbound flight\n   - returnDepartureTime: Departure time for the return flight\n   - returnArrivalTime: Arrival time for the return flight\n   - duration: Total flight duration\n   - stops: Number of stops (e.g., 'Nonstop', '1 stop')\n   - bookingURL: URL to book the flight\n\n\nPerform the task step by step using act, observe, and extract methods on www.google.com.\nBe precise and thorough. Validate your selections match the search criteria before proceeding."}
    category: "agent"
    cua: false
    model: "gpt-4o"
    systemPrompt: "You are a web automation expert. Your goal: find cheapest flight from %origin% to %destination% departing %departureDate% returning %returnDate%.\n\nIMPORTANT RULES:\n1. You are already on www.google.com - DO NOT navigate to any other website\n2. Complete the entire task on this website only\n\n3. CRITICAL VALIDATION - When making selections, VERIFY they match these criteria:\n\n\n4. After completing the task, extract the following data fields:\n   - price: Total price with currency symbol (e.g., '$245')\n   - airline: Airline name for the flight\n   - route: Route in format 'Origin → Destination' for validation\n   - departureTime: Departure time for the outbound flight\n   - arrivalTime: Arrival time for the outbound flight\n   - returnDepartureTime: Departure time for the return flight\n   - returnArrivalTime: Arrival time for the return flight\n   - duration: Total flight duration\n   - stops: Number of stops (e.g., 'Nonstop', '1 stop')\n   - bookingURL: URL to book the flight\n\n\nPerform the task step by step using act, observe, and extract methods on www.google.com.\nBe precise and thorough. Validate your selections match the search criteria before proceeding."
[2025-12-10 14:46:26.433 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "type 'flights from New York to London departing 2023-11-01 returning 2023-11-10' into the search box"
[2025-12-10 14:46:30.139 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-3497",
        "description": "Search button for flights",
        "method": "fill",
        "arguments": [
          "flights from New York to London departing 2023-11-01 returning 2023-11-10"
        ],
        "twoStep": false
      },
      "usage": {
        "inputTokens": 4079,
        "outputTokens": 53,
        "totalTokens": 4132,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:46:30.165 -0800] INFO: error filling element
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
    error: "InvalidArgumentError: Failed to fill element (unsupported-element)"
[2025-12-10 14:46:30.165 -0800] INFO: error performing method
    category: "action"
    trace: "UnderstudyCommandException: InvalidArgumentError: Failed to fill element (unsupported-element)\n    at /app/node_modules/.pnpm/@browserbasehq+orca@3.0.3-patch_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-_8aa4c2c0d62be3c18aba9c05962f8a45/node_modules/@browserbasehq/orca/dist/index.js:10236:13\n    at Generator.throw (<anonymous>)\n    at rejected (/app/node_modules/.pnpm/@browserbasehq+orca@3.0.3-patch_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-_8aa4c2c0d62be3c18aba9c05962f8a45/node_modules/@browserbasehq/orca/dist/index.js:74:29)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)"
    method: "fill"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
    args: [
      "flights from New York to London departing 2023-11-01 returning 2023-11-10"
    ]
    error: "InvalidArgumentError: Failed to fill element (unsupported-element)"
[2025-12-10 14:46:30.165 -0800] INFO: Error performing action. Reprocessing the page and trying again
    category: "action"
    action: {
      "description": "Search button for flights",
      "method": "fill",
      "arguments": [
        "flights from New York to London departing 2023-11-01 returning 2023-11-10"
      ],
      "selector": "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
    }
    error: "InvalidArgumentError: Failed to fill element (unsupported-element)"
[2025-12-10 14:46:34.116 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-3497",
        "description": "Search for flights button",
        "method": "click",
        "arguments": [],
        "twoStep": false
      },
      "usage": {
        "inputTokens": 4054,
        "outputTokens": 29,
        "totalTokens": 4083,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:46:34.116 -0800] INFO: error filling element
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
    error: "InvalidArgumentError: Failed to fill element (unsupported-element)"
[2025-12-10 14:46:34.116 -0800] INFO: error performing method
    category: "action"
    trace: "UnderstudyCommandException: InvalidArgumentError: Failed to fill element (unsupported-element)\n    at /app/node_modules/.pnpm/@browserbasehq+orca@3.0.3-patch_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-_8aa4c2c0d62be3c18aba9c05962f8a45/node_modules/@browserbasehq/orca/dist/index.js:10236:13\n    at Generator.throw (<anonymous>)\n    at rejected (/app/node_modules/.pnpm/@browserbasehq+orca@3.0.3-patch_@opentelemetry+api@1.9.0_@opentelemetry+exporter-trace-_8aa4c2c0d62be3c18aba9c05962f8a45/node_modules/@browserbasehq/orca/dist/index.js:74:29)\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)"
    method: "fill"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
    args: [
      "flights from New York to London departing 2023-11-01 returning 2023-11-10"
    ]
    error: "InvalidArgumentError: Failed to fill element (unsupported-element)"
[2025-12-10 14:46:35.152 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "click the Google Search button"
[2025-12-10 14:46:37.908 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-3497",
        "description": "The 'Search for flights' button, which is the main action button to initiate a flight search on the page.",
        "method": "click",
        "arguments": [],
        "twoStep": false
      },
      "usage": {
        "inputTokens": 4054,
        "outputTokens": 47,
        "totalTokens": 4101,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:46:38.005 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
[2025-12-10 14:46:38.024 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights"
[2025-12-10 14:46:38.816 -0800] INFO: Agent calling tool: screenshot
    category: "agent"
[2025-12-10 14:46:45.557 -0800] INFO: Agent calling tool: fillForm
    category: "agent"
    arguments: [
      {
        "action": "type 'New York' into the origin input field",
        "value": "New York"
      },
      {
        "action": "type 'London' into the destination input field",
        "value": "London"
      },
      {
        "action": "type '2023-11-01' into the departure date input field",
        "value": "2023-11-01"
      },
      {
        "action": "type '2023-11-10' into the return date input field",
        "value": "2023-11-10"
      }
    ]
[2025-12-10 14:46:45.557 -0800] INFO: starting observation
    category: "observation"
    instruction: "Return observation results for the following actions: type 'New York' into the origin input field, type 'London' into the destination input field, type '2023-11-01' into the departure date input field, type '2023-11-10' into the return date input field"
[2025-12-10 14:46:45.641 -0800] INFO: Got accessibility tree data
    category: "observation"
[2025-12-10 14:46:47.387 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elements": [
          {
            "elementId": "6-3221",
            "description": "Origin input field for entering the departure location.",
            "method": "fill",
            "arguments": [
              "New York"
            ]
          }
        ]
      },
      "usage": {
        "inputTokens": 461,
        "outputTokens": 35,
        "totalTokens": 496,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:46:47.388 -0800] INFO: found elements
    category: "observation"
    elements: [
      {
        "description": "Origin input field for entering the departure location.",
        "method": "fill",
        "arguments": [
          "New York"
        ],
        "selector": "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[6]/div[2]/div[2]/div[1]/div[1]/input[1]"
      }
    ]
[2025-12-10 14:46:47.487 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[6]/div[2]/div[2]/div[1]/div[1]/input[1]"
[2025-12-10 14:46:47.509 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights"
[2025-12-10 14:46:49.624 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "click the Search button to find flights"
[2025-12-10 14:46:51.419 -0800] ERROR: No object generated: response did not match schema.
    category: "AISDK error"
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
    text: "{}"
    response: {
      "id": "resp_05f08fad87c7c5ba006939f85a4be48190883311454aa0ff86",
      "timestamp": "2025-12-10T22:46:50.000Z",
      "modelId": "gpt-4o-2024-08-06",
      "headers": {
        "alt-svc": "h3=\":443\"; ma=86400",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "9ac047d41922150f-PDX",
        "connection": "keep-alive",
        "content-encoding": "br",
        "content-type": "application/json",
        "date": "Wed, 10 Dec 2025 22:46:51 GMT",
        "openai-organization": "user-n9hzrlewgav4ug2pm6k2m9vx",
        "openai-processing-ms": "1054",
        "openai-project": "proj_HZ0ojXFnPzdAPID8pfaG3Rv4",
        "openai-version": "2020-10-01",
        "server": "cloudflare",
        "set-cookie": "_cfuvid=1X8rSKWFYm_uIO5hO42r3QGDfB.ln_ddCLaNZxJBfho-1765406811386-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "transfer-encoding": "chunked",
        "x-content-type-options": "nosniff",
        "x-envoy-upstream-service-time": "1057",
        "x-ratelimit-limit-requests": "5000",
        "x-ratelimit-limit-tokens": "800000",
        "x-ratelimit-remaining-requests": "4999",
        "x-ratelimit-remaining-tokens": "798351",
        "x-ratelimit-reset-requests": "12ms",
        "x-ratelimit-reset-tokens": "123ms",
        "x-request-id": "req_c1d242d08b654e319cafab20a82e264f"
      },
      "body": {
        "id": "resp_05f08fad87c7c5ba006939f85a4be48190883311454aa0ff86",
        "object": "response",
        "created_at": 1765406810,
        "status": "completed",
        "background": false,
        "billing": {
          "payer": "developer"
        },
        "error": null,
        "incomplete_details": null,
        "instructions": null,
        "max_output_tokens": null,
        "max_tool_calls": null,
        "model": "gpt-4o-2024-08-06",
        "output": [
          {
            "id": "msg_05f08fad87c7c5ba006939f85b14848190a739189e1221d4d0",
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
          "input_tokens": 1629,
          "input_tokens_details": {
            "cached_tokens": 0
          },
          "output_tokens": 2,
          "output_tokens_details": {
            "reasoning_tokens": 0
          },
          "total_tokens": 1631
        },
        "user": null,
        "metadata": {}
      }
    }
    usage: {
      "inputTokens": 1629,
      "outputTokens": 2,
      "totalTokens": 1631,
      "reasoningTokens": 0,
      "cachedInputTokens": 0
    }
    finishReason: "stop"
[2025-12-10 14:46:53.947 -0800] INFO: Agent calling tool: screenshot
    category: "agent"
[2025-12-10 14:46:56.786 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "click New York from the dropdown suggestion"
[2025-12-10 14:46:59.174 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-7543",
        "description": "Option for New York in the dropdown listbox",
        "method": "click",
        "arguments": [],
        "twoStep": true
      },
      "usage": {
        "inputTokens": 1629,
        "outputTokens": 34,
        "totalTokens": 1663,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:46:59.205 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[6]/div[3]/ul[1]/li[1]"
[2025-12-10 14:46:59.222 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights"
[2025-12-10 14:47:00.296 -0800] ERROR: No object generated: response did not match schema.
    category: "AISDK error"
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
    text: "{}"
    response: {
      "id": "resp_09eac44b6905a832006939f863940c81a19f34fbfa938883fc",
      "timestamp": "2025-12-10T22:46:59.000Z",
      "modelId": "gpt-4o-2024-08-06",
      "headers": {
        "alt-svc": "h3=\":443\"; ma=86400",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "9ac0480dad29150f-PDX",
        "connection": "keep-alive",
        "content-encoding": "br",
        "content-type": "application/json",
        "date": "Wed, 10 Dec 2025 22:47:00 GMT",
        "openai-organization": "user-n9hzrlewgav4ug2pm6k2m9vx",
        "openai-processing-ms": "740",
        "openai-project": "proj_HZ0ojXFnPzdAPID8pfaG3Rv4",
        "openai-version": "2020-10-01",
        "server": "cloudflare",
        "set-cookie": "_cfuvid=.qHPWtGioz4bn8YyII0ws7.b9DGcKAa1Q22DmumI4Hc-1765406820330-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "transfer-encoding": "chunked",
        "x-content-type-options": "nosniff",
        "x-envoy-upstream-service-time": "753",
        "x-ratelimit-limit-requests": "5000",
        "x-ratelimit-limit-tokens": "800000",
        "x-ratelimit-remaining-requests": "4999",
        "x-ratelimit-remaining-tokens": "796115",
        "x-ratelimit-reset-requests": "12ms",
        "x-ratelimit-reset-tokens": "291ms",
        "x-request-id": "req_2f30c881e7bb49d8aa4976521b897a64"
      },
      "body": {
        "id": "resp_09eac44b6905a832006939f863940c81a19f34fbfa938883fc",
        "object": "response",
        "created_at": 1765406819,
        "status": "completed",
        "background": false,
        "billing": {
          "payer": "developer"
        },
        "error": null,
        "incomplete_details": null,
        "instructions": null,
        "max_output_tokens": null,
        "max_tool_calls": null,
        "model": "gpt-4o-2024-08-06",
        "output": [
          {
            "id": "msg_09eac44b6905a832006939f863f6f881a1a897b3947841d4de",
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
          "input_tokens": 3866,
          "input_tokens_details": {
            "cached_tokens": 0
          },
          "output_tokens": 2,
          "output_tokens_details": {
            "reasoning_tokens": 0
          },
          "total_tokens": 3868
        },
        "user": null,
        "metadata": {}
      }
    }
    usage: {
      "inputTokens": 3866,
      "outputTokens": 2,
      "totalTokens": 3868,
      "reasoningTokens": 0,
      "cachedInputTokens": 0
    }
    finishReason: "stop"
[2025-12-10 14:47:03.438 -0800] INFO: Agent calling tool: screenshot
    category: "agent"
[2025-12-10 14:47:06.698 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "type 'London' into the destination input field again"
[2025-12-10 14:47:09.145 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-3259",
        "description": "The destination input field labeled 'Where to?'",
        "method": "fill",
        "arguments": [
          "London"
        ],
        "twoStep": false
      },
      "usage": {
        "inputTokens": 4087,
        "outputTokens": 36,
        "totalTokens": 4123,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:47:09.253 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[4]/div[1]/div[1]/div[1]/div[1]/div[1]/input[1]"
[2025-12-10 14:47:09.277 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights?tfs=CBwQARoPag0IAxIJL20vMDJfMjg2Gg9yDQgDEgkvbS8wMl8yODZAAUgBcAGCAQsI____________AZgBAQ&tfu=KgIIAw"
[2025-12-10 14:47:11.693 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "click London from the dropdown suggestion"
[2025-12-10 14:47:13.947 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-7872",
        "description": "Option for London, United Kingdom in the dropdown listbox.",
        "method": "click",
        "arguments": [],
        "twoStep": true
      },
      "usage": {
        "inputTokens": 1933,
        "outputTokens": 36,
        "totalTokens": 1969,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:47:13.971 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[1]/div[1]/div[2]/div[1]/div[6]/div[3]/ul[1]/li[1]"
[2025-12-10 14:47:13.989 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights?tfs=CBwQARoPag0IAxIJL20vMDJfMjg2Gg9yDQgDEgkvbS8wMl8yODZAAUgBcAGCAQsI____________AZgBAQ&tfu=KgIIAw"
[2025-12-10 14:47:15.285 -0800] ERROR: No object generated: response did not match schema.
    category: "AISDK error"
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
    text: "{}"
    response: {
      "id": "resp_02f29b27862c95d0006939f87243b48196a59df10924a8b5d5",
      "timestamp": "2025-12-10T22:47:14.000Z",
      "modelId": "gpt-4o-2024-08-06",
      "headers": {
        "alt-svc": "h3=\":443\"; ma=86400",
        "cf-cache-status": "DYNAMIC",
        "cf-ray": "9ac04869cfb5150f-PDX",
        "connection": "keep-alive",
        "content-encoding": "br",
        "content-type": "application/json",
        "date": "Wed, 10 Dec 2025 22:47:15 GMT",
        "openai-organization": "user-n9hzrlewgav4ug2pm6k2m9vx",
        "openai-processing-ms": "1027",
        "openai-project": "proj_HZ0ojXFnPzdAPID8pfaG3Rv4",
        "openai-version": "2020-10-01",
        "server": "cloudflare",
        "set-cookie": "_cfuvid=kEqEu_OePadcLuqYf3nTnV985bQ_ntY4aOEBqS61peg-1765406835317-0.0.1.1-604800000; path=/; domain=.api.openai.com; HttpOnly; Secure; SameSite=None",
        "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
        "transfer-encoding": "chunked",
        "x-content-type-options": "nosniff",
        "x-envoy-upstream-service-time": "1029",
        "x-ratelimit-limit-requests": "5000",
        "x-ratelimit-limit-tokens": "800000",
        "x-ratelimit-remaining-requests": "4999",
        "x-ratelimit-remaining-tokens": "796115",
        "x-ratelimit-reset-requests": "12ms",
        "x-ratelimit-reset-tokens": "291ms",
        "x-request-id": "req_452cbd39788b4f46b5f1cedcaeed9b8b"
      },
      "body": {
        "id": "resp_02f29b27862c95d0006939f87243b48196a59df10924a8b5d5",
        "object": "response",
        "created_at": 1765406834,
        "status": "completed",
        "background": false,
        "billing": {
          "payer": "developer"
        },
        "error": null,
        "incomplete_details": null,
        "instructions": null,
        "max_output_tokens": null,
        "max_tool_calls": null,
        "model": "gpt-4o-2024-08-06",
        "output": [
          {
            "id": "msg_02f29b27862c95d0006939f873269481969ef2a2244f67f9d8",
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
          "input_tokens": 3866,
          "input_tokens_details": {
            "cached_tokens": 0
          },
          "output_tokens": 2,
          "output_tokens_details": {
            "reasoning_tokens": 0
          },
          "total_tokens": 3868
        },
        "user": null,
        "metadata": {}
      }
    }
    usage: {
      "inputTokens": 3866,
      "outputTokens": 2,
      "totalTokens": 3868,
      "reasoningTokens": 0,
      "cachedInputTokens": 0
    }
    finishReason: "stop"
[2025-12-10 14:47:18.402 -0800] INFO: Agent calling tool: screenshot
    category: "agent"
[2025-12-10 14:47:22.634 -0800] INFO: Agent calling tool: act
    category: "agent"
    arguments: "click the Search button to find flights"
[2025-12-10 14:47:24.424 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "elementId": "6-3497",
        "description": "The 'Search' button used to find flights.",
        "method": "click",
        "arguments": [],
        "twoStep": false
      },
      "usage": {
        "inputTokens": 4083,
        "outputTokens": 34,
        "totalTokens": 4117,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:47:24.693 -0800] INFO: action, checking for page navigation
    category: "action"
    xpath: "xpath=/html[1]/body[1]/c-wiz[2]/div[1]/div[2]/c-wiz[1]/div[1]/c-wiz[1]/div[2]/div[1]/div[1]/div[2]/div[1]/button[1]"
[2025-12-10 14:47:24.788 -0800] INFO: no new (frame) URL detected
    category: "action"
    url: "https://www.google.com/travel/flights?tfs=CBwQARodag0IAxIJL20vMDJfMjg2cgwIAxIIL20vMDRqcGwaHWoMCAMSCC9tLzA0anBscg0IAxIJL20vMDJfMjg2QAFIAXABggELCP___________wGYAQE&tfu=KgIIAw"
[2025-12-10 14:47:29.715 -0800] INFO: Agent calling tool: wait
    category: "agent"
    arguments: "Waiting for 5000 milliseconds"
[2025-12-10 14:47:37.901 -0800] INFO: Agent calling tool: screenshot
    category: "agent"
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FewSUy3e/+7199j1g0Q5LTz31jN9c8VsQONYCn/nM56qH6JFHHkPeMzLDRqPyjjZgUJ1W8n+57ZV1/SkQxT2bR7Rs9oxjl04iKl6V7xUTYh0HY6xcX1c31/EH7skNox6+zW251UIpaQpw8qaBOK4CP01p9adEpacQJXUF+HODMrAqvQl/AaE35oavu+PF3lguk82v7Y2u7xt1O+00eTKT6Gjcp9LQMvwQfHDIsJBWyuWN1b2JROaZlX3ZdF6pEsKGpbltysBoyu92uGX7BvsIp7hjuSTo7pfy60dsGb349iSEmOu52aQt7PLzr/j4JLdpcY2P3WEPBbygryOtkaDbFhl2O/NOfIAd63/Svown4xWMZZ2oCnrSqYy0xPAT4HFHrNUu2c1f+cc81qHZtbwGmOPxesE3fv0b3/jMJz5ZWDvwocXL/njd3wVN39Tbe++D/4G+4shd9/rFL395zNHH0MMFYd369dh49rnndtxpp6U77oiNgcHBvKoC4E2dNi2eSLS2tTldrtdWruTYlBSveudly5559llsbNq82dyJz5VXXfWzn//8wIMOOvW001a88AKwlkMG6iaoBCxnV2fHlKlT176zZkp316OPPrzPvvu2tERAqYYjreCNw6EQlpsDw8NTp8946umncXbUvP8BB4BlRTP6BwZQPxocjceBErGNSkaGhy7+xEWHHXbI17/x9ddeexV78GltibS3tYJw9vm806d00nhAlhbiw4L+CCedfPLnL7nk5FNOKQhM9yFJwIEOWW5rb3979WqQ29hZ0MmmzZuw8dbbb/f09nZ1d/MaJJuts6tr/YYN2N6wcSMKoJE4FtB3/fp1GUVRNT3PPFmxNRyN2RwOXzD86utv4qd8gaArZKeMvyef8pG//+Mfe++zz7e/8x18vvLVr37us5+z2+yD/YOXfPJzf/rLX9E//IwLFi685957caJ777sPnY89jz722E033/zb3/2OggU2/A497LB31q7FJpSSM2bMMNHHscccc+211wJooRgYe4Be7AVXecMNNwCc33vP3YsXL5EkG67uyScex1D/17/+BWUBjp01axbIYUJn7HXWpwac/zXXXIPuApj/y1/+UvZoFyil1xH2ghDGBzQszzEGJPzgww/d/O8bf3PV761LSg6bP/3pTx9/3HGX/+D7PJNTg+LeCvG5vV3eFv5pdYfwMb+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",
      "timestamp": 1765406908017,
      "pageUrl": "https://www.google.com/travel/search?ts=CAISABoWChQSEgoIL20vMDRqcGw6BkxvbmRvbioA&ved=0CAAQ5JsGahcKEwjo0c2VjbSRAxUAAAAAHQAAAAAQBQ&ictx=3"
    }
  ],
  "completed": false,
  "usage": {
    "input_tokens": 9226,
    "output_tokens": 11,
    "reasoning_tokens": 0,
    "cached_input_tokens": 7936,
    "inference_time_ms": 123534
  }
}
[executeAIRelearn] No extraction in agent result, trying manual extraction...
[2025-12-10 14:48:33.757 -0800] INFO: Connecting to local browser
    category: "init"
[2025-12-10 14:48:34.507 -0800] INFO: Starting extraction using a11y snapshot
    category: "extraction"
    instruction: "Extract the cheapest round-trip flight details including price, airline, route, and flight times"
[2025-12-10 14:48:39.144 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "price": "",
        "airline": "",
        "route": "",
        "departureTime": "",
        "arrivalTime": "",
        "returnDepartureTime": "",
        "returnArrivalTime": "",
        "duration": "",
        "stops": "",
        "bookingURL": ""
      },
      "usage": {
        "inputTokens": 12977,
        "outputTokens": 33,
        "totalTokens": 13010,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:48:42.267 -0800] INFO: response
    category: "aisdk"
    response: {
      "object": {
        "progress": "No flight details have been extracted yet.",
        "completed": false
      },
      "usage": {
        "inputTokens": 282,
        "outputTokens": 16,
        "totalTokens": 298,
        "reasoningTokens": 0,
        "cachedInputTokens": 0
      },
      "finishReason": "stop"
    }
[2025-12-10 14:48:42.267 -0800] INFO: Extraction incomplete after processing all data
    category: "extraction"
    prompt_tokens: "13259"
    completion_tokens: "49"
    inference_time_ms: "7762"
[executeAIRelearn] Manual extraction successful: {
  price: '',
  airline: '',
  route: '',
  departureTime: '',
  arrivalTime: '',
  returnDepartureTime: '',
  returnArrivalTime: '',
  duration: '',
  stops: '',
  bookingURL: ''
}
[Validation] {
  extraction: {
    price: '',
    airline: '',
    route: '',
    departureTime: '',
    arrivalTime: '',
    returnDepartureTime: '',
    returnArrivalTime: '',
    duration: '',
    stops: '',
    bookingURL: ''
  },
  variables: {},
  valid: false,
  errors: [ 'Price field is empty or invalid' ],
  timestamp: '2025-12-10T22:48:42.743Z'
}
[executeAIRelearn] Validation failed: [ 'Price field is empty or invalid' ]
[executeSkillStep] ✓ Strategy 3 succeeded
[executeSkillStep] Session info: {
  sessionId: 'ad1641ca-b39a-4728-baea-784011578e42',
  sessionUrl: 'https://www.browserbase.com/sessions/ad1641ca-b39a-4728-baea-784011578e42',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/ad1641ca-b39a-4728-baea-784011578e42/devtools/page/0E65301E0F3D36B051B3B2855A162D84?debug=true'
}
 POST /.well-known/workflow/v1/step 200 in 2.7min (compile: 1513µs, render: 2.7min)
 POST /.well-known/workflow/v1/flow 200 in 52ms (compile: 2ms, render: 50ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1765406668777_v33amu2up',
  strategy: 'ai_relearn',
  success: true
}
 POST /api/skills/skill_1765406668777_v33amu2up/execute 200 in 2.8min (compile: 1195ms, render: 2.7min)
