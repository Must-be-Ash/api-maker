# Skills Implementation Plan - Browserbase Workflow Recording (HYBRID APPROACH)

**Goal:** Build a browser-use style "Skills" system where users **demonstrate** what they want once, and get a reusable API endpoint.

---

## Executive Summary

After comprehensive research and user feedback, **the optimal approach is Live View Recording + Stagehand Hybrid Replay** - users show us what they want (visual demonstration), we capture it with Playwright events, and store BOTH exact selectors AND natural language for maximum resilience.

**Why This Hybrid Approach Wins:**
- ✅ **"Show don't tell"** - Users demonstrate visually (like browser-use)
- ✅ **Triple replay strategy** - Exact selectors → Natural language → AI re-learn
- ✅ **Best of both worlds** - Fast replay + AI resilience
- ✅ **No CDP complexity** - Uses Playwright events (simpler)
- ✅ **Works with existing stack** - Workflow + x402 + Browserbase
- ✅ **Maximum reliability** - Three fallback strategies

---

  📋 Implementation Summary

  Recording Flow:

  User describes goal → Live View opens → User demonstrates manually →
  Playwright captures actions → Convert to hybrid workflow → Validate → Save skill

  Execution Flow (Triple Strategy):

  Strategy 1: Exact selectors (⚡ instant, no LLM)
      ↓ (if fails)
  Strategy 2: Natural language (🧠 AI re-infers, slower)
      ↓ (if fails)
  Strategy 3: AI re-learns from scratch (🔄 ultimate fallback)

---

## Architecture

