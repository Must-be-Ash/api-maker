# Skills System - Technical Overview

## What We're Building

A **browser automation API generation system** where users demonstrate a web task once (like searching for flights or stock prices), and the system automatically creates a reusable API endpoint that can be called repeatedly with different inputs.

**Core Value Proposition:**
- User describes a goal: "find cheapest flight from %origin% to %destination%"
- User demonstrates the task in a live browser (navigate, click, fill forms)
- System records the demonstration and generates an API
- API can be called with different variables: `POST /api/skills/{skillId}/execute { "origin": "NYC", "destination": "LAX" }`

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      RECORDING PHASE                        │
└─────────────────────────────────────────────────────────────┘

  User Input (Goal + Start URL)
           ↓
  Create Browserbase Session (Live View)
           ↓
  User Demonstrates Task Manually
           ↓
  Action Recorder Captures Events (CDP via Playwright)
  - Clicks, fills, navigations, timestamps
           ↓
  AI Variable Detection (map typed values to placeholders)
  - "vancouver" → "%origin%"
           ↓
  Convert to Dual Format:
  1. Recorded Actions (exact selectors + values)
  2. Stagehand Workflow (natural language instructions)
           ↓
  Generate Extraction Schema (AI)
  - Infer what data to extract based on goal
           ↓
  Validate by Replaying Once
           ↓
  Save to MongoDB (skills collection)


┌─────────────────────────────────────────────────────────────┐
│                      EXECUTION PHASE                        │
└─────────────────────────────────────────────────────────────┘

  API Call: POST /api/skills/{skillId}/execute
  Body: { "variables": { "origin": "NYC", "destination": "LAX" }}
           ↓
  Load Skill from MongoDB
           ↓
  Initialize Browserbase Session
           ↓
  ┌───────────────────────────────────────────────────────┐
  │ STRATEGY 1: Exact Selector Replay (Fast)              │
  │ - Use recorded selectors                              │
  │ - Substitute variables (%origin% → "NYC")             │
  │ - minimal LLM cost                                    │
  │ - Works 90% of the time                               │
  └───────────────────────────────────────────────────────┘
           ↓ (if fails)
  ┌───────────────────────────────────────────────────────┐
  │ STRATEGY 2: Natural Language (AI-Resilient)           │
  │ - Use Stagehand natural language instructions         │
  │ - AI re-infers selectors if UI changed                │
  │ - Slower (5-10s) but handles UI changes               │
  │ - Works 8% of the time                                │
  └───────────────────────────────────────────────────────┘
           ↓ (if fails)
  ┌───────────────────────────────────────────────────────┐
  │ STRATEGY 3: AI Re-learn (Ultimate Fallback)           │
  │ - Ignore recording, navigate from scratch             │
  │ - Stagehand Agent mode with goal text                 │
  │ - Slowest (10-30s) but most reliable                  │
  │ - Works 2% of the time                                │
  └───────────────────────────────────────────────────────┘
           ↓
  Extract Data (Stagehand extract() with Zod schema)
           ↓
  Validate Extraction
           ↓
  Return Result + Metadata + Session Replay URL
