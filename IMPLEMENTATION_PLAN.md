# Skills System 2.0 - Implementation Plan

## Project Overview

### Current System Issues

**Problem 1: Keystroke-Level Recording**
- Records each keystroke as separate action ("v", "a", "n" for "Vancouver")
- Makes actions non-reusable with different input values
- Strategy 1 & 2 replay exact keystrokes instead of semantic actions
- Result: Skills only work for the exact demo values

**Problem 2: No Variable Mapping**
- User types "Vancouver" but system doesn't know this is %origin%
- Variables exist in goal but not in recorded actions
- Actions store hardcoded values instead of variable placeholders
- Result: Each recording creates API for ONE specific use case only

**Problem 3: No Extraction Schema**
- Goal says "find cheapest flight" but no extraction schema generated
- Agent completes task but doesn't know WHAT to extract
- When extraction happens, it's unstructured text not JSON
- Result: Inconsistent, unreliable data output

**Problem 4: No Result Validation**
- Agent clicks "Chicago → Vegas" when search was "Vancouver → LAX"
- No validation that results match input variables
- No validation that extracted data is correct
- Result: Wrong data returned, low reliability

### Vision: Intelligent, Reusable API Creation

**What We're Building:**
A system where users demonstrate a task ONCE with example values, and get a GENERIC API that works with ANY values of the same type.

**Example:**
- User demonstrates: Search Vancouver → LAX flight
- System creates: API for ANY origin → ANY destination
- Variables: %origin%, %destination%, %departureDate%, %returnDate%
- Extraction: Structured JSON with price, airline, times
- Validation: Ensures results match search criteria

**Key Capabilities:**
1. **Intelligent Recording**: Groups keystrokes into semantic actions, maps to variables
2. **Variable-Aware Actions**: Actions use %placeholders% not hardcoded values
3. **Schema Generation**: LLM infers what to extract based on goal
4. **Result Validation**: Verifies extracted data matches input variables
5. **Pattern Recognition**: Learns workflow patterns (search→filter→extract)

---

## Architecture Changes

### Component Changes Overview

| Component | Current State | New State |
|-----------|--------------|-----------|
| **Action Recorder** | Records every keystroke | Groups actions, detects completion |
| **Variable Mapper** | ❌ Doesn't exist | Maps demo values → goal variables |
| **Action Storage** | Hardcoded values | Variable placeholders |
| **Schema Generator** | ❌ Doesn't exist | Generates extraction schema from goal |
| **Strategy 1** | Replays exact actions | Substitutes variables before replay |
| **Strategy 2** | Uses hardcoded workflow | Uses variable-aware workflow |
| **Strategy 3** | No validation | Validates results match variables |
| **Extraction** | Unstructured text | Structured JSON with schema |

---

## Implementation Tasks

### Phase 1: Intelligent Action Recording

#### Task 1.1: Create Action Grouper
**File**: `/lib/capture/action-grouper.ts` (NEW)

**Purpose**: Group keystroke events into complete actions

**Implementation Details:**
```typescript
// Group consecutive keystrokes in same field into single "type" action
// Debounce typing (500ms pause = action complete)
// Detect when user moves to different field (blur event)

interface GroupedAction {
  type: 'type' | 'click' | 'select' | 'navigate';
  selector: string;
  description: string;
  value?: string; // Complete typed value, not individual chars
  timestamp: number;
}

function groupActions(rawActions: RecordedAction[]): GroupedAction[]
```

**Acceptance Criteria:**
- ✅ Multiple keystrokes in same field → 1 "type" action with full value
- ✅ Click events remain as single actions
- ✅ Navigation events grouped appropriately
- ✅ Preserves action order and timing

---

#### Task 1.2: Create Variable Detector
**File**: `/lib/capture/variable-detector.ts` (NEW)

**Purpose**: Use LLM to map typed values to goal variables

**Implementation Details:**
```typescript
// Given goal with variables and typed values, map them
// Example:
//   Goal: "Search for flights from %origin% to %destination%"
//   Typed values: ["Vancouver", "LAX", "2025-12-17", "2025-12-24"]
//   Output: { "Vancouver": "%origin%", "LAX": "%destination%", ... }

interface VariableMapping {
  [demoValue: string]: string; // e.g., "Vancouver" → "%origin%"
}

async function detectVariables(
  goal: string,
  typedValues: string[]
): Promise<VariableMapping>

// Use OpenAI to analyze:
// - Extract variables from goal (%origin%, %destination%, etc.)
// - Match typed values to variables based on context
// - Return mapping
```