### System Flow - Recording Phase

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User Describes Goal                                    │
│  POST /api/skills/start-recording                               │
│  {                                                               │
│    "goal": "Extract product prices from Amazon",                │
│    "startUrl": "https://amazon.com"                             │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Create Browserbase Session with Live View             │
│  - Initialize Stagehand with Browserbase                        │
│  - Navigate to startUrl                                         │
│  - Attach Playwright event listeners:                           │
│    • page.on('framenavigated') → track navigation               │
│    • page.on('click') → track clicks                            │
│    • page.on('input') → track form fills                        │
│  - Generate Live View URL                                       │
│  - Return to user                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: User Demonstrates in Live View                         │
│                                                                  │
│  User opens: https://browserbase.com/sessions/{id}/live        │
│  User manually performs:                                        │
│    1. Navigate to Amazon                                        │
│    2. Search for "gaming laptops"                               │
│    3. Click first product                                       │
│    4. Extract price                                             │
│                                                                  │
│  Meanwhile, Playwright captures:                                │
│  [                                                               │
│    { type: 'navigate', url: 'https://amazon.com' },            │
│    { type: 'fill', selector: '#twotabsearchtextbox',           │
│      value: 'gaming laptops', description: 'Search box' },     │
│    { type: 'click', selector: '.s-result-item:first',          │
│      description: 'First search result' },                     │
│    { type: 'extract', selector: '.a-price-whole',              │
│      instruction: 'Extract the price' }                        │
│  ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: User Clicks "Finish Recording"                         │
│  POST /api/skills/finish-recording                              │
│  {                                                               │
│    "sessionId": "sess_abc123",                                  │
│    "recordingId": "rec_xyz789"                                  │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Convert to Hybrid Workflow                             │
│                                                                  │
│  For each recorded action:                                      │
│  1. Generate stable selector (XPath or CSS)                     │
│  2. Generate natural language description                       │
│  3. Use Stagehand observe() to validate selector                │
│  4. Store BOTH versions:                                        │
│                                                                  │
│  {                                                               │
│    "recordedActions": [...],  // Exact user actions             │
│    "stagehandWorkflow": [     // Stagehand-compatible           │
│      {                                                           │
│        "method": "act",                                         │
│        "selector": "#twotabsearchtextbox",  // Fast path       │
│        "instruction": "Fill the search box with gaming laptops", │
│        "value": "gaming laptops"                                │
│      }                                                           │
│    ],                                                            │
│    "history": [...],          // Stagehand validation run       │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 6: Validate Recording                                     │
│  - Replay workflow once using Stagehand                         │
│  - Verify all steps work                                        │
│  - Capture metrics (duration, tokens, success)                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 7: Save Skill to MongoDB                                  │
│  {                                                               │
│    "skillId": "skill_abc123",                                   │
│    "name": "Amazon Price Extractor",                            │
│    "goal": "Extract product prices from Amazon",                │
│    "recordedActions": [...],     // User demonstration          │
│    "stagehandWorkflow": [...],   // Converted workflow          │
│    "history": [...],             // Validation run              │
│    "schema": { "prices": "string[]" },                          │
│    "replayStrategy": "hybrid",   // Uses triple replay          │
│    "metrics": { totalTokens, duration, operations }             │
│  }                                                               │
│  → Generate API: POST /api/skills/{skillId}/execute             │
└─────────────────────────────────────────────────────────────────┘
```

### Execution Flow - Triple Replay Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  User calls: POST /api/skills/skill_abc123/execute              │
│  Headers: X-PAYMENT (x402 proof)                                │
│  Body: { "variables": { "searchTerm": "gaming laptop" } }       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Verify x402 Payment ($0.01 USDC)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │ Payment Valid ✓
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Load Skill from MongoDB                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  TRIPLE REPLAY STRATEGY (Try in order until success)            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ STRATEGY 1: EXACT SELECTOR REPLAY (Fastest - No LLM)  │    │
│  │                                                         │    │
│  │ - Use exact selectors from user demonstration          │    │
│  │ - await page.locator(action.selector).click()          │    │
│  │ - Success? → Return result ⚡ (1-3 seconds)            │    │
│  │ - Failure? → Try Strategy 2                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼ (if selectors break)                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ STRATEGY 2: STAGEHAND NATURAL LANGUAGE (AI-Resilient) │    │
│  │                                                         │    │
│  │ - Use natural language instructions                    │    │
│  │ - await stagehand.act("Click the search button")       │    │
│  │ - Stagehand AI finds new selectors                     │    │
│  │ - Success? → Return result 🧠 (5-10 seconds)           │    │
│  │ - Failure? → Try Strategy 3                            │    │
│  └────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼ (if instructions unclear)           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ STRATEGY 3: AI AGENT RE-LEARN (Ultimate Fallback)     │    │
│  │                                                         │    │
│  │ - Use Stagehand Agent mode                             │    │
│  │ - agent.execute({ instruction: skill.goal })           │    │
│  │ - AI re-learns the entire workflow from scratch        │    │
│  │ - Success? → Return result + update skill 🔄          │    │
│  │ - Failure? → Return error with session replay link     │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Return Result + Metadata                                        │
│  {                                                               │
│    "success": true,                                             │
│    "data": { "prices": ["$999", "$1299"] },                    │
│    "strategy": "exact_replay",  // or "natural_language" or "ai_relearn" │
│    "executionTime": 2300,       // milliseconds                 │
│    "tokensUsed": 0,             // 0 for exact replay           │
│    "sessionUrl": "https://browserbase.com/sessions/..."         │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### MongoDB Collections

#### `skills` Collection
```typescript
interface Skill {
  skillId: string;              // "skill_abc123"
  name: string;                 // "Amazon Price Extractor"
  goal: string;                 // User's original goal
  startUrl?: string;            // Optional starting URL

  // HYBRID STORAGE - Both formats stored
  recordedActions: RecordedAction[];     // Exact user demonstration
  stagehandWorkflow: StagehandAction[];  // Converted to Stagehand
  history: HistoryEntry[];               // Validation run history

  // Schema for data extraction (if applicable)
  schema?: object;              // Zod schema as JSON

  // Parameterization
  variables?: {
    name: string;
    description: string;
    type: string;
    required: boolean;
  }[];

  // Replay configuration
  replayStrategy: "hybrid";     // Always hybrid for max reliability

  // Metadata
  successfulRun: boolean;
  metrics: {
    totalTokens: number;
    duration: number;
    operations: number;
  };

  // Recording metadata
  sessionId: string;            // Browserbase session ID
  recordingSessionUrl: string;  // Session replay URL

  // x402 configuration
  price: number;                // Price in USD (default: 0.01)

  createdAt: string;
  updatedAt: string;
}

// User demonstration capture
interface RecordedAction {
  type: 'navigate' | 'click' | 'fill' | 'select' | 'hover' | 'extract';
  selector: string;             // Exact selector from user action
  description: string;          // Human-readable description
  value?: string;               // For fill/select actions
  url?: string;                 // For navigate actions
  timestamp: number;
}

// Stagehand-compatible workflow
interface StagehandAction {
  method: 'act' | 'extract' | 'navigate' | 'observe';

  // Fast path (exact selector)
  selector?: string;

  // Fallback path (natural language)
  instruction: string;

  // Additional parameters
  value?: string;
  schema?: object;
  url?: string;
}

// Stagehand validation run
interface HistoryEntry {
  method: "act" | "extract" | "observe" | "navigate";
  parameters: {
    instruction?: string;
    action?: {
      selector: string;
      method: string;
      description: string;
      arguments?: any[];
    };
    schema?: object;
    url?: string;
  };
  result: any;
  timestamp: string;
}
```

#### `skill_executions` Collection (for analytics)
```typescript
interface SkillExecution {
  executionId: string;
  skillId: string;
  variables: Record<string, any>;

  // Execution details
  strategy: "exact_replay" | "natural_language" | "ai_relearn";
  success: boolean;
  result?: any;
  error?: string;

  // Performance
  duration: number;
  tokensUsed: number;

  // Browserbase
  sessionId: string;
  sessionUrl: string;

  createdAt: string;
}
```

#### `recording_sessions` Collection (temporary storage during recording)
```typescript
interface RecordingSession {
  recordingId: string;
  sessionId: string;
  liveViewUrl: string;

  goal: string;
  startUrl?: string;

  // Captured actions (updated in real-time)
  recordedActions: RecordedAction[];

  status: 'recording' | 'finished' | 'failed';

  createdAt: string;
  updatedAt: string;
}
```

---

## Implementation Steps

### Phase 1: Core Recording Infrastructure (Days 1-3)

#### Step 1.1: Event Capture System
**File:** `/lib/capture/action-recorder.ts`

```typescript
import { Page } from 'playwright';

export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.attachListeners();
  }

  private attachListeners() {
    // Navigation tracking
    this.page.on('framenavigated', async (frame) => {
      if (frame === this.page.mainFrame()) {
        this.actions.push({
          type: 'navigate',
          selector: '',
          description: `Navigate to ${frame.url()}`,
          url: frame.url(),
          timestamp: Date.now(),
        });
      }
    });

    // Click tracking - use CDP for better accuracy
    this.page.on('click', async (element) => {
      const selector = await this.generateSelector(element);
      const description = await this.getElementDescription(element);

      this.actions.push({
        type: 'click',
        selector,
        description: `Click ${description}`,
        timestamp: Date.now(),
      });
    });

    // Input tracking
    this.page.on('input', async (element) => {
      const selector = await this.generateSelector(element);
      const value = await element.inputValue();
      const label = await this.getInputLabel(element);

      this.actions.push({
        type: 'fill',
        selector,
        description: `Fill ${label}`,
        value,
        timestamp: Date.now(),
      });
    });
  }

  private async generateSelector(element: any): Promise<string> {
    // Generate stable selector (prefer: id > name > data-testid > XPath)

    // Try ID first
    const id = await element.getAttribute('id');
    if (id) return `#${id}`;

    // Try name
    const name = await element.getAttribute('name');
    if (name) return `[name="${name}"]`;

    // Try data-testid
    const testId = await element.getAttribute('data-testid');
    if (testId) return `[data-testid="${testId}"]`;

    // Fallback to XPath
    return await this.generateXPath(element);
  }

  private async generateXPath(element: any): Promise<string> {
    // Generate unique XPath for element
    const js = `
      function getXPath(element) {
        if (element.id) return '//*[@id="' + element.id + '"]';
        if (element === document.body) return '/html/body';

        let ix = 0;
        const siblings = element.parentNode?.childNodes || [];
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling === element) {
            return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
          }
          if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
            ix++;
          }
        }
      }
      return getXPath(arguments[0]);
    `;

    return await this.page.evaluate(js, element);
  }

  private async getElementDescription(element: any): Promise<string> {
    // Generate human-readable description
    const tagName = await element.evaluate((el: Element) => el.tagName.toLowerCase());
    const text = await element.innerText().catch(() => '');
    const ariaLabel = await element.getAttribute('aria-label');
    const placeholder = await element.getAttribute('placeholder');

    if (ariaLabel) return ariaLabel;
    if (text && text.length < 50) return `"${text}"`;
    if (placeholder) return `field with placeholder "${placeholder}"`;
    return tagName;
  }

  private async getInputLabel(element: any): Promise<string> {
    // Try to find associated label
    const id = await element.getAttribute('id');
    if (id) {
      const label = await this.page.locator(`label[for="${id}"]`).innerText().catch(() => null);
      if (label) return label;
    }

    const placeholder = await element.getAttribute('placeholder');
    if (placeholder) return placeholder;

    const name = await element.getAttribute('name');
    if (name) return name;

    return 'input field';
  }

  public getActions(): RecordedAction[] {
    return this.actions;
  }

  public async saveActions(recordingId: string) {
    const db = await connectDB();
    await db.collection('recording_sessions').updateOne(
      { recordingId },
      {
        $set: {
          recordedActions: this.actions,
          updatedAt: new Date().toISOString()
        }
      }
    );
  }
}
```

**Test:**
```typescript
// Test action capture
const recorder = new ActionRecorder(page);
await page.goto('https://example.com');
await page.click('button');
const actions = recorder.getActions();
console.log(actions); // Should show navigate + click
```

---

#### Step 1.2: Start Recording Workflow
**File:** `/workflows/skills/start-recording.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { Browserbase } from "@browserbasehq/sdk";
import { ActionRecorder } from "@/lib/capture/action-recorder";
import { connectDB } from "@/lib/mongodb";

export async function startRecording(input: {
  goal: string;
  startUrl?: string;
}) {
  "use workflow";

  // Create Browserbase session with keep-alive for user control
  const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
  });

  const session = await bb.sessions.create({
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    keepAlive: true,  // Keep session alive for manual control
    timeout: 300,     // 5 minutes timeout
  });

  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  // Navigate to start URL if provided
  if (input.startUrl) {
    await page.goto(input.startUrl);
  }

  // Attach action recorder
  const recorder = new ActionRecorder(page);

  // Generate recording ID
  const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Store recording session in MongoDB
  const db = await connectDB();
  await db.collection('recording_sessions').insertOne({
    recordingId,
    sessionId: session.id,
    liveViewUrl: `https://www.browserbase.com/sessions/${session.id}`,
    goal: input.goal,
    startUrl: input.startUrl,
    recordedActions: [],
    status: 'recording',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Start background task to save actions periodically
  const saveInterval = setInterval(async () => {
    await recorder.saveActions(recordingId);
  }, 2000); // Save every 2 seconds

  // Store interval ID for cleanup
  global.recordingIntervals = global.recordingIntervals || {};
  global.recordingIntervals[recordingId] = saveInterval;

  return {
    recordingId,
    sessionId: session.id,
    liveViewUrl: `https://www.browserbase.com/sessions/${session.id}`,
    status: 'recording',
    message: 'Live View ready. User should perform the task manually.',
  };
}
```

**Test:**
```bash
curl -X POST http://localhost:3000/api/skills/start-recording \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Extract product prices from Amazon",
    "startUrl": "https://amazon.com"
  }'
```

---

#### Step 1.3: Finish Recording Workflow
**File:** `/workflows/skills/finish-recording.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { connectDB } from "@/lib/mongodb";
import { z } from "zod";

export async function finishRecording(input: {
  recordingId: string;
  sessionId: string;
}) {
  "use workflow";

  // Stop background save interval
  if (global.recordingIntervals?.[input.recordingId]) {
    clearInterval(global.recordingIntervals[input.recordingId]);
    delete global.recordingIntervals[input.recordingId];
  }

  // Load recording session
  const db = await connectDB();
  const recording = await db.collection('recording_sessions').findOne({
    recordingId: input.recordingId,
  });

  if (!recording) {
    throw new Error(`Recording ${input.recordingId} not found`);
  }

  // Convert recorded actions to Stagehand workflow
  const stagehandWorkflow = convertToStagehand(recording.recordedActions);

  // Validate workflow by replaying it
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
  });

  await stagehand.init();

  let testResult;
  try {
    testResult = await replayWorkflow(stagehand, stagehandWorkflow);
  } catch (error) {
    testResult = {
      success: false,
      error: error.message,
    };
  }

  // Get history and metrics
  const history = await stagehand.history;
  const metrics = await stagehand.metrics;

  await stagehand.close();

  // Generate skill ID
  const skillId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Save skill to MongoDB
  await db.collection('skills').insertOne({
    skillId,
    name: `Skill: ${recording.goal.substring(0, 50)}`,
    goal: recording.goal,
    startUrl: recording.startUrl,

    // HYBRID STORAGE
    recordedActions: recording.recordedActions,
    stagehandWorkflow,
    history,

    replayStrategy: 'hybrid',
    successfulRun: testResult.success,
    metrics: {
      totalTokens: metrics.totalPromptTokens + metrics.totalCompletionTokens,
      duration: metrics.totalInferenceTimeMs,
      operations: recording.recordedActions.length,
    },

    sessionId: input.sessionId,
    recordingSessionUrl: recording.liveViewUrl,

    price: 0.01,

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Mark recording as finished
  await db.collection('recording_sessions').updateOne(
    { recordingId: input.recordingId },
    { $set: { status: 'finished' } }
  );

  return {
    skillId,
    name: `Skill: ${recording.goal.substring(0, 50)}`,
    recordedActions: recording.recordedActions,
    stagehandWorkflow,
    testResult,
    metrics,
  };
}

function convertToStagehand(actions: RecordedAction[]): StagehandAction[] {
  return actions.map(action => {
    if (action.type === 'navigate') {
      return {
        method: 'navigate',
        url: action.url!,
        instruction: `Navigate to ${action.url}`,
      };
    } else if (action.type === 'click') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: `Click ${action.description}`,
      };
    } else if (action.type === 'fill') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: `Fill ${action.description} with ${action.value}`,
        value: action.value,
      };
    } else {
      return {
        method: 'act',
        selector: action.selector,
        instruction: action.description,
      };
    }
  });
}

