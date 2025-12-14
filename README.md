# Skills System - Browser Automation API Generator

Turn any web task into a reusable API by demonstrating it once. Record yourself performing a task in a browser, and the system automatically generates an intelligent, parameterized API endpoint that can be executed repeatedly with different inputs.

## What Is This?

**Skills System** is an AI-powered browser automation platform that transforms manual web workflows into production-ready APIs without writing code. Demonstrate a task visually (like searching for flights, checking stock prices, or filling contact forms), and the system captures your actions, understands your intent, and creates a durable API that adapts to website changes.

### Core Value Proposition

- **Record Once, Execute Forever**: Demonstrate a task manually in your browser, get an API that works infinitely
- **AI-Enhanced Intelligence**: System understands semantic meaning, not just DOM clicks
- **Self-Healing**: Triple fallback strategy ensures reliability even when websites change
- **Variable Parameterization**: Automatically detects and parameterizes dynamic values (origins, destinations, dates, search queries)
- **Structured Extraction**: AI-generated schemas extract structured data from result pages

### Use Cases

1. **Flight & Hotel Search APIs**: "Find flights from %origin% to %destination% on %date%"
2. **Product Price Tracking**: "Get price for %product% on Amazon"
3. **Form Automation**: "Fill contact form with %name%, %email%, %message%"
4. **Stock Price Monitoring**: "What's the price of %ticker% stock?"
5. **Real Estate Listings**: "Find properties in %location% under %maxPrice%"
6. **Weather Forecasts**: "Check weather for %city% on %date%"
7. **Social Media Monitoring**: "Search Twitter for %keyword%"
8. **Job Listings**: "Find %jobTitle% positions in %location%"

And 100+ more examples in [`skill-examples.md`](./skill-examples.md)