**LLM Prompt Template:**
```
Goal: {goal}
Typed values during recording: {typedValues}

Analyze the goal and identify variables (marked with %).
Map each typed value to its corresponding variable.

Return JSON:
{
  "mappings": {
    "Vancouver": "%origin%",
    "LAX": "%destination%"
  }
}
```

**Acceptance Criteria:**
- ✅ Extracts all %variables% from goal
- ✅ Maps demo values to variables with 90%+ accuracy
- ✅ Handles dates, numbers, text appropriately
- ✅ Returns mapping as JSON

---

#### Task 1.3: Update Action Recorder to Use Grouper
**File**: `/lib/capture/action-recorder.ts` (MODIFY)

**Changes:**
1. Import ActionGrouper
2. Store raw keystrokes in temporary buffer
3. On recording complete, group actions before saving
4. Replace keystroke-level actions with grouped semantic actions

**Code Changes:**
```typescript
import { groupActions } from './action-grouper';

class ActionRecorder {
  private rawActions: RecordedAction[] = [];

  async stopRecording() {
    // Group raw actions into semantic actions
    const groupedActions = groupActions(this.rawActions);

    // Save grouped actions instead of raw
    await this.saveActions(groupedActions);
  }
}
```

**Acceptance Criteria:**
- ✅ No individual keystrokes in saved actions
- ✅ Complete typed values captured as single action
- ✅ Field changes detected correctly

---

#### Task 1.4: Update finish-recording-step.ts to Apply Variable Mapping
**File**: `/workflows/steps/finish-recording-step.ts` (MODIFY)

**Changes:**
1. Import VariableDetector
2. After grouping actions, detect variables
3. Replace demo values with variable placeholders in actions
4. Store both original and variable-mapped actions

**Code Changes:**
```typescript
import { detectVariables } from '@/lib/capture/variable-detector';

// After actions are grouped:
const typedValues = recording.recordedActions
  .filter(a => a.type === 'type' || a.type === 'fill')
  .map(a => a.value);

const variableMapping = await detectVariables(recording.goal, typedValues);

// Replace demo values with %variables% in actions
const variableMappedActions = recording.recordedActions.map(action => {
  if (action.value && variableMapping[action.value]) {
    return {
      ...action,
      value: variableMapping[action.value], // "Vancouver" → "%origin%"
      originalValue: action.value, // Keep for reference
    };
  }
  return action;
});

// Save variable-mapped actions
await db.collection('skills').insertOne({
  ...
  recordedActions: variableMappedActions,
  variableMapping, // Store mapping for reference
  ...
});
```

**Acceptance Criteria:**
- ✅ Demo values replaced with %variables% in stored actions
- ✅ Original values preserved for debugging
- ✅ Mapping stored in skill document

---

### Phase 2: Extraction Schema Generation

#### Task 2.1: Create Schema Generator
**File**: `/lib/extraction/schema-generator.ts` (NEW)

**Purpose**: Generate Zod extraction schema from goal

**Implementation Details:**
```typescript
import { z } from 'zod';

// Given goal, infer what data should be extracted
// Example:
//   Goal: "Find cheapest flight from %origin% to %destination%"
//   Output: Schema for { price, airline, route, duration, ... }

interface ExtractionsSchema {
  schema: z.ZodObject<any>;
  description: string;
  fields: {
    name: string;
    type: string;
    description: string;
  }[];
}

async function generateExtractionSchema(
  goal: string
): Promise<ExtractionSchema>
```

**LLM Prompt Template:**
```
Goal: {goal}

Based on this goal, determine what data should be extracted.
Return a JSON schema with fields to extract.

For flight search, extract: price, airline, departure/arrival times, duration, stops
For product price, extract: price, title, availability, rating
For contact form, extract: submission status, confirmation message

Return JSON:
{
  "fields": [
    {
      "name": "price",
      "type": "string",
      "description": "Total price with currency symbol"
    },
    {
      "name": "airline",
      "type": "string",
      "description": "Airline name for outbound flight"
    },
    ...
  ],
  "extractionInstruction": "Extract the cheapest round trip flight details including total price, airline names, flight times, and duration"
}
```