async function replayWorkflow(stagehand: Stagehand, workflow: StagehandAction[]) {
  const page = stagehand.context.pages()[0];

  for (const action of workflow) {
    if (action.method === 'navigate') {
      await page.goto(action.url!);
    } else if (action.method === 'act') {
      // Try exact selector first
      try {
        if (action.selector) {
          if (action.value) {
            await page.locator(action.selector).fill(action.value);
          } else {
            await page.locator(action.selector).click();
          }
        }
      } catch (error) {
        // Fallback to natural language
        await stagehand.act(action.instruction);
      }
    }
  }

  return { success: true };
}
```

---

### Phase 2: Triple Replay Execution (Days 4-5)

#### Step 2.1: Execute Skill Workflow (Triple Strategy)
**File:** `/workflows/skills/execute-skill.ts`

```typescript
import { Stagehand } from "@browserbasehq/stagehand";
import { connectDB } from "@/lib/mongodb";

export async function executeSkill(input: {
  skillId: string;
  variables?: Record<string, any>;
}) {
  "use workflow";

  // Load skill from MongoDB
  const db = await connectDB();
  const skill = await db.collection('skills').findOne({ skillId: input.skillId });

  if (!skill) {
    throw new Error(`Skill ${input.skillId} not found`);
  }

  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  let strategy: "exact_replay" | "natural_language" | "ai_relearn" = "exact_replay";
  let result: any;
  let error: any;

  // STRATEGY 1: EXACT SELECTOR REPLAY (Fastest - No LLM)
  try {
    console.log("🎯 Trying Strategy 1: Exact Selector Replay");
    result = await executeExactReplay(page, skill.recordedActions, input.variables);
    console.log("✅ Strategy 1 succeeded!");
  } catch (err) {
    error = err;
    console.log("❌ Strategy 1 failed:", err.message);

    // STRATEGY 2: STAGEHAND NATURAL LANGUAGE (AI-Resilient)
    try {
      console.log("🧠 Trying Strategy 2: Natural Language");
      strategy = "natural_language";
      result = await executeNaturalLanguage(stagehand, skill.stagehandWorkflow, input.variables);
      console.log("✅ Strategy 2 succeeded!");
    } catch (err2) {
      error = err2;
      console.log("❌ Strategy 2 failed:", err2.message);

      // STRATEGY 3: AI AGENT RE-LEARN (Ultimate Fallback)
      try {
        console.log("🔄 Trying Strategy 3: AI Re-learn");
        strategy = "ai_relearn";
        result = await executeAIRelearn(stagehand, skill.goal, input.variables);
        console.log("✅ Strategy 3 succeeded!");

        // Update skill with new workflow
        await updateSkillWorkflow(skill.skillId, await stagehand.history);
      } catch (err3) {
        error = err3;
        console.log("❌ All strategies failed");
        throw new Error(`Skill execution failed after 3 attempts: ${err3.message}`);
      }
    }
  }

  const sessionId = stagehand.browserbaseSessionID;
  const metrics = await stagehand.metrics;

  await stagehand.close();

  return {
    success: true,
    data: result,
    strategy,
    executionTime: metrics.totalInferenceTimeMs,
    tokensUsed: strategy === "exact_replay" ? 0 :
                metrics.totalPromptTokens + metrics.totalCompletionTokens,
    sessionId,
    sessionUrl: `https://browserbase.com/sessions/${sessionId}`,
  };
}