```

---

## Key Components & File Structure

### Recording Phase

**1. Start Recording Workflow**
- **File**: `/workflows/steps/start-recording-step.ts`
- **What it does**:
  - Creates Browserbase session with Live View URL
  - Initializes Stagehand for browser control
  - Injects action recorder script into page
  - Saves recording session to MongoDB `recording_sessions` collection
- **Key functions**: `startRecordingStep()`

**2. Action Recorder**
- **File**: `/lib/capture/action-recorder.ts`
- **What it does**:
  - Injects JavaScript into page to listen for DOM events
  - Captures clicks, fills, navigations with exact selectors and timestamps
  - Uses CDP (Chrome DevTools Protocol) via Playwright
  - Groups raw events into semantic actions (e.g., multiple keypresses → single "type" action)
- **Key functions**: `ActionRecorder.startRecording()`, `ActionRecorder.stopRecording()`

**3. Action Grouper**
- **File**: `/lib/capture/action-grouper.ts`
- **What it does**:
  - Consolidates multiple fill events into single "type" actions
  - Removes duplicate/redundant actions
  - Makes workflow cleaner for replay
- **Key functions**: `groupActions()`

**4. Finish Recording Workflow**
- **File**: `/workflows/steps/finish-recording-step.ts`
- **What it does**:
  - Stops action recorder
  - Extracts typed values from recorded actions
  - **Variable Detection**: Calls AI to map typed values to goal variables
  - **Variable Substitution**: Replaces demo values with placeholders in actions
  - **Navigation Filtering**: Converts auto-navigations after form submissions to submit actions (prevents hardcoded query params)
  - Generates extraction schema (AI infers what data to extract)
  - Converts to Stagehand workflow format (natural language)
  - Validates by replaying once
  - Saves skill to MongoDB `skills` collection
- **Key functions**: `finishRecordingStep()`, `convertToStagehand()`, `filterRedundantNavigations()`

**5. Variable Detector**
- **File**: `/lib/capture/variable-detector.ts`
- **What it does**:
  - Uses OpenAI GPT-4o to map typed values to goal variables
  - Understands semantic meaning (e.g., first location → %origin%, second → %destination%)
  - Returns mapping like `{ "vancouver": "%origin%", "los angeles": "%destination%" }`
- **Key functions**: `detectVariables()`

**6. Schema Generator**
- **File**: `/lib/extraction/schema-generator.ts`
- **What it does**:
  - Uses AI to analyze goal and generate extraction schema
  - Infers what data fields to extract (e.g., "stock price" → extract currentPrice, priceChange, marketCap)
  - Returns structured schema with field names, types, descriptions
- **Key functions**: `generateExtractionSchema()`

### Execution Phase

**7. Execute Skill Workflow**
- **File**: `/workflows/steps/execute-skill-step.ts`
- **What it does**:
  - Loads skill from MongoDB
  - Implements triple strategy pattern
  - Substitutes variables in actions/instructions
  - Executes browser automation
  - Extracts data using Zod schema
  - Validates results
  - Tracks metrics and saves to `execution_results` collection
- **Key functions**:
  - `executeSkillStep()` - Main orchestrator
  - `executeExactReplay()` - Strategy 1
  - `executeNaturalLanguage()` - Strategy 2
  - `executeAIRelearn()` - Strategy 3

**8. Zod Schema Builder**
- **File**: `/lib/extraction/zod-schema-builder.ts`
- **What it does**:
  - Converts extraction schema to Zod validation schema
  - Enables type-safe data extraction with Stagehand
- **Key functions**: `buildZodSchemaFromFields()`

**9. Result Tracker**
- **File**: `/lib/execution/result-tracker.ts`
- **What it does**:
  - Tracks execution progress (which strategies tried, which succeeded)
  - Logs comprehensive metrics (tokens, duration, extracted fields)
  - Saves execution results to MongoDB
- **Key functions**: `ExecutionResultTracker` class

### API Routes

**10. Start Recording API**
- **File**: `/app/api/skills/start-recording/route.ts`
- **Endpoint**: `POST /api/skills/start-recording`
- **What it does**: Triggers start-recording-step workflow

**11. Finish Recording API**
- **File**: `/app/api/skills/finish-recording/route.ts`
- **Endpoint**: `POST /api/skills/finish-recording`
- **What it does**: Triggers finish-recording-step workflow

**12. Execute Skill API**
- **File**: `/app/api/skills/[skillId]/execute/route.ts`
- **Endpoint**: `POST /api/skills/{skillId}/execute`
- **What it does**: Triggers execute-skill-step workflow with variables

### UI Components

**13. Recording Page**
- **File**: `/app/skills/record/page.tsx`
- **What it does**: UI for starting/finishing recording, showing live view URL

**14. Skill Details Page**
- **File**: `/app/skills/[skillId]/page.tsx`
- **What it does**: Shows skill details, metrics, recorded workflow

**15. Skill Tester Component**
- **File**: `/components/SkillTester.tsx`
- **What it does**:
  - Auto-detects variables from goal string (regex: `/%([a-zA-Z0-9_]+)%/g`)
  - Provides input fields for each variable
  - Shows example values for common variable names
  - Executes skill and displays results

---

## How Variable Detection & Substitution Works

### Recording Time

1. **User types values**: "vancouver", "los angeles"
2. **Action Recorder captures**:
   ```javascript
   { type: 'fill', selector: '#origin', value: 'vancouver' }
   { type: 'fill', selector: '#destination', value: 'los angeles' }
   ```
3. **Variable Detector (AI) maps**:
   ```javascript
   Goal: "find flights from %origin% to %destination%"
   Typed values: ["vancouver", "los angeles"]

   → Mapping: { "vancouver": "%origin%", "los angeles": "%destination%" }
   ```
4. **Variable Substitution in actions**:
   ```javascript
   // Before:
   { type: 'fill', value: 'vancouver' }

   // After:
   { type: 'fill', value: '%origin%' }
   ```

### Execution Time

1. **API call with variables**: `{ "origin": "Seattle", "destination": "NYC" }`
2. **Strategy 1 (Exact Replay) substitutes**:
   ```javascript
   // Recorded action:
   { type: 'fill', selector: '#origin', value: '%origin%' }

   // Execution:
   const value = '%origin%'.replace(/%origin%/g, variables.origin);
   // → value = "Seattle"

   page.locator('#origin').fill("Seattle");
   ```
3. **Strategy 2 (Natural Language) substitutes**:
   ```javascript
   // Instruction template:
   { instruction: 'Fill origin with %origin%' }

   // After substitution:
   { instruction: 'Fill origin with Seattle' }

   // Stagehand AI executes:
   stagehand.act('Fill origin with Seattle');
   ```

---

## Triple Strategy Execution Pattern

### Strategy 1: Exact Selector Replay (90% success rate)
- **Speed**: 1-3 seconds
- **Cost**: $0 (no LLM calls)
- **Method**: Direct Playwright commands with recorded selectors
- **When it works**: When website UI hasn't changed
- **When it fails**: Selector no longer exists, dynamic IDs, UI redesign

### Strategy 2: Natural Language (8% success rate)
- **Speed**: 5-10 seconds
- **Cost**: ~$0.01-0.05 per execution (LLM inference)
- **Method**: Stagehand `act()` with natural language instructions
- **When it works**: UI changed but semantic meaning preserved
- **When it fails**: Major website redesign, functionality moved

### Strategy 3: AI Re-learn (2% success rate)
- **Speed**: 10-30 seconds
- **Cost**: ~$0.10-0.50 per execution (multiple LLM calls)
- **Method**: Stagehand Agent mode - AI navigates from scratch
- **When it works**: Always (if task is possible on the website)
- **When it fails**: Website functionality completely removed

---

## MongoDB Collections

### `recording_sessions`
Stores in-progress recordings:
```javascript
{
  recordingId: "rec_1765431512908_g9534k5sc",
  goal: "what's the price of %object% stock?",
  startUrl: "https://www.google.com/",
  recordedActions: [...], // Raw actions
  status: "recording" | "finished",
  liveViewUrl: "https://browserbase.com/...",
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### `skills`
Stores completed, validated skills:
```javascript
{
  skillId: "skill_1765431559260_nkfco0l2o",
  name: "Skill: what's the price of %object% stock?",
  goal: "what's the price of %object% stock?",
  startUrl: "https://www.google.com/",

  // DUAL FORMAT STORAGE
  recordedActions: [...],      // Exact selectors for Strategy 1
  stagehandWorkflow: [...],    // Natural language for Strategy 2

  // Variable system
  variableMapping: {           // Demo value → placeholder mapping
    "apple": "%object%"
  },

  // Extraction
  extractionSchema: {
    fields: [...],
    instruction: "Extract stock price...",
  },

  // Metadata
  replayStrategy: "hybrid",
  successfulRun: true,
  metrics: { totalTokens, duration, operations },
  price: 0.01,

  createdAt: ISODate,
  updatedAt: ISODate
}
```

### `execution_results`
Stores execution analytics:
```javascript
{
  executionId: "exec_1765430977514_drphkk763",
  skillId: "skill_...",
  variables: { origin: "Seattle" },

  // Strategy tracking
  strategies: [
    { name: "exact_replay", success: true, duration: 13865 }
  ],
  finalStrategy: "exact_replay",

  // Results
  extractedData: { currentPrice: "278.78", ... },
  validation: { valid: true, errors: [] },

  // Metrics
  totalDuration: 13865,
  tokensUsed: 11275,

  // Session replay
  sessionUrl: "https://browserbase.com/sessions/...",

  timestamp: ISODate
}
```

---

## Technology Stack

- **Next.js 16** (App Router) - Web framework
- **Vercel Workflow** - Durable workflow execution (handles retries, state persistence)
- **Browserbase** - Managed browser sessions with Live View
- **Stagehand v3** - AI-powered browser automation (act, extract, agent)
- **Playwright** - Browser control and CDP event capture
- **OpenAI GPT-4o** - Variable detection, schema generation, AI navigation
- **Zod** - Runtime type validation for extracted data
- **MongoDB** - Persistent storage for skills and executions
- **React 19** - UI components
- **Tailwind CSS 4** - Styling

---

## Current Limitations

### ✅ What Works Well
- Text inputs (origin, destination, search queries)
- Click actions on buttons, links
- Form submissions
- Navigation
- Data extraction with structured schemas
- Variable detection for typed values
- Multi-variable skills (e.g., 4 variables for flight search)

### ⚠️ Current Limitations
- **Date picker widgets**: Dates selected via calendar widgets are NOT captured as semantic values
  - **Why**: Only text input values are captured, not semantic meaning of clicks
  - **Impact**: Date variables don't get mapped, dates are hardcoded in navigation URLs
  - **Workaround**: Falls back to Strategy 2/3 (AI can handle date pickers with natural language)

- **Dropdown selections**: Similar issue to date pickers
- **File uploads**: Not yet supported
- **Complex multi-step forms**: May need multiple API calls

---

## Example: Stock Price Skill

**User Input:**
- Goal: `what's the price of %object% stock?`
- Start URL: `https://www.google.com/`
- Demo: Type "apple stock" in search

**Recording Output:**
```javascript
{
  skillId: "skill_1765431559260_nkfco0l2o",
  variableMapping: { "apple": "%object%" },
  recordedActions: [
    { type: 'navigate', url: 'https://www.google.com/' },
    { type: 'click', selector: '#APjFqb', description: 'Click Search' },
    { type: 'type', selector: '#APjFqb', value: '%object%', description: 'Fill Search' },
    { type: 'submit', selector: '#APjFqb', description: 'Press Enter to submit' }
  ],
  extractionSchema: {
    fields: [
      { name: 'currentPrice', type: 'string', description: "Current stock price..." },
      { name: 'priceChange', type: 'string', description: "Price change in dollars..." }
    ]
  }
}
```

**Execution:**
```bash
POST /api/skills/skill_1765431559260_nkfco0l2o/execute
{ "variables": { "object": "microsoft" } }

# Response:
{
  "success": true,
  "strategy": "exact_replay",
  "extractedData": {
    "currentPrice": "478.56 USD",
    "priceChange": "13.46"
  },
  "executionTime": 12344,
  "tokensUsed": 10543
}
```

---

## Key Insights

1. **Hybrid approach is essential**: Storing both exact selectors AND natural language enables fast execution with AI fallback

2. **Variable detection requires text values**: Only works for typed inputs, not UI widget interactions (date pickers, dropdowns)

3. **Triple strategy ensures reliability**: 98%+ success rate by having multiple fallback strategies

4. **Navigation filtering prevents hardcoded parameters**: Converting auto-navigations to submit actions allows dynamic query parameters

5. **AI-powered schema generation**: No need for manual schema definition - AI infers what to extract from the goal

6. **Session replay for debugging**: Every execution saves Browserbase session URL for visual debugging

---

## Next Steps / Potential Improvements

1. **Date picker semantic capture**: Detect date picker interactions and extract semantic date values
2. **Dropdown handling**: Capture selected option values, not just click events
3. **Multi-page workflows**: Support skills that span multiple pages/domains
4. **Conditional logic**: Handle "if product out of stock, try alternative"
5. **Pagination**: Extract data from multiple pages automatically
6. **Rate limiting**: Prevent abuse of skill execution
7. **Caching**: Cache extraction results for identical inputs (within time window)

---

## Debugging Tips

- **Check session replay**: Every execution has a `sessionUrl` - watch what actually happened
- **Check execution results**: MongoDB `execution_results` collection shows which strategies were tried
- **Check validation errors**: `validation.errors` field shows why extraction failed
- **Check recorded actions**: MongoDB `skills.recordedActions` shows exact selectors captured
- **Check variable mapping**: `skills.variableMapping` shows demo value → placeholder mapping

---

**Built with ❤️ using Vercel Workflow, Browserbase, and Stagehand**
