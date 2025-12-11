# Skills System API Reference

Complete API documentation for the Skills System 2.0 with variable support, structured extraction, and result validation.

---

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Execute Skill](#execute-skill)
  - [Get Skill Details](#get-skill-details)
  - [List Skills](#list-skills)
  - [Start Recording](#start-recording)
  - [Finish Recording](#finish-recording)
- [Data Types](#data-types)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Authentication

Currently, the Skills System does not require authentication. Future versions may implement API key-based authentication for production use.

---

## Endpoints

### Execute Skill

Execute a saved skill with optional variables.

**Endpoint**: `POST /api/skills/[skillId]/execute`

**Parameters**:
- `skillId` (path parameter) - The unique identifier for the skill

**Request Body**:
```typescript
{
  variables?: Record<string, any>  // Optional variables for dynamic execution
}
```

**Response**:
```typescript
{
  success: boolean
  data: any  // Extracted data based on skill's extraction schema
  strategy: "exact_replay" | "natural_language" | "ai_relearn"
  executionTime: number  // Milliseconds
  tokensUsed: number  // LLM tokens consumed
  sessionId: string  // Browserbase session ID
  sessionUrl: string  // URL to view browser session
  validation?: {
    valid: boolean
    errors: string[]
  }
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/skills/skill_123456/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "Toronto",
      "destination": "New York"
    }
  }'
```

**Example Response** (Flight Search):
```json
{
  "success": true,
  "data": {
    "extraction": {
      "price": "$450",
      "airline": "Delta",
      "route": "Toronto → New York",
      "departureTime": "10:00 AM",
      "arrivalTime": "1:30 PM",
      "duration": "3h 30m"
    }
  },
  "strategy": "natural_language",
  "executionTime": 18500,
  "tokensUsed": 1250,
  "sessionId": "sess_abc123xyz",
  "sessionUrl": "https://www.browserbase.com/sessions/sess_abc123xyz",
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

**Example Response** (With Validation Error):
```json
{
  "success": true,
  "data": {
    "extraction": {
      "price": "$320",
      "airline": "United",
      "route": "Chicago → Las Vegas"
    }
  },
  "strategy": "ai_relearn",
  "executionTime": 42000,
  "tokensUsed": 3500,
  "sessionId": "sess_def456uvw",
  "sessionUrl": "https://www.browserbase.com/sessions/sess_def456uvw",
  "validation": {
    "valid": false,
    "errors": [
      "Route \"Chicago → Las Vegas\" doesn't match Toronto → New York"
    ]
  }
}
```

---

### Get Skill Details

Retrieve details about a specific skill.

**Endpoint**: `GET /api/skills/[skillId]`

**Parameters**:
- `skillId` (path parameter) - The unique identifier for the skill

**Response**:
```typescript
{
  skillId: string
  name: string
  goal: string
  startUrl: string
  recordedActions: RecordedAction[]
  stagehandWorkflow: StagehandAction[]
  extractionSchema: {
    fields: SchemaField[]
    instruction: string
  }
  variableMapping?: Record<string, string>
  createdAt: string
  updatedAt: string
}
```

**Example Request**:
```bash
curl http://localhost:3000/api/skills/skill_123456
```

**Example Response**:
```json
{
  "skillId": "skill_123456",
  "name": "Search Flights",
  "goal": "Search for flights from %origin% to %destination%",
  "startUrl": "https://www.google.com/travel/flights",
  "recordedActions": [
    {
      "type": "fill",
      "selector": "#origin",
      "value": "%origin%",
      "description": "Fill origin field"
    },
    {
      "type": "fill",
      "selector": "#destination",
      "value": "%destination%",
      "description": "Fill destination field"
    },
    {
      "type": "click",
      "selector": "#search-button",
      "description": "Click search button"
    }
  ],
  "stagehandWorkflow": [
    {
      "method": "navigate",
      "url": "https://www.google.com/travel/flights",
      "instruction": "Navigate to Google Flights"
    },
    {
      "method": "act",
      "instruction": "Fill the origin field with %origin%",
      "value": "%origin%"
    },
    {
      "method": "act",
      "instruction": "Fill the destination field with %destination%",
      "value": "%destination%"
    },
    {
      "method": "act",
      "instruction": "Click the search button"
    }
  ],
  "extractionSchema": {
    "fields": [
      {
        "name": "price",
        "type": "string",
        "description": "Total price with currency symbol"
      },
      {
        "name": "airline",
        "type": "string",
        "description": "Airline name"
      },
      {
        "name": "route",
        "type": "string",
        "description": "Flight route in format 'Origin → Destination'"
      }
    ],
    "instruction": "Extract the cheapest flight details including price, airline, and route"
  },
  "variableMapping": {
    "Vancouver": "%origin%",
    "LAX": "%destination%"
  },
  "createdAt": "2025-12-10T10:00:00Z",
  "updatedAt": "2025-12-10T10:00:00Z"
}
```

---

### List Skills

Retrieve a list of all saved skills.

**Endpoint**: `GET /api/skills`

**Response**:
```typescript
{
  skills: Array<{
    skillId: string
    name: string
    goal: string
    createdAt: string
  }>
}
```

**Example Request**:
```bash
curl http://localhost:3000/api/skills
```

**Example Response**:
```json
{
  "skills": [
    {
      "skillId": "skill_123456",
      "name": "Search Flights",
      "goal": "Search for flights from %origin% to %destination%",
      "createdAt": "2025-12-10T10:00:00Z"
    },
    {
      "skillId": "skill_789012",
      "name": "Amazon Product Search",
      "goal": "Find price for %productName% on Amazon",
      "createdAt": "2025-12-10T11:30:00Z"
    }
  ]
}
```

---

### Start Recording

Start a new skill recording session.

**Endpoint**: `POST /api/skills/start-recording`

**Request Body**:
```typescript
{
  goal: string  // Task description with optional %variables%
  startUrl: string  // Starting URL for the workflow
}
```

**Response**:
```typescript
{
  recordingId: string  // Unique recording session ID
  sessionId: string  // Browserbase session ID
  liveViewUrl: string  // URL to perform actions in browser
  status: "recording"
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/skills/start-recording \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Search for hotels in %location%",
    "startUrl": "https://www.google.com/travel/hotels"
  }'
```

**Example Response**:
```json
{
  "recordingId": "rec_abc123",
  "sessionId": "sess_xyz789",
  "liveViewUrl": "https://www.browserbase.com/sessions/sess_xyz789/live",
  "status": "recording"
}
```

---

### Finish Recording

Complete a recording session and save the skill.

**Endpoint**: `POST /api/skills/finish-recording`

**Request Body**:
```typescript
{
  recordingId: string  // Recording session ID from start-recording
  sessionId: string  // Browserbase session ID
}
```

**Response**:
```typescript
{
  skillId: string
  name: string
  goal: string
  recordedActions: RecordedAction[]
  stagehandWorkflow: StagehandAction[]
  extractionSchema: ExtractionSchema
  testResult: {
    success: boolean
    errors?: string[]
  }
  metrics: {
    totalTokens: number
    duration: number
    operations: number
  }
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/api/skills/finish-recording \
  -H "Content-Type: application/json" \
  -d '{
    "recordingId": "rec_abc123",
    "sessionId": "sess_xyz789"
  }'
```

---

## Data Types

### RecordedAction

```typescript
interface RecordedAction {
  type: 'click' | 'fill' | 'type' | 'navigate' | 'submit'
  selector?: string  // CSS selector
  value?: string  // For fill/type actions, may contain %variables%
  url?: string  // For navigate actions
  description: string  // Natural language description
  timestamp?: number
}
```

### StagehandAction

```typescript
interface StagehandAction {
  method: 'navigate' | 'act' | 'extract'
  url?: string  // For navigate
  instruction?: string  // Natural language instruction (may contain %variables%)
  value?: string  // Value for substitution
  schema?: any  // For extract actions
}
```

### SchemaField

```typescript
interface SchemaField {
  name: string
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object'
  description: string
  optional?: boolean
}
```

### ExtractionSchema

```typescript
interface ExtractionSchema {
  fields: SchemaField[]
  instruction: string  // Instruction for LLM on what to extract
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  error: string  // Error message
  details?: any  // Additional error details
  code?: string  // Error code
}
```

### Common Errors

#### 400 Bad Request
```json
{
  "error": "Missing required field: variables",
  "code": "MISSING_FIELD"
}
```

#### 404 Not Found
```json
{
  "error": "Skill not found",
  "details": {
    "skillId": "skill_invalid123"
  },
  "code": "SKILL_NOT_FOUND"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Strategy 1 failed: Selector not found",
  "details": {
    "selector": "#origin",
    "strategy": "exact_replay"
  },
  "code": "EXECUTION_FAILED"
}
```

Note: If Strategy 1 fails, the system automatically falls back to Strategy 2, then Strategy 3. A 500 error only occurs if ALL strategies fail.

---

## Examples

### Example 1: Flight Search with Variables

**Create Skill** (via UI or recording):
- Goal: `"Search for round trip flights from %origin% to %destination% departing %departureDate%"`
- Demo with: Vancouver → LAX, Dec 17

**Execute with Different Variables**:
```bash
curl -X POST http://localhost:3000/api/skills/skill_123456/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "Toronto",
      "destination": "Miami",
      "departureDate": "Jan 15, 2026"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extraction": {
      "price": "$380",
      "airline": "Air Canada",
      "route": "Toronto → Miami",
      "departureTime": "8:30 AM",
      "arrivalTime": "12:45 PM",
      "duration": "4h 15m"
    }
  },
  "strategy": "exact_replay",
  "executionTime": 8200,
  "tokensUsed": 0,
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### Example 2: Product Price Lookup

**Create Skill**:
- Goal: `"Find price for product %productName% on Amazon"`
- Demo with: "iPhone 15 Pro"

**Execute**:
```bash
curl -X POST http://localhost:3000/api/skills/skill_789012/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "productName": "MacBook Pro"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extraction": {
      "price": "$1,999.99",
      "title": "Apple MacBook Pro 14-inch M3 Pro",
      "availability": "In Stock",
      "rating": "4.7 out of 5 stars"
    }
  },
  "strategy": "natural_language",
  "executionTime": 22000,
  "tokensUsed": 1800,
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### Example 3: Contact Form Submission

**Create Skill**:
- Goal: `"Fill contact form with name %fullName%, email %emailAddress%, message %message%"`
- Demo with: "John Doe", "john@example.com", "Test message"

**Execute**:
```bash
curl -X POST http://localhost:3000/api/skills/skill_345678/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "fullName": "Jane Smith",
      "emailAddress": "jane@company.com",
      "message": "I would like to inquire about your services"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extraction": {
      "status": "success",
      "confirmationMessage": "Thank you for contacting us. We'll get back to you within 24 hours."
    }
  },
  "strategy": "exact_replay",
  "executionTime": 5500,
  "tokensUsed": 0,
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

### Example 4: Hotel Search with Multiple Variables

**Create Skill**:
- Goal: `"Search for hotels in %location% from %checkIn% to %checkOut% under %maxPrice% per night"`
- Demo with: "San Francisco", "Feb 10", "Feb 12", "$200"

**Execute**:
```bash
curl -X POST http://localhost:3000/api/skills/skill_901234/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "location": "Seattle",
      "checkIn": "Mar 5, 2026",
      "checkOut": "Mar 7, 2026",
      "maxPrice": "150"
    }
  }'
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extraction": {
      "pricePerNight": "$135",
      "totalPrice": "$270",
      "hotelName": "Downtown Seattle Inn",
      "rating": 4.3,
      "location": "Seattle, WA"
    }
  },
  "strategy": "ai_relearn",
  "executionTime": 38000,
  "tokensUsed": 4200,
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

## Execution Strategies

### Strategy 1: Exact Replay (Fastest)
- **Speed**: 5-10 seconds
- **Tokens**: 0 (no LLM)
- **Reliability**: Works when DOM structure is unchanged
- **Use Case**: Stable websites with consistent selectors

### Strategy 2: Natural Language (AI-Resilient)
- **Speed**: 15-30 seconds
- **Tokens**: 500-2000
- **Reliability**: Works when DOM changes slightly
- **Use Case**: Dynamic websites, partial DOM changes

### Strategy 3: AI Re-learn (Ultimate Fallback)
- **Speed**: 30-60 seconds
- **Tokens**: 2000-5000
- **Reliability**: Re-learns entire workflow with AI agent
- **Use Case**: Complete DOM changes, first execution on new site

---

## Rate Limits

Currently, there are no rate limits. Future versions may implement:
- Max 100 executions per skill per hour
- Max 1000 tokens per execution
- Max 10 concurrent executions per user

---

## Webhooks (Future Feature)

Planned webhook support for async skill execution:

```typescript
POST /api/skills/[skillId]/execute
{
  variables: {...},
  webhookUrl: "https://yourapp.com/webhook/skill-complete"
}
```

Webhook payload:
```json
{
  "skillId": "skill_123456",
  "executionId": "exec_abc789",
  "success": true,
  "data": {...},
  "completedAt": "2025-12-10T15:30:00Z"
}
```

---

## Best Practices

1. **Always provide variables** when skill has `%variables%` in goal
2. **Check validation results** to ensure extracted data matches search criteria
3. **Monitor token usage** for cost optimization
4. **Use sessionUrl** to debug failed executions
5. **Handle all three strategies** - don't assume Strategy 1 will always work
6. **Validate extracted data** on your end for critical workflows
7. **Cache skill executions** when appropriate to reduce costs

---

## Support

For issues or questions:
- Check logs in terminal (`pnpm dev`)
- View Browserbase session via `sessionUrl`
- Inspect MongoDB collections: `skills`, `skill_executions`, `recording_sessions`
- Report bugs on GitHub

---

**API Version**: 2.0
**Last Updated**: December 10, 2025