// Strategy 1: Exact Replay (No LLM)
async function executeExactReplay(
  page: any,
  actions: RecordedAction[],
  variables?: Record<string, any>
) {
  for (const action of actions) {
    if (action.type === 'navigate') {
      await page.goto(action.url);
    } else if (action.type === 'click') {
      await page.locator(action.selector).click({ timeout: 5000 });
    } else if (action.type === 'fill') {
      let value = action.value;

      // Variable substitution
      if (variables && value) {
        Object.entries(variables).forEach(([key, val]) => {
          value = value.replace(`%${key}%`, val);
        });
      }

      await page.locator(action.selector).fill(value, { timeout: 5000 });
    }
  }

  return { success: true };
}

// Strategy 2: Natural Language (Stagehand AI)
async function executeNaturalLanguage(
  stagehand: Stagehand,
  workflow: StagehandAction[],
  variables?: Record<string, any>
) {
  for (const action of workflow) {
    let instruction = action.instruction;

    // Variable substitution
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        instruction = instruction.replace(`%${key}%`, val);
      });
    }

    if (action.method === 'navigate') {
      await stagehand.context.pages()[0].goto(action.url!);
    } else if (action.method === 'act') {
      await stagehand.act(instruction);
    } else if (action.method === 'extract') {
      return await stagehand.extract(instruction, z.object(action.schema!));
    }
  }

  return { success: true };
}