**Then convert to Zod schema:**
```typescript
const zodSchema = z.object(
  fields.reduce((acc, field) => {
    acc[field.name] = z.string().describe(field.description);
    return acc;
  }, {})
);
```

**Acceptance Criteria:**
- ✅ Generates appropriate schema based on goal
- ✅ Includes validation fields (route matching search criteria)
- ✅ Returns Zod schema and extraction instruction
- ✅ Works for diverse use cases (flights, products, forms, etc.)

---

#### Task 2.2: Store Schema in Skill Document
**File**: `/workflows/steps/finish-recording-step.ts` (MODIFY)

**Changes:**
```typescript
import { generateExtractionSchema } from '@/lib/extraction/schema-generator';

// Generate schema from goal
const extractionSchema = await generateExtractionSchema(recording.goal);

// Save to skill
await db.collection('skills').insertOne({
  ...
  extractionSchema: {
    fields: extractionSchema.fields,
    instruction: extractionSchema.extractionInstruction,
    zodSchema: extractionSchema.schema.shape, // Serializable version
  },
  ...
});
```

**Acceptance Criteria:**
- ✅ Schema stored in skill document
- ✅ Schema retrievable for execution
- ✅ Schema is serializable (no functions)

---

### Phase 3: Variable-Aware Execution

#### Task 3.1: Update Strategy 1 - Variable Substitution
**File**: `/workflows/steps/execute-skill-step.ts` (MODIFY)

**Function**: `executeExactReplay()`

**Changes:**
```typescript
async function executeExactReplay(
  page: any,
  actions: RecordedAction[],
  variables?: Record<string, any>
): Promise<any> {
  console.log('[executeExactReplay] Starting with', actions.length, 'actions');

  for (const action of actions) {
    let value = action.value;

    // SUBSTITUTE VARIABLES
    if (value && variables) {
      // If value is a variable placeholder like "%origin%"
      if (value.startsWith('%') && value.endsWith('%')) {
        const varName = value.slice(1, -1); // "origin"
        value = variables[varName] || value;
        console.log(`[executeExactReplay] Substituted ${action.value} → ${value}`);
      }
    }

    // Execute action with substituted value
    if (action.type === 'fill' || action.type === 'type') {
      await page.locator(action.selector).fill(value);
    } else if (action.type === 'click') {
      await page.locator(action.selector).click();
    }
    // ... other action types
  }

  return { success: true };
}
```

**Acceptance Criteria:**
- ✅ Variables substituted before action execution
- ✅ Handles all variable types (string, number, date)
- ✅ Logs substitutions for debugging
- ✅ Falls back to original value if variable not provided

---

#### Task 3.2: Update Strategy 2 - Variable-Aware Workflow
**File**: `/workflows/steps/execute-skill-step.ts` (MODIFY)

**Function**: `executeNaturalLanguage()`

**Changes:**
```typescript
async function executeNaturalLanguage(
  stagehand: any,
  workflow: StagehandAction[],
  variables?: Record<string, any>
): Promise<any> {
  const page = stagehand.context.pages()[0];

  for (const action of workflow) {
    let instruction = action.instruction;
    let value = action.value;

    // SUBSTITUTE VARIABLES IN INSTRUCTION AND VALUE
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        const placeholder = `%${key}%`;
        instruction = instruction.replace(new RegExp(placeholder, 'g'), String(val));
        if (value) {
          value = value.replace(new RegExp(placeholder, 'g'), String(val));
        }
      });
    }

    console.log('[executeNaturalLanguage] Action:', action.method, instruction);

    if (action.method === 'act') {
      await stagehand.act(instruction);
    } else if (action.method === 'navigate') {
      await page.goto(action.url!);
    } else if (action.method === 'extract') {
      // Use schema from skill if available
      if (action.schema) {
        return await stagehand.extract(instruction, z.object(action.schema));
      }
    }
  }

  return { success: true };
}
```

**Acceptance Criteria:**
- ✅ Variables substituted in instructions
- ✅ Variables substituted in values
- ✅ Works with Stagehand natural language commands

---