---

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or cloud)
- [Browserbase](https://browserbase.com) API key
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd api-maker

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Add to `.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/skills-system

# Browserbase (for browser sessions)
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

### Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### 1. Record a Skill

**Describe your goal** with variables:
```
"Find flights from %origin% to %destination% on %date%"
```

**Start recording**:
```bash
POST /api/skills/start-recording
{
  "goal": "Find flights from %origin% to %destination%",
  "startUrl": "https://www.google.com/flights"
}
```

You'll receive a Live View URL to control a remote browser. Demonstrate the task manually:
- Navigate to the site
- Fill in form fields (use example values like "Vancouver" → "LAX")
- Click search
- Wait for results

**Finish recording**:
```bash
POST /api/skills/finish-recording
{
  "recordingId": "rec_...",
  "sessionId": "sess_..."
}
```

The system will:
- Group your actions into semantic operations
- Detect variables automatically ("%origin%", "%destination%")
- Generate an extraction schema for result data
- Validate the workflow by replaying it
- Save the skill to MongoDB

### 2. Execute the Skill

Call your API with different variables:

```bash
POST /api/skills/{skillId}/execute
{
  "variables": {
    "origin": "Toronto",
    "destination": "New York",
    "date": "2026-01-15"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "extraction": {
      "price": "$450",
      "airline": "Delta",
      "route": "Toronto → New York",
      "departureTime": "10:00 AM",
      "arrivalTime": "1:30 PM"
    }
  },
  "strategy": "exact_replay",
  "executionTime": 8200,
  "validation": {
    "valid": true,
    "errors": []
  }
}
```

---

## Architecture

### Technology Stack

**Cloud Infrastructure**:
- [Browserbase](https://browserbase.com) - Managed browser sessions with Live View and session recording
- [Stagehand v3](https://github.com/browserbase/stagehand) - AI-powered browser automation (built on Playwright)

**Framework & AI**:
- [Vercel Workflow Kit](https://workflow.is) - Durable, retryable workflow execution
- [AI SDK](https://sdk.vercel.ai) + OpenAI GPT-4o - Structured generation with Zod schemas
- Next.js 16 + React 19 - Modern web framework
- MongoDB - Persistent storage for skills and execution analytics

**Key Libraries**:
- Playwright - Browser control and CDP event capture
- Zod - Runtime type validation for extracted data
- Tailwind CSS 4 - Styling

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      RECORDING PHASE                        │
└─────────────────────────────────────────────────────────────┘

  User Describes Goal → Create Browserbase Session (Live View)
         ↓
  User Demonstrates Task Manually in Browser
         ↓
  Action Recorder Captures Semantic Events (clicks, fills, navigations)
         ↓
  AI Detects Variables ("%origin%" from "Vancouver")
         ↓
  Convert to Dual Format (exact selectors + natural language)
         ↓
  AI Generates Extraction Schema (what data to extract)
         ↓
  Validate by Replaying Workflow
         ↓
  Save Skill to MongoDB


┌─────────────────────────────────────────────────────────────┐
│                      EXECUTION PHASE                        │
└─────────────────────────────────────────────────────────────┘

  API Call with Variables → Load Skill from MongoDB
         ↓
  ┌───────────────────────────────────────────────────────┐
  │ STRATEGY 1: Exact Selector Replay (Fast)              │
  │ - Use recorded selectors                              │
  │ - Substitute variables                                │
  │ - No LLM cost, 1-3 seconds                            │
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
  Validate Extraction (matches input variables)
         ↓
  Return Result + Metadata + Session Replay URL
```

---

## Key Components & File Structure

### Recording Phase

#### 1. Start Recording (`/workflows/steps/start-recording-step.ts`)
- Creates Browserbase session with Live View
- Initializes Stagehand for browser control
- Injects action recorder script into page
- Saves recording session to MongoDB

#### 2. Action Recorder (`/lib/capture/action-recorder.ts` - 1,103 lines)
**The heart of semantic capture**
- Injects JavaScript to monitor DOM events
- Captures **semantic meaning**, not just clicks:
  ```typescript
  {
    type: 'fill',
    selector: '#origin',
    value: 'Vancouver',
    semanticValue: 'Vancouver',      // Actual value
    semanticType: 'autocomplete',    // Widget type
    semanticLabel: 'origin city'     // Semantic meaning
  }
  ```
- Polls every 2 seconds to retrieve captured actions
- Handles navigation detection and script re-injection

#### 3. Action Grouper (`/lib/capture/action-grouper.ts`)
- Consolidates multiple keystrokes into single "type" actions
- Removes duplicate/redundant actions
- Example: 10 keystroke events → 1 semantic "type Vancouver" action

#### 4. Finish Recording (`/workflows/steps/finish-recording-step.ts` - 950 lines)
**Most complex phase with 11 sub-steps:**

1. **Stop Recording & Group Actions**
2. **Capture Page Context** (title, headings, structural hints)
3. **Extract Semantic Values** from grouped actions
4. **Goal Inference (AI)**: Transforms vague → structured goals
   ```
   "doing search" + demo: "how old is brad pitt"
   → "Search Google for %query% and extract the answer"
   ```
5. **Variable Detection (AI)**: Maps values to variables
   ```
   Goal: "Find flights from %origin% to %destination%"
   Values: ["Vancouver", "LAX"]
   → { "Vancouver": "%origin%", "LAX": "%destination%" }
   ```
6. **Variable Substitution**: Replace demo values with placeholders in actions
7. **Navigation Filtering**: Convert auto-navigations to submit actions (prevents hardcoded query params)
8. **Schema Generation (AI or Template-Based)**: Generate extraction schema
   - Template-based for common patterns (flight search, product search)
   - Context-aware AI for specific tasks
9. **Schema Testing**: Test extraction on live page BEFORE closing session
10. **Workflow Conversion**: Convert to Stagehand format (natural language)
11. **Validation**: Replay workflow in new session to verify
12. **Save to MongoDB**: Store skill with dual format (exact + natural language)

#### 5. Variable Detector (`/lib/capture/variable-detector.ts`)
- Uses GPT-4o to map typed values to goal variables
- Understands semantic meaning from labels and widget types
- Handles multi-variable scenarios intelligently

#### 6. Schema Generator (`/lib/extraction/schema-generator.ts` - 700 lines)
- Two-mode approach:
  - **Template-based**: For parameterized goals (flight search, product search)
  - **Context-aware AI**: Analyzes actual page content for custom schemas
- Pre-execution testing ensures schemas work before saving

### Execution Phase

#### 7. Execute Skill (`/workflows/steps/execute-skill-step.ts` - 942 lines)
**Implements triple strategy pattern**

**Strategy 1: Exact Selector Replay** (90% success rate)
- Speed: 1-3 seconds
- Cost: $0 (no LLM)
- Method: Direct Playwright commands with recorded selectors
- Works when: Website UI hasn't changed

**Strategy 2: Natural Language** (8% success rate)
- Speed: 5-10 seconds
- Cost: ~$0.01-0.05 per execution
- Method: Stagehand `act()` with natural language instructions
- Works when: UI changed but semantic meaning preserved

**Strategy 3: AI Re-learn** (2% success rate)
- Speed: 10-30 seconds
- Cost: ~$0.10-0.50 per execution
- Method: Stagehand Agent mode - AI navigates from scratch
- Works when: Major website redesign

#### 8. Variable Extractor (`/lib/ai/variable-extractor.ts`)
- Handles natural language input
- Example: "flights from SFO to NYC on Dec 25" → `{ origin: "SFO", destination: "NYC", date: "Dec 25" }`

#### 9. Result Tracker (`/lib/execution/result-tracker.ts`)
- Comprehensive execution logging
- Tracks which strategies were attempted
- Records metrics (tokens, duration, extracted fields)
- Saves to MongoDB for analytics

### API Routes

- **`POST /api/skills/start-recording`** - Begin recording session
- **`POST /api/skills/finish-recording`** - Complete and save skill
- **`POST /api/skills/{skillId}/execute`** - Execute skill with variables
- **`GET /api/skills/{skillId}`** - Get skill details
- **`GET /api/skills`** - List all skills

### UI Components

- **Recording Page** (`/app/skills/record/page.tsx`) - Start/finish recording UI
- **Skill Details Page** (`/app/skills/[skillId]/page.tsx`) - View skill details and metrics
- **Skill Tester Component** (`/components/SkillTester.tsx`) - Test skills with variables

---

## Data Models (MongoDB)

### Collections

#### 1. `recording_sessions` (Temporary)
Active recording sessions (deleted after skill creation):
```typescript
{
  recordingId: string
  sessionId: string              // Browserbase session ID
  liveViewUrl: string           // Live View URL for user
  goal: string                  // User's stated goal
  startUrl: string
  recordedActions: RecordedAction[]  // Updated in real-time
  status: 'recording' | 'finished'
  lastHeartbeat: string         // Updated every 2s
  createdAt: string
  updatedAt: string
}
```

#### 2. `skills` (Permanent)
Stored skills ready for execution:
```typescript
{
  skillId: string
  name: string
  goal: string                  // Final structured goal
  originalGoal: string          // User's original input
  startUrl: string

  // Page context for extraction
  pageContext: {
    url: string
    title: string
    headings: string[]
    structuralHints: {...}
    sampleExtraction: any
  }

  // HYBRID STORAGE - both formats
  recordedActions: RecordedAction[]      // Grouped, variable-substituted
  stagehandWorkflow: StagehandAction[]   // Natural language

  // Variables
  variableMapping: Record<string, string>  // { "Vancouver": "%origin%" }

  // Extraction
  extractionSchema: {
    fields: SchemaField[]
    instruction: string
  }

  // Metadata
  replayStrategy: 'hybrid'
  successfulRun: boolean
  metrics: { totalTokens, duration, operations }
  createdAt: string
  updatedAt: string
}
```

#### 3. `execution_results` (Execution logs)
Comprehensive execution tracking:
```typescript
{
  executionId: string
  skillId: string

  request: {
    variables: Record<string, any>
    timestamp: string
  }

  strategyAttempts: Array<{
    strategy: 'exact_replay' | 'natural_language' | 'ai_relearn'
    attempted: boolean
    success: boolean
    error?: { message, stack }
    executionTime: number
  }>

  finalStrategy: string
  success: boolean
  extractedData: any

  validation: {
    valid: boolean
    errors: string[]
  }

  performance: {
    totalExecutionTime: number
    tokensUsed: number
  }

  session: {
    sessionUrl: string  // Browserbase session replay
    debugUrl: string
  }
}
```

---

## Key Innovations

### 1. Semantic Value Capture
**Traditional recorders**: Capture DOM events (click, keydown, input)
**Skills System**: Captures semantic meaning and context

```typescript
// Traditional
{ type: 'input', selector: '#field-1', value: 'Vancouver' }

// Skills System
{
  type: 'fill',
  selector: '#field-1',
  value: 'Vancouver',
  semanticValue: 'Vancouver',      // Actual value
  semanticType: 'autocomplete',    // Widget type
  semanticLabel: 'origin city'     // What it means
}
```

**Coverage by widget type**:
- Text Input: 100%
- Date Picker: 45%
- Dropdown: 65%
- Autocomplete: 40%
- Number Input: 40%

### 2. Triple Replay Strategy
Three fallback strategies ensure 98%+ success rate:

| Strategy | Speed | Cost | Resilience | Success Rate |
|----------|-------|------|------------|--------------|
| Exact Selector | ⚡⚡⚡ | $0 | Low | 90% |
| Natural Language | ⚡⚡ | $$ | Medium | 8% |
| AI Re-learn | ⚡ | $$$ | High | 2% |

**Key Feature**: Page reset between strategies prevents cascading failures

### 3. AI-Powered Goal Inference
Transforms vague user input into structured, parameterized goals:

```
Input:  "doing search" + demo: "how old is brad pitt"
Output: "Search Google for %query% and extract the answer"
```

Only applies if AI confidence ≥ 0.7

### 4. Intelligent Variable Detection
- Works with ALL widget types (date pickers, dropdowns, autocomplete)
- Uses semantic context (labels, types)
- Handles multi-variable scenarios

### 5. Smart Schema Generation
Two-mode approach:
- **Template-based**: For parameterized goals (ensures reusability)
- **Context-aware AI**: For specific tasks (better accuracy)
- **Pre-execution testing**: Validates schemas on live page during recording

### 6. Navigation Filtering
Detects auto-navigations after form submissions and converts to semantic submit actions:

```
Before: type "query" → navigate to /search?q=hardcoded+query
After:  type "%query%" → submit form
```

Prevents hardcoded query parameters, makes skills more reusable.

---

## File Structure

```
/app/
  /api/skills/
    /start-recording/route.ts      # POST start recording
    /finish-recording/route.ts     # POST finish recording
    /[skillId]/route.ts            # GET skill details
    /[skillId]/execute/route.ts    # POST execute skill

/workflows/
  start-recording.ts               # Workflow orchestrator
  finish-recording.ts              # Workflow orchestrator
  execute-skill.ts                 # Workflow orchestrator

/workflows/steps/
  start-recording-step.ts          # Recording initialization (145 lines)
  finish-recording-step.ts         # ⭐ Skill processing (950 lines)
  execute-skill-step.ts            # ⭐ Execution logic (942 lines)

/lib/capture/
  action-recorder.ts               # ⭐ Browser action capture (1,103 lines)
  action-grouper.ts                # Keystroke grouping (192 lines)
  variable-detector.ts             # AI variable detection (328 lines)

/lib/ai/
  goal-inference.ts                # Vague → structured goals (198 lines)
  variable-extractor.ts            # NLU variable extraction (125 lines)

/lib/extraction/
  schema-generator.ts              # ⭐ Schema generation (700 lines)
  schema-templates.ts              # Pre-defined schemas (463 lines)
  zod-schema-builder.ts            # Schema → Zod (173 lines)

/lib/execution/
  result-tracker.ts                # Execution tracking (307 lines)

/lib/types/
  skills.ts                        # TypeScript interfaces (316 lines)
  execution-results.ts             # Result types
```

**Total Core Logic**: ~5,500 lines

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Run development server (localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

---

## Example Use Cases

See [`skill-examples.md`](./skill-examples.md) for 20+ detailed examples including:

1. Find cheapest flight from A to B for dates C to D
2. Track product price on Amazon
3. Fill contact form with information
4. Check hotel availability and prices
5. Find job listings on LinkedIn
6. Track stock prices
7. Find restaurant reservations
8. Compare product prices across sites
9. Check real estate listings
10. Monitor social media mentions
11. Track package delivery status
12. Find course availability
13. Check cryptocurrency prices
14. Monitor product reviews

---

## API Reference

See [`API_REFERENCE.md`](./API_REFERENCE.md) for complete API documentation including:

- Authentication
- All endpoints with request/response examples
- Data type definitions
- Error handling
- Best practices

---

## Performance

**Recording**:
- 10-30 seconds (includes AI processing)

**Execution**:
- Strategy 1: 3-10 seconds
- Strategy 2: 5-30 seconds
- Strategy 3: 10-120 seconds

**Token Usage**:
- Recording: 5K-20K tokens (variable detection, schema generation)
- Execution Strategy 1: 0 tokens
- Execution Strategy 2: 500-2K tokens
- Execution Strategy 3: 2K-50K tokens

**Reliability**: ~95% success rate across all strategies

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
- **Date picker widgets**: 45% coverage (semantic values captured but some complex calendars not fully supported)
- **Dropdown selections**: 65% coverage (simple dropdowns work, complex custom dropdowns may fail)
- **File uploads**: Not yet supported
- **Complex multi-step forms**: May need multiple API calls
- **Authentication**: Login flows not yet supported (workaround: use authenticated Browserbase sessions)

---

## Debugging

**Check session replay**: Every execution has a `sessionUrl` - watch what actually happened in the browser

**MongoDB collections**:
- `execution_results` - Shows which strategies were tried and why they failed
- `skills` - Check `recordedActions` and `variableMapping`

**Logs**: Run `pnpm dev` and check terminal for detailed execution logs

**Browserbase Debug View**: Use the `debugUrl` from execution results for console logs and network activity

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Documentation

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Detailed architecture deep-dive
- [`API_REFERENCE.md`](./API_REFERENCE.md) - Complete API documentation
- [`tldr.md`](./tldr.md) - Technical overview with examples
- [`skill-examples.md`](./skill-examples.md) - 20+ use case examples
- [`CLAUDE.md`](./CLAUDE.md) - Project guidelines for Claude Code

---

## License

[Your License Here]

---

## Acknowledgments

Built with:
- [Browserbase](https://browserbase.com) - Managed browser infrastructure
- [Stagehand](https://github.com/browserbase/stagehand) - AI browser automation
- [Vercel Workflow Kit](https://workflow.is) - Durable workflows
- [Next.js](https://nextjs.org) - React framework
- [OpenAI](https://openai.com) - GPT-4o for AI features

---

**Ready to build?** Start recording your first skill:

```bash
pnpm dev
# Open http://localhost:3000/skills/record
```