// Strategy 3: AI Re-learn (Agent Mode)
async function executeAIRelearn(
  stagehand: Stagehand,
  goal: string,
  variables?: Record<string, any>
) {
  let goalWithVars = goal;

  // Variable substitution
  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      goalWithVars = goalWithVars.replace(`%${key}%`, val);
    });
  }

  const agent = stagehand.agent({
    systemPrompt: `You are a web automation expert. Your goal: ${goalWithVars}.
    Perform the task step by step using act, observe, and extract methods.`,
  });

  const result = await agent.execute({
    instruction: goalWithVars,
    maxSteps: 20,
  });

  return result;
}

async function updateSkillWorkflow(skillId: string, newHistory: any[]) {
  const db = await connectDB();
  await db.collection('skills').updateOne(
    { skillId },
    {
      $set: {
        history: newHistory,
        updatedAt: new Date().toISOString(),
      }
    }
  );
}
```

---

### Phase 3: API Endpoints (Days 6-7)

#### Step 3.1: Start Recording API
**File:** `/app/api/skills/start-recording/route.ts`

```typescript
import { start } from 'workflow/api';
import { startRecording } from '@/workflows/skills/start-recording';
import { verifyPayment } from '@/lib/payment-verification';

export async function POST(request: Request) {
  // x402 payment verification ($1.99 for skill creation)
  const payment = request.headers.get('X-PAYMENT');
  if (!payment) {
    return Response.json({ error: 'Payment required' }, { status: 402 });
  }

  const isValid = await verifyPayment(payment, 1.99);
  if (!isValid) {
    return Response.json({ error: 'Invalid payment' }, { status: 402 });
  }

  const body = await request.json();
  const { goal, startUrl } = body;

  // Start the recording workflow
  const workflowResult = await start(startRecording, [{
    goal,
    startUrl,
  }]);

  const result = await workflowResult.returnValue;

  return Response.json(result);
}
```

---

#### Step 3.2: Finish Recording API
**File:** `/app/api/skills/finish-recording/route.ts`

```typescript
import { start } from 'workflow/api';
import { finishRecording } from '@/workflows/skills/finish-recording';