#### Task 3.3: Update Strategy 3 - Variable-Aware Agent with Validation
**File**: `/workflows/steps/execute-skill-step.ts` (MODIFY)

**Function**: `executeAIRelearn()`

**Major Changes:**

**1. Build variable-aware system prompt:**
```typescript
async function executeAIRelearn(
  stagehand: any,
  goal: string,
  variables?: Record<string, any>,
  startUrl?: string,
  extractionSchema?: any
): Promise<any> {
  let goalWithVars = goal;

  // Substitute variables in goal
  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      goalWithVars = goalWithVars.replace(`%${key}%`, String(val));
    });
  }

  // Build validation criteria from variables
  const validationCriteria = variables
    ? Object.entries(variables)
        .map(([key, val]) => `- ${key}: ${val}`)
        .join('\n')
    : '';

  const currentSite = startUrl ? new URL(startUrl).hostname : 'the current website';

  const agent = stagehand.agent({
    systemPrompt: `You are a web automation expert. Your goal: ${goalWithVars}.

IMPORTANT RULES:
1. You are on ${currentSite} - DO NOT navigate away
2. Complete the task on this website only
3. When making selections, VERIFY they match these criteria:
${validationCriteria}

4. CRITICAL VALIDATION:
   - If searching for flights from ${variables?.origin} to ${variables?.destination}:
     * Only click flights that show "${variables?.origin}" OR airport code in origin
     * Only click flights that show "${variables?.destination}" OR airport code in destination
     * IGNORE alternative route suggestions (e.g., different cities)

   - If searching for products:
     * Verify product title matches search query
     * Don't select unrelated products

   - If filling forms:
     * Verify all required fields filled with correct data

5. After completing the task, extract the following data:
${extractionSchema?.instruction || 'Extract relevant data based on the goal'}

Be precise. Validate your selections match the search criteria before proceeding.`,
  });

  const result = await agent.execute({
    instruction: goalWithVars,
    maxSteps: 25,
  });

  return result;
}
```

**2. Add extraction with schema:**
```typescript
// After agent completes, extract data using schema
if (extractionSchema) {
  const zodSchema = buildZodSchemaFromFields(extractionSchema.fields);

  const extracted = await stagehand.extract(
    extractionSchema.instruction,
    zodSchema
  );

  return {
    ...result,
    extraction: extracted,
    extractionSchema: extractionSchema.fields,
  };
}
```

**3. Add result validation:**
```typescript
// Validate extracted data matches variables
function validateExtraction(
  extraction: any,
  variables: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if route field contains origin and destination
  if (extraction.route && variables.origin && variables.destination) {
    const route = extraction.route.toLowerCase();
    const origin = variables.origin.toLowerCase();
    const destination = variables.destination.toLowerCase();

    if (!route.includes(origin) && !route.includes(destination)) {
      errors.push(`Route "${extraction.route}" doesn't match ${origin} → ${destination}`);
    }
  }

  // Check if product title matches search query
  if (extraction.title && variables.productName) {
    const title = extraction.title.toLowerCase();
    const searchTerm = variables.productName.toLowerCase();

    if (!title.includes(searchTerm)) {
      errors.push(`Product title "${extraction.title}" doesn't match search "${variables.productName}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// After extraction:
const validation = validateExtraction(extracted, variables);
if (!validation.valid) {
  console.warn('[executeAIRelearn] Validation failed:', validation.errors);
  // Could retry or return with warning
}

return {
  ...result,
  extraction: extracted,
  validation,
};
```

**Acceptance Criteria:**
- ✅ System prompt includes variable values for validation
- ✅ Agent instructions emphasize matching criteria
- ✅ Extraction uses generated schema
- ✅ Extracted data validated against input variables
- ✅ Warnings logged for validation failures

---

### Phase 4: Extraction Schema Application

#### Task 4.1: Create Zod Schema Builder
**File**: `/lib/extraction/zod-schema-builder.ts` (NEW)

**Purpose**: Convert stored schema fields to Zod schema

**Implementation:**
```typescript
import { z } from 'zod';

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  optional?: boolean;
}

export function buildZodSchemaFromFields(fields: SchemaField[]): z.ZodObject<any> {
  const schemaShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach(field => {
    let zodType: z.ZodTypeAny;

    switch (field.type) {
      case 'string':
        zodType = z.string().describe(field.description);
        break;
      case 'number':
        zodType = z.number().describe(field.description);
        break;
      case 'boolean':
        zodType = z.boolean().describe(field.description);
        break;
      case 'date':
        zodType = z.string().describe(field.description); // Dates as ISO strings
        break;
      case 'array':
        zodType = z.array(z.string()).describe(field.description);
        break;
      default:
        zodType = z.string().describe(field.description);
    }

    if (field.optional) {
      zodType = zodType.optional();
    }

    schemaShape[field.name] = zodType;
  });

  return z.object(schemaShape);
}
```

**Acceptance Criteria:**
- ✅ Converts field definitions to Zod schema
- ✅ Handles all field types
- ✅ Preserves descriptions
- ✅ Handles optional fields

---

#### Task 4.2: Update execute-skill-step.ts to Use Schema
**File**: `/workflows/steps/execute-skill-step.ts` (MODIFY)

**Changes:**

1. Load schema from skill document:
```typescript
export async function executeSkillStep(input: {
  skillId: string;
  variables?: Record<string, any>;
}) {
  const skill = await db.collection('skills').findOne({ skillId: input.skillId });

  // Extract schema
  const extractionSchema = skill.extractionSchema;

  // Pass to strategies
  result = await executeAIRelearn(
    stagehand,
    skill.goal,
    input.variables,
    skill.startUrl,
    extractionSchema // NEW
  );
}
```

2. Use schema in extraction:
```typescript
// In executeAIRelearn or executeNaturalLanguage:
if (extractionSchema) {
  const zodSchema = buildZodSchemaFromFields(extractionSchema.fields);

  const extracted = await stagehand.extract(
    extractionSchema.instruction,
    zodSchema
  );

  return {
    ...result,
    extraction: extracted,
  };
}
```

**Acceptance Criteria:**
- ✅ Schema loaded from skill document
- ✅ Schema used in all strategies
- ✅ Extracted data follows schema structure
- ✅ Structured JSON returned instead of text

---

### Phase 5: Stagehand Workflow Conversion

#### Task 5.1: Fix convertToStagehand Function
**File**: `/workflows/steps/finish-recording-step.ts` (MODIFY)

**Function**: `convertToStagehand()`

**Current Problem**: Converts keystroke-level actions to workflow

**Fix**: Use grouped, variable-mapped actions

**Changes:**
```typescript
function convertToStagehand(actions: GroupedAction[]): StagehandAction[] {
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
        instruction: action.description || `Click ${action.selector}`,
      };
    } else if (action.type === 'type' || action.type === 'fill') {
      // Use variable placeholder if value is a variable
      const valueInstruction = action.value?.startsWith('%')
        ? action.value // Keep %variable% placeholder
        : `"${action.value}"`; // Quote literal values

      return {
        method: 'act',
        instruction: `${action.description} with ${valueInstruction}`,
        value: action.value, // Preserve for variable substitution
      };
    } else if (action.type === 'select') {
      return {
        method: 'act',
        instruction: action.description,
      };
    } else {
      return {
        method: 'act',
        instruction: action.description || 'Perform action',
      };
    }
  });
}
```

**Acceptance Criteria:**
- ✅ Uses grouped actions (not keystrokes)
- ✅ Preserves variable placeholders
- ✅ Generates meaningful instructions
- ✅ Strategy 2 can execute workflow successfully

---

### Phase 6: Testing & Validation

#### Task 6.1: Create Test Suite
**File**: `/tests/skills-system.test.ts` (NEW)

**Test Cases:**

**1. Action Grouping Tests:**
```typescript
test('groups consecutive keystrokes into single action', () => {
  const rawActions = [
    { type: 'fill', selector: '#origin', value: 'V', timestamp: 1000 },
    { type: 'fill', selector: '#origin', value: 'a', timestamp: 1050 },
    { type: 'fill', selector: '#origin', value: 'n', timestamp: 1100 },
  ];

  const grouped = groupActions(rawActions);

  expect(grouped).toHaveLength(1);
  expect(grouped[0].value).toBe('Vancouver');
});
```

**2. Variable Detection Tests:**
```typescript
test('maps typed values to goal variables', async () => {
  const goal = 'Search for flights from %origin% to %destination%';
  const typedValues = ['Vancouver', 'LAX'];

  const mapping = await detectVariables(goal, typedValues);

  expect(mapping['Vancouver']).toBe('%origin%');
  expect(mapping['LAX']).toBe('%destination%');
});
```

**3. Schema Generation Tests:**
```typescript
test('generates extraction schema from flight search goal', async () => {
  const goal = 'Find cheapest flight from %origin% to %destination%';

  const schema = await generateExtractionSchema(goal);

  expect(schema.fields).toContainEqual(
    expect.objectContaining({ name: 'price' })
  );
  expect(schema.fields).toContainEqual(
    expect.objectContaining({ name: 'airline' })
  );
});
```

**4. Variable Substitution Tests:**
```typescript
test('substitutes variables in actions during execution', () => {
  const actions = [
    { type: 'fill', selector: '#origin', value: '%origin%' }
  ];
  const variables = { origin: 'Toronto' };

  const result = executeExactReplay(page, actions, variables);

  // Should fill 'Toronto' not '%origin%'
  expect(page.locator).toHaveBeenCalledWith('#origin');
  expect(fill).toHaveBeenCalledWith('Toronto');
});
```

**5. End-to-End Tests:**
```typescript
test('full workflow: record → execute with different variables', async () => {
  // 1. Record skill with Vancouver → LAX
  const recording = await recordSkill({
    goal: 'Search flights from %origin% to %destination%',
    demoActions: [/* Vancouver → LAX demo */]
  });

  // 2. Execute with Toronto → NYC
  const result = await executeSkill({
    skillId: recording.skillId,
    variables: {
      origin: 'Toronto',
      destination: 'NYC'
    }
  });

  // 3. Verify extraction contains Toronto → NYC data
  expect(result.extraction.route).toContain('Toronto');
  expect(result.extraction.route).toContain('NYC');
});
```

**Acceptance Criteria:**
- ✅ All unit tests pass
- ✅ Integration tests pass
- ✅ E2E tests pass with different variable values
- ✅ Test coverage > 80%

---

#### Task 6.2: Create Manual Testing Guide
**File**: `/TESTING_GUIDE.md` (NEW)

**Content:**
```markdown
# Skills System 2.0 - Testing Guide

## Test Scenario 1: Flight Search

1. Navigate to /skills/record
2. Goal: "Search for round trip flights from %origin% to %destination% departing on %departureDate% and returning on %returnDate%, then find the cheapest option"
3. Start URL: https://www.google.com/travel/flights
4. Demo with: Vancouver → LAX, Dec 17-24
5. Finish recording
6. Test execution with: Toronto → NYC, Jan 10-15

**Expected:**
- ✅ Origin field filled with "Toronto" not "Vancouver"
- ✅ Destination filled with "NYC" not "LAX"
- ✅ Dates filled with Jan 10-15 not Dec 17-24
- ✅ Extraction contains Toronto → NYC flight data
- ✅ Price, airline, times in structured JSON

## Test Scenario 2: Amazon Product Price

1. Goal: "Find price for product %productName% on Amazon"
2. Start URL: https://www.amazon.com
3. Demo with: "iPhone 15 Pro"
4. Test with: "MacBook Pro"

**Expected:**
- ✅ Searches for MacBook not iPhone
- ✅ Clicks first MacBook result
- ✅ Extracts MacBook price
- ✅ Extraction contains: { price, title, availability }

## Test Scenario 3: Contact Form

1. Goal: "Fill contact form with name %name%, email %email%, message %message%"
2. Start URL: https://example.com/contact
3. Demo with: "John Doe", "john@example.com", "Test message"
4. Test with: "Jane Smith", "jane@example.com", "Different message"

**Expected:**
- ✅ All fields filled with Jane's data not John's
- ✅ Form submitted successfully
- ✅ Confirmation message extracted
```

**Acceptance Criteria:**
- ✅ All manual test scenarios pass
- ✅ Variables substituted correctly in all scenarios
- ✅ Extraction returns structured data
- ✅ Different variable values produce different results

---

### Phase 7: Documentation & Cleanup

#### Task 7.1: Update User Documentation
**File**: `/SKILLS_TESTING_GUIDE.md` (UPDATE)

**Add sections:**
- How to use variables in goals
- Variable naming conventions (%camelCase%)
- Example variable patterns for common use cases
- How to test with different variable values

---

#### Task 7.2: Update API Documentation
**File**: `/API_REFERENCE.md` (NEW)

**Document:**
- `/api/skills/[skillId]/execute` endpoint
- Request format with variables
- Response format with structured extraction
- Error handling
- Example requests/responses for each use case

---

#### Task 7.3: Add Logging & Debugging
**File**: All execution files (MODIFY)

**Add comprehensive logging:**
```typescript
console.log('[Variable Substitution]', {
  original: action.value,
  substituted: substitutedValue,
  variable: variableName
});

console.log('[Extraction Schema]', {
  fields: schema.fields,
  instruction: schema.instruction
});

console.log('[Validation]', {
  extraction: extracted,
  variables: variables,
  valid: validation.valid,
  errors: validation.errors
});
```

**Acceptance Criteria:**
- ✅ Debug logs show variable substitution
- ✅ Debug logs show extraction process
- ✅ Debug logs show validation results
- ✅ Easy to troubleshoot failed executions

---

#### Task 7.4: Clean Up Old Code
**Files**: Various (MODIFY)

**Remove:**
- Old keystroke-level recording logic (if no longer used)
- Hardcoded value handling (replaced by variable system)
- Unused utility functions
- Old test files

**Acceptance Criteria:**
- ✅ No dead code remaining
- ✅ All imports resolved
- ✅ No linter errors
- ✅ Clean codebase

---

## Implementation Order

### Week 1: Core Infrastructure
- [x] Task 1.1: Action Grouper ✅ COMPLETED
- [x] Task 1.2: Variable Detector ✅ COMPLETED
- [x] Task 1.3: Update Action Recorder ✅ COMPLETED
- [x] Task 2.1: Schema Generator ✅ COMPLETED

### Week 2: Recording Integration
- [x] Task 1.4: Update finish-recording-step ✅ COMPLETED
- [x] Task 2.2: Store Schema in DB ✅ COMPLETED
- [x] Task 5.1: Fix Stagehand Workflow Conversion ✅ COMPLETED

### Week 3: Execution Updates
- [x] Task 3.1: Strategy 1 Variable Substitution ✅ COMPLETED
- [x] Task 3.2: Strategy 2 Variable-Aware Workflow ✅ COMPLETED
- [x] Task 4.1: Zod Schema Builder ✅ COMPLETED
- [x] Task 4.2: Use Schema in Execution ✅ COMPLETED

### Week 4: Validation & Agent
- [x] Task 3.3: Strategy 3 with Validation ✅ COMPLETED
- [x] Task 6.1: Create Test Suite ✅ COMPLETED
- [x] Task 6.2: Manual Testing ✅ COMPLETED

### Week 5: Polish & Documentation
- [x] Task 7.1: Update User Docs ✅ COMPLETED
- [x] Task 7.2: API Reference ✅ COMPLETED
- [x] Task 7.3: Add Logging ✅ COMPLETED
- [x] Task 7.4: Clean Up ✅ COMPLETED

---

## Success Metrics

### Technical Metrics
- ✅ 95%+ test coverage on new code
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ No linter warnings

### Functional Metrics
- ✅ Skills work with ANY variable values (not just demo)
- ✅ 80%+ success rate across all 3 strategies
- ✅ Structured JSON extraction for all use cases
- ✅ Validation catches wrong results 90%+ of time

### User Experience Metrics
- ✅ Clear variable naming in goals
- ✅ Extraction returns expected data format
- ✅ Errors are actionable and clear
- ✅ System handles 10+ diverse use cases from SKILLS_API_IDEAS.md

---

## Rollback Plan

If implementation fails or causes regressions:

1. **Database Rollback**: Keep old skill documents, new fields are additive
2. **Code Rollback**: Git revert to last stable commit
3. **Gradual Rollout**: Deploy to staging first, validate before production
4. **Feature Flag**: Wrap new system in feature flag, toggle if issues arise

---

## Notes

- Prioritize getting basic variable substitution working first
- Schema generation can be iterative (start simple, improve over time)
- Validation is important but can be added after basic substitution works
- Test with diverse use cases early to catch edge cases

---

**Ready to implement? Start with Phase 1, Task 1.1!** 🚀