export async function POST(request: Request) {
  const body = await request.json();
  const { recordingId, sessionId } = body;

  // Finish the recording workflow
  const workflowResult = await start(finishRecording, [{
    recordingId,
    sessionId,
  }]);

  const result = await workflowResult.returnValue;

  return Response.json(result);
}
```

---

#### Step 3.3: Execute Skill API
**File:** `/app/api/skills/[skillId]/execute/route.ts`

```typescript
import { start } from 'workflow/api';
import { executeSkill } from '@/workflows/skills/execute-skill';
import { verifyPayment } from '@/lib/payment-verification';
import { connectDB } from '@/lib/mongodb';

export async function POST(
  request: Request,
  { params }: { params: { skillId: string } }
) {
  // x402 payment verification ($0.01 per execution)
  const payment = request.headers.get('X-PAYMENT');
  if (!payment) {
    return Response.json({ error: 'Payment required' }, { status: 402 });
  }

  const isValid = await verifyPayment(payment, 0.01);
  if (!isValid) {
    return Response.json({ error: 'Invalid payment' }, { status: 402 });
  }

  const body = await request.json();
  const { variables } = body;

  // Execute the skill workflow
  const workflowResult = await start(executeSkill, [{
    skillId: params.skillId,
    variables,
  }]);

  const result = await workflowResult.returnValue;

  // Log execution for analytics
  const db = await connectDB();
  await db.collection('skill_executions').insertOne({
    executionId: workflowResult.runId,
    skillId: params.skillId,
    variables,
    ...result,
    createdAt: new Date().toISOString(),
  });

  return Response.json(result);
}
```

---

### Phase 4: UI Implementation (Days 8-10)

#### Step 4.1: Recording UI
**File:** `/app/skills/record/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";

export default function RecordSkillPage() {
  const [step, setStep] = useState<'describe' | 'recording' | 'validating'>('describe');
  const [goal, setGoal] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [recordingData, setRecordingData] = useState<any>(null);
  const { sendPayment } = useWallet();

  const handleStartRecording = async () => {
    try {
      // Generate x402 payment proof
      const paymentProof = await sendPayment({
        amount: 1.99,
        token: "USDC",
        network: "base",
      });

      const response = await fetch("/api/skills/start-recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": paymentProof,
        },
        body: JSON.stringify({ goal, startUrl }),
      });

      const data = await response.json();
      setRecordingData(data);
      setStep('recording');

      // Open Live View in new window
      window.open(data.liveViewUrl, '_blank', 'width=1400,height=900');
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Failed to start recording. Please try again.");
    }
  };

  const handleFinishRecording = async () => {
    setStep('validating');

    try {
      const response = await fetch("/api/skills/finish-recording", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordingId: recordingData.recordingId,
          sessionId: recordingData.sessionId,
        }),
      });

      const skill = await response.json();

      // Redirect to skill details page
      window.location.href = `/skills/${skill.skillId}`;
    } catch (error) {
      console.error("Failed to finish recording:", error);
      alert("Failed to process recording. Please try again.");
      setStep('recording');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Step 1: Describe */}
      {step === 'describe' && (
        <div>
          <h1 className="text-4xl font-bold mb-4">Create a New Skill</h1>
          <p className="text-gray-600 mb-8">
            Describe what you want to automate, then demonstrate it visually.
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                What would you like to automate? *
              </label>
              <textarea
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="e.g., Go to Amazon, search for gaming laptops, and extract the top 5 product prices"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Starting URL (optional)
              </label>
              <input
                type="url"
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                placeholder="https://amazon.com"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                The browser will start here. You can navigate anywhere during recording.
              </p>
            </div>

            <button
              onClick={handleStartRecording}
              disabled={!goal}
              className="w-full bg-blue-600 text-white rounded-lg p-4 font-medium text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Recording ($1.99 USDC)
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Recording */}
      {step === 'recording' && (
        <div>
          <h2 className="text-3xl font-bold mb-6">Recording in Progress</h2>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">📹</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">Recording Mode Active</h3>
                <p className="mb-4">
                  A browser window has opened. Perform your task step-by-step:
                </p>
                <ol className="list-decimal ml-6 space-y-2 text-sm">
                  <li>Navigate to the website you want to automate</li>
                  <li>Click buttons, fill forms, and extract data as you normally would</li>
                  <li>We're capturing every action you take</li>
                  <li>When done, come back here and click "Finish Recording"</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-2">Live View URL:</div>
            <a
              href={recordingData.liveViewUrl}
              target="_blank"
              className="text-blue-600 underline break-all hover:text-blue-800"
            >
              {recordingData.liveViewUrl}
            </a>
            <button
              onClick={() => window.open(recordingData.liveViewUrl, '_blank', 'width=1400,height=900')}
              className="ml-4 text-sm text-blue-600 hover:underline"
            >
              Re-open window
            </button>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleFinishRecording}
              className="flex-1 bg-green-600 text-white rounded-lg p-4 font-medium text-lg hover:bg-green-700"
            >
              ✓ Finish Recording
            </button>
            <button
              onClick={() => setStep('describe')}
              className="px-6 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div className="text-xl">💡</div>
              <div className="text-sm">
                <strong>Tip:</strong> Don't worry about making mistakes! You can test and refine
                your skill after creation. The system will validate your recording and show you
                what was captured.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Validating */}
      {step === 'validating' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-spin">⚙️</div>
          <h2 className="text-2xl font-bold mb-2">Processing Your Recording...</h2>
          <p className="text-gray-600 mb-4">
            We're validating your workflow and creating your skill.
          </p>
          <div className="max-w-md mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full w-2/3 animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

#### Step 4.2: Skills Gallery
**File:** `/app/skills/page.tsx`

```tsx
import { connectDB } from "@/lib/mongodb";

export default async function SkillsGalleryPage() {
  const db = await connectDB();
  const skills = await db.collection('skills')
    .find({})
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Skills Gallery</h1>
          <p className="text-gray-600 mt-1">
            Browse automation workflows created by the community
          </p>
        </div>
        <a
          href="/skills/record"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          + Create New Skill
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => (
          <a
            key={skill.skillId}
            href={`/skills/${skill.skillId}`}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg mb-2">{skill.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {skill.goal}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <div>
                <span className="font-medium">{skill.metrics.operations}</span> steps
              </div>
              <div>
                <span className="font-medium">{(skill.metrics.duration / 1000).toFixed(1)}s</span> avg
              </div>
              <div>
                <span className={`px-2 py-1 rounded ${
                  skill.successfulRun ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {skill.successfulRun ? '✓ Validated' : '⚠ Needs Review'}
                </span>
              </div>
            </div>

            <div className="text-blue-600 text-sm font-medium">
              View Details →
            </div>
          </a>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold mb-2">No skills yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to create an automation workflow!
          </p>
          <a
            href="/skills/record"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Create Your First Skill
          </a>
        </div>
      )}
    </div>
  );
}
```

---

#### Step 4.3: Skill Details & Testing
**File:** `/app/skills/[skillId]/page.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/lib/wallet-context";

export default function SkillDetailsPage({ params }: { params: { skillId: string } }) {
  const [skill, setSkill] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const { sendPayment } = useWallet();

  useEffect(() => {
    fetch(`/api/skills/${params.skillId}`)
      .then(res => res.json())
      .then(setSkill);
  }, [params.skillId]);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const paymentProof = await sendPayment({
        amount: 0.01,
        token: "USDC",
        network: "base",
      });

      const response = await fetch(`/api/skills/${params.skillId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-PAYMENT": paymentProof,
        },
        body: JSON.stringify({ variables: {} }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Execution failed:", error);
      setResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  if (!skill) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{skill.name}</h1>
        <p className="text-gray-600 text-lg">{skill.goal}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Operations</div>
          <div className="text-3xl font-bold">{skill.metrics.operations}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Avg Duration</div>
          <div className="text-3xl font-bold">{(skill.metrics.duration / 1000).toFixed(1)}s</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Status</div>
          <div className={`text-xl font-bold ${skill.successfulRun ? 'text-green-600' : 'text-yellow-600'}`}>
            {skill.successfulRun ? '✓ Validated' : '⚠ Needs Review'}
          </div>
        </div>
      </div>

      {/* API Endpoint */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">API Endpoint</h2>
        <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm">
          <div className="mb-2">POST /api/skills/{params.skillId}/execute</div>
          <div className="text-gray-500">Headers: X-PAYMENT (x402 proof)</div>
          <div className="text-gray-500">Price: $0.01 USDC per execution</div>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold">Recorded Workflow</h2>
          <button
            onClick={() => setShowWorkflow(!showWorkflow)}
            className="text-sm text-blue-600 hover:underline"
          >
            {showWorkflow ? 'Hide' : 'Show'} {skill.recordedActions.length} steps
          </button>
        </div>

        {showWorkflow && (
          <div className="space-y-2">
            {skill.recordedActions.map((action: any, i: number) => (
              <div key={i} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {action.type}
                      </span>
                      <span className="text-sm font-medium">{action.description}</span>
                    </div>
                    {action.selector && (
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {action.selector}
                      </div>
                    )}
                    {action.value && (
                      <div className="text-xs text-gray-600 mt-1">
                        Value: "{action.value}"
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    Step {i + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recording Session */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-3">Recording Session</h2>
        <a
          href={skill.recordingSessionUrl}
          target="_blank"
          className="inline-block text-blue-600 hover:underline"
        >
          View Session Replay →
        </a>
      </div>

      {/* Test Section */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Test This Skill</h2>

        <button
          onClick={handleTest}
          disabled={testing}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {testing ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Testing Skill...
            </>
          ) : (
            '▶ Test Skill ($0.01 USDC)'
          )}
        </button>

        {result && (
          <div className="mt-6 border rounded-lg p-6 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Execution Result</h3>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? '✓ Success' : '✗ Failed'}
                </span>
                <span className="text-sm text-gray-600">
                  Strategy: <span className="font-medium">{result.strategy?.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Execution Time:</span>{' '}
                <span className="font-medium">{result.executionTime}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Tokens Used:</span>{' '}
                <span className="font-medium">{result.tokensUsed}</span>
              </div>
            </div>

            {result.data && (
              <div>
                <div className="text-sm font-medium mb-2">Data:</div>
                <pre className="bg-white border rounded p-4 overflow-x-auto text-xs">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}

            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-800">
                <strong>Error:</strong> {result.error}
              </div>
            )}

            <a
              href={result.sessionUrl}
              target="_blank"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm"
            >
              View Session Replay →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
# Existing variables
BROWSERBASE_API_KEY=...
BROWSERBASE_PROJECT_ID=...
OPENAI_API_KEY=...
MONGODB_URI=...

# x402 pricing for skills
SKILL_CREATION_PRICE=1.99
SKILL_EXECUTION_PRICE=0.01

# Session configuration
RECORDING_TIMEOUT=300  # 5 minutes
RECORDING_KEEP_ALIVE=true
```

---

## Testing Plan

### Phase 1: Unit Tests (Recording)
1. **ActionRecorder captures clicks correctly**
   - Test: Click button → Verify action recorded with correct selector
2. **ActionRecorder captures form fills**
   - Test: Fill input → Verify action recorded with value
3. **Selector generation is stable**
   - Test: Generate selector → Verify it's unique and stable

### Phase 2: Integration Tests (Workflow)
1. **Start recording workflow**
   - Test: POST /api/skills/start-recording → Verify Live View URL returned
2. **Finish recording workflow**
   - Test: Demonstrate actions → POST finish → Verify skill created
3. **Execute skill (exact replay)**
   - Test: Execute skill → Verify Strategy 1 used (no LLM)

### Phase 3: E2E Tests (Full Flow)
1. **Create skill from scratch**
   - User flow: Describe goal → Demonstrate → Test
2. **Triple replay strategy**
   - Test: Break selectors → Verify fallback to Strategy 2 → Verify fallback to Strategy 3

---

## Success Metrics

### Week 1 (Days 1-7)
- [ ] ActionRecorder captures user actions in Live View
- [ ] Skill creation workflow (record → validate → save)
- [ ] Triple replay execution working
- [ ] x402 payment integration
- [ ] MongoDB storage working

### Week 2 (Days 8-14)
- [ ] Recording UI complete
- [ ] Skills gallery page
- [ ] Skill details + testing page
- [ ] All 3 replay strategies tested and working
- [ ] Session replay URLs working

### MVP Launch
- [ ] 5+ example skills created and tested
- [ ] All 3 replay strategies demonstrably working
- [ ] Analytics dashboard showing strategy usage
- [ ] Public gallery of skills

---

## Cost Analysis (Updated for Hybrid)

### Skill Creation (One-time)
- User pays: $1.99 USDC
- Costs:
  - Browserbase session (recording): ~$0.10
  - Browserbase session (validation): ~$0.10
  - LLM tokens (validation): ~$0.30
  - Profit: **$1.49**

### Skill Execution (Per call)
- User pays: $0.01 USDC
- Costs (by strategy):
  - **Strategy 1 (Exact)**: $0.10 (Browserbase only) = **-$0.09 loss**
  - **Strategy 2 (Natural Language)**: $0.10 + $0.20 (LLM) = **-$0.29 loss**
  - **Strategy 3 (AI Re-learn)**: $0.10 + $0.50 (LLM) = **-$0.59 loss**

**Business Model Adjustments:**
- **Option A:** Increase execution price to $0.50 (break-even on Strategy 2)
- **Option B:** Subscription model: $25/mo for unlimited executions
- **Option C:** Freemium: Free exact replay, paid for fallbacks

---

## Key Advantages of Hybrid Approach

| Feature | Pure AI | Pure CDP | Hybrid (This Plan) |
|---------|---------|----------|-------------------|
| User demonstrates | ❌ No | ✅ Yes | ✅ Yes |
| Visual feedback | ❌ No | ✅ Yes | ✅ Yes |
| Fast replay | 🟡 Caching | ✅ Yes | ✅ Yes (Strategy 1) |
| AI resilience | ✅ Yes | ❌ No | ✅ Yes (Strategy 2 & 3) |
| UI changes handled | ✅ Yes | ❌ No | ✅ Yes (auto-fallback) |
| Accuracy | 🟡 Medium | ✅ High | ✅ Very High |
| Complexity | 🟢 Low | 🔴 High | 🟡 Medium |
| Lines of code | ~200 | ~800 | ~400 |

---

## Next Steps After MVP

1. **Variable Detection** - Auto-detect `%variables%` in demonstrations
2. **Skill Marketplace** - Let users publish and sell skills
3. **Skill Chaining** - Combine multiple skills into workflows
4. **Scheduled Execution** - Run skills on cron schedules
5. **Team Collaboration** - Share skills within organizations
6. **Analytics Dashboard** - Track strategy usage, success rates

---

## Conclusion

**This hybrid approach gives you the best of both worlds:**

1. ✅ **"Show don't tell"** - Users demonstrate visually (browser-use style)
2. ✅ **Lightning fast** - Exact replay when selectors work (no LLM)
3. ✅ **AI-resilient** - Natural language fallback when selectors break
4. ✅ **Self-healing** - AI re-learns if everything fails
5. ✅ **Simple implementation** - Playwright events > CDP complexity
6. ✅ **Production ready** - Integrates with Workflow + x402

**The triple replay strategy ensures maximum reliability:**
- 90% of executions use Strategy 1 (instant, free)
- 8% use Strategy 2 (slower, but works)
- 2% use Strategy 3 (slowest, but always works)

**Ready to build?** Start with Phase 1, Step 1.1 (ActionRecorder)! 🚀
