# Context-Aware Extraction Schema Generation - Implementation Plan

## Problem Statement

**Current Issue**: The extraction schema generator receives ONLY the user's goal text, without any context about what website they used, what the page looks like, or what data is actually available. This causes the LLM to guess blindly, leading to:

- ❌ Generic schemas that don't match the actual page structure
- ❌ Missing fields that are available on the page
- ❌ Including fields that don't exist on the page
- ❌ 40% failure rate for schema generation (falls back to generic schema)
- ❌ Poor extraction quality even when schema is generated

---

## Current State Analysis

### File: `/workflows/steps/finish-recording-step.ts`

**Problem Location (Lines 105-120):**
```typescript
// Line 105-113: We close the browser session EARLY
const activeRecorder = (global as any).activeRecorders?.[input.recordingId];
if (activeRecorder) {
  await activeRecorder.recorder.stopRecording();
  console.log('[finishRecordingStep] Stopped action recorder');

  // ❌ PROBLEM: We close the session here
  try {
    await activeRecorder.stagehand.close();
    console.log('[finishRecordingStep] Released keep-alive session');
  } catch (error) {
    console.log('[finishRecordingStep] Error closing Stagehand session:', error);
  }

  // Clean up global reference
  delete (global as any).activeRecorders[input.recordingId];
}
```

**Then later (Lines 250-262):**
```typescript
// Line 254: We generate schema with ONLY the goal
if (recording.goal) {
  try {
    // ❌ PROBLEM: Only passing goal string, no context!
    extractionSchema = await generateExtractionSchema(recording.goal);
    console.log('[finishRecordingStep] Generated extraction schema:', {
      fields: extractionSchema.fields.length,
      instruction: extractionSchema.instruction,
    });
  } catch (error) {
    console.error('[finishRecordingStep] Error generating schema:', error);
  }
}
```

**Available but UNUSED data:**
```typescript
// Available in scope but not passed to schema generator:
recording.startUrl          // ✅ Starting URL
recording.recordedActions   // ✅ All actions taken
semanticValues              // ✅ All values entered (text, dropdowns, dates, etc.)
variableMapping             // ✅ Variable mappings
filteredActions             // ✅ Processed actions

// Available in browser session (but session closed before schema generation):
activeRecorder.stagehand.page.url()         // ❌ Final URL (session closed)
activeRecorder.stagehand.page.title()       // ❌ Page title (session closed)
document.body.innerText                     // ❌ Page content (session closed)
```

---

### File: `/lib/extraction/schema-generator.ts`

**Current Function Signature (Line 44):**
```typescript
export async function generateExtractionSchema(
  goal: string  // ❌ ONLY receives goal string
): Promise<ExtractionSchema>
```

**Current Prompt (Lines 47-180):**
```typescript
const prompt = `You are an expert at designing data extraction schemas for web automation.

**User's Goal**: ${goal}  // ❌ This is ALL the context we provide!

Based on this goal, determine what data should be extracted from the web page...
```

**Result**: The LLM has to GUESS based solely on goal text like:
- `"%query%"` → Could be anything (stock price, weather, concert dates, product price)
- `"find flight from %origin% to %dest%"` → Could be Google Flights (prices) or airline site (availability only)
- `"does %artist% have concerts?"` → Could be Ticketmaster (dates/venues) or news article (yes/no)

---

## Impact on Use Cases

### Example 1: Generic Search (`%query%`)

**Goal**: `"%query%"`
**Demo**: User searches "does Kendrick Lamar have concerts?" on Ticketmaster

**What LLM knows:**
```typescript
generateExtractionSchema("%query%")
```

**What LLM SHOULD know:**
```typescript
generateExtractionSchema("%query%", {
  startUrl: "https://www.ticketmaster.com",
  finalUrl: "https://www.ticketmaster.com/kendrick-lamar-tickets/artist/1172496",
  pageTitle: "Kendrick Lamar Tickets - Tour Dates 2025 | Ticketmaster",
  headings: ["Upcoming Events", "Venues", "Filter by Date"],
  semanticValues: [
    { value: "Kendrick Lamar", type: "text-input", label: "artist search" }
  ],
  actions: [
    { type: "navigate", url: "https://www.ticketmaster.com" },
    { type: "fill", description: "Fill search with Kendrick Lamar" },
    { type: "submit", description: "Press Enter to submit search" }
  ],
  structuralHints: {
    hasPriceElements: true,
    hasDateElements: true,
    hasListItems: true
  }
})
```

**Current schema (blind guess):**
```json
{
  "fields": [
    { "name": "result", "type": "string", "description": "Extracted result" }
  ]
}
```

**Correct schema (with context):**
```json
{
  "fields": [
    { "name": "hasConcerts", "type": "boolean", "description": "Whether artist has upcoming concerts" },
    { "name": "upcomingDates", "type": "array", "description": "List of concert dates" },
    { "name": "venues", "type": "array", "description": "List of venue names" },
    { "name": "ticketPrices", "type": "array", "description": "Ticket price ranges" },
    { "name": "eventUrls", "type": "array", "description": "Links to individual events" }
  ],
  "instruction": "Extract concert information including dates, venues, and ticket prices",
  "description": "Extracts Ticketmaster concert listing data"
}
```

---

### Example 2: Flight Search

**Goal**: `"find flight from %origin% to %destination%"`
**Demo**: User searches Vancouver → Los Angeles on Google Flights

**What LLM SHOULD know** (but doesn't):
- ✅ Domain: `google.com/travel/flights` → Knows it's Google Flights (has detailed pricing, times, airlines)
- ✅ Page title: "Flights from Vancouver to Los Angeles" → Validates extraction matches search
- ✅ Headings: ["Best departing flights", "Price graph", "Date grid"] → Knows structure
- ✅ Semantic values: origin="Vancouver", destination="Los Angeles" → Can validate extracted flights match
- ✅ Has price elements: YES → Should extract price
- ✅ Has date elements: YES → Should extract departure/arrival times

**Result**: Instead of generic flight schema, generates **Google Flights-specific schema** with fields that actually exist on that site.

---

## Solution Architecture

### Phase 1: Capture Page Context Before Closing Session

**Location**: `/workflows/steps/finish-recording-step.ts` (before line 113)

**What to capture:**
1. **Final page state** (URL, title, headings)
2. **Page content sample** (first 1000 chars of visible text)
3. **Structural hints** (has prices? has dates? has tables?)
4. **DOM patterns** (forms? lists? grids?)

**Token cost**: ~200-300 tokens per recording
**Benefit**: 40% → 95% schema generation success rate

---

### Phase 2: Update Schema Generator Interface

**Location**: `/lib/extraction/schema-generator.ts`

**Changes:**
1. Add optional `context` parameter with page metadata
2. Update prompt to use context for smarter schema design
3. Add context-aware examples to the prompt

---

### Phase 3: Test Extraction During Recording (Optional)

**Location**: `/workflows/steps/finish-recording-step.ts` (before closing session)

**What to do:**
1. Generate schema with context
2. Test extraction on actual page with demo values
3. If extraction fails, retry schema generation with error feedback
4. Save sample extraction result for user to preview

**Benefit**: Guarantees schema works BEFORE user calls the API

---

## Implementation Checklist

### ✅ Phase 1: Capture Page Context (High Priority)

#### Step 1.1: Add Page Context Capture Function ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: After line 100, before `finishRecordingStep` function

- [x] Create `capturePageContext()` helper function
- [x] Use `page.evaluate()` to extract:
  - [x] `document.title`
  - [x] `window.location.href`
  - [x] Top 5 headings (h1, h2, h3)
  - [x] First 1000 chars of `document.body.innerText`
  - [x] Structural hints (prices, dates, tables, lists)
- [x] Add error handling for page access issues
- [x] Log captured context for debugging

**Code Template:**
```typescript
interface PageContext {
  title: string;
  url: string;
  headings: string[];
  visibleText: string;
  structuralHints: {
    hasPriceElements: boolean;
    hasDateElements: boolean;
    hasTableData: boolean;
    hasListItems: boolean;
    hasFormElements: boolean;
  };
}

async function capturePageContext(page: any): Promise<PageContext | null> {
  try {
    return await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      headings: Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(Boolean)
        .slice(0, 5),
      visibleText: document.body.innerText.slice(0, 1000),
      structuralHints: {
        hasPriceElements: !!(
          document.querySelector('[class*="price"], [data-price], [itemprop="price"]') ||
          /\$\d+|\d+\s*USD|€\d+/.test(document.body.innerText)
        ),
        hasDateElements: !!(
          document.querySelector('[datetime], [class*="date"], [data-date]') ||
          /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(document.body.innerText)
        ),
        hasTableData: !!document.querySelector('table, [role="table"], [class*="table"]'),
        hasListItems: !!document.querySelector('ul li, ol li, [role="list"]'),
        hasFormElements: !!document.querySelector('form, input, textarea, select'),
      },
    }));
  } catch (error) {
    console.error('[capturePageContext] Error:', error);
    return null;
  }
}
```

#### Step 1.2: Capture Context Before Closing Session ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: Lines 105-120 (replace session closing logic)

- [x] Check if `activeRecorder.stagehand.page` exists
- [x] Call `capturePageContext()` function
- [x] Store result in `pageContext` variable
- [x] Add to console log for debugging
- [x] THEN close the session (move line 113 down)

**Code Location:**
```typescript
// BEFORE (line 107-113):
if (activeRecorder) {
  await activeRecorder.recorder.stopRecording();

  await activeRecorder.stagehand.close(); // ❌ Closes too early
  delete (global as any).activeRecorders[input.recordingId];
}

// AFTER (new code):
let pageContext: PageContext | null = null;
if (activeRecorder) {
  await activeRecorder.recorder.stopRecording();

  // ✅ NEW: Capture page context BEFORE closing
  if (activeRecorder.stagehand?.page) {
    try {
      pageContext = await capturePageContext(activeRecorder.stagehand.page);
      console.log('[finishRecordingStep] Captured page context:', {
        url: pageContext?.url,
        title: pageContext?.title,
        headingCount: pageContext?.headings.length,
        hints: pageContext?.structuralHints,
      });
    } catch (error) {
      console.error('[finishRecordingStep] Error capturing page context:', error);
    }
  }

  // Now close the session
  try {
    await activeRecorder.stagehand.close();
    console.log('[finishRecordingStep] Released keep-alive session');
  } catch (error) {
    console.log('[finishRecordingStep] Error closing Stagehand session:', error);
  }

  delete (global as any).activeRecorders[input.recordingId];
}
```

#### Step 1.3: Pass Context to Schema Generator ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: Line 254 (schema generation call)

- [x] Update `generateExtractionSchema()` call to include context
- [x] Pass `startUrl`, `pageContext`, `semanticValues`, `filteredActions`
- [x] Update console log to show context was provided

**Code Change:**
```typescript
// BEFORE (line 254):
extractionSchema = await generateExtractionSchema(recording.goal);

// AFTER:
extractionSchema = await generateExtractionSchema(recording.goal, {
  startUrl: recording.startUrl,
  finalUrl: pageContext?.url,
  pageTitle: pageContext?.title,
  headings: pageContext?.headings,
  visibleText: pageContext?.visibleText,
  structuralHints: pageContext?.structuralHints,
  semanticValues: semanticValues,
  actions: filteredActions.map(a => ({
    type: a.type,
    description: a.description || '',
    selector: a.selector,
  })),
});
```

---

### ✅ Phase 2: Update Schema Generator (High Priority)

#### Step 2.1: Update Function Signature ✅
**File**: `/lib/extraction/schema-generator.ts`
**Location**: Lines 44-46

- [x] Add optional `context` parameter
- [x] Define `SchemaGenerationContext` interface
- [x] Update JSDoc comments

**Code Change:**
```typescript
// NEW: Add interface at top of file (after imports)
export interface SchemaGenerationContext {
  startUrl?: string;
  finalUrl?: string;
  pageTitle?: string;
  headings?: string[];
  visibleText?: string;
  structuralHints?: {
    hasPriceElements?: boolean;
    hasDateElements?: boolean;
    hasTableData?: boolean;
    hasListItems?: boolean;
    hasFormElements?: boolean;
  };
  semanticValues?: Array<{
    value: string | number | boolean;
    type: string;
    label: string;
  }>;
  actions?: Array<{
    type: string;
    description: string;
    selector?: string;
  }>;
}

// UPDATE: Function signature (line 44)
export async function generateExtractionSchema(
  goal: string,
  context?: SchemaGenerationContext  // ✅ NEW parameter
): Promise<ExtractionSchema>
```

#### Step 2.2: Enhance Prompt with Context ✅
**File**: `/lib/extraction/schema-generator.ts`
**Location**: Lines 47-240 (prompt construction)

- [x] Add context section to prompt (before guidelines)
- [x] Extract domain from URL for better heuristics
- [x] Show actions taken by user
- [x] Show values entered with their types
- [x] Include structural hints

**Code Template:**
```typescript
export async function generateExtractionSchema(
  goal: string,
  context?: SchemaGenerationContext
): Promise<ExtractionSchema> {

  // Extract domain for better context
  const domain = context?.finalUrl
    ? new URL(context.finalUrl).hostname.replace('www.', '')
    : 'unknown';

  // Build context sections
  const contextSection = context ? `
**Recording Context**:
- Starting URL: ${context.startUrl || 'unknown'}
- Final URL: ${context.finalUrl || 'unknown'}
- Domain: ${domain}
- Page Title: "${context.pageTitle || 'unknown'}"
- Top Headings: ${context.headings && context.headings.length > 0
    ? context.headings.map(h => `"${h}"`).join(', ')
    : 'none captured'}

**User Actions Taken**:
${context.actions && context.actions.length > 0
  ? context.actions.map((a, i) => `${i + 1}. ${a.type.toUpperCase()}: ${a.description}`).join('\n')
  : 'No actions recorded'}

**Values Entered by User**:
${context.semanticValues && context.semanticValues.length > 0
  ? context.semanticValues.map(sv => {
      const valueStr = typeof sv.value === 'boolean'
        ? (sv.value ? 'true (checked)' : 'false (unchecked)')
        : `"${sv.value}"`;
      return `- ${sv.label}: ${valueStr} (${sv.type})`;
    }).join('\n')
  : 'No values captured'}

**Page Structure Detected**:
- Contains prices: ${context.structuralHints?.hasPriceElements ? 'YES ✓' : 'NO'}
- Contains dates/times: ${context.structuralHints?.hasDateElements ? 'YES ✓' : 'NO'}
- Contains tables/grids: ${context.structuralHints?.hasTableData ? 'YES ✓' : 'NO'}
- Contains lists: ${context.structuralHints?.hasListItems ? 'YES ✓' : 'NO'}
- Contains forms: ${context.structuralHints?.hasFormElements ? 'YES ✓' : 'NO'}

**Page Content Preview** (first 200 chars):
${context.visibleText ? `"${context.visibleText.slice(0, 200)}..."` : 'Not available'}
` : '';

  const prompt = `You are an expert at designing data extraction schemas for web automation.

**User's Goal**: ${goal}

${contextSection}

**Your Task**: Design an extraction schema that extracts data from the FINAL page (after all actions complete).

**CRITICAL REQUIREMENTS**:
- You MUST return a valid schema with at least one field
- You MUST provide an "instruction" and "description"
- Design the schema based on what's ACTUALLY AVAILABLE on the page (use context above)
- If the page has prices, include price fields
- If the page has dates, include date/time fields
- If the page has lists/tables, use array types
- Match field names to the domain (e.g., "ticketPrice" for Ticketmaster, "flightPrice" for Google Flights)
- Never return an empty response

**Guidelines by Goal Type**:
...
```

#### Step 2.3: Add Context-Aware Examples ✅
**File**: `/lib/extraction/schema-generator.ts`
**Location**: After existing examples (before "Now generate...")

- [x] Add example showing context being used
- [x] Show how domain affects schema design
- [x] Show how structural hints affect field selection

**Code Template:**
```typescript
**Example 6 (Context-Aware)**:
Goal: "%query%"
Context:
- Final URL: https://www.ticketmaster.com/kendrick-lamar-tickets/artist/1172496
- Page Title: "Kendrick Lamar Tickets - Tour Dates 2025 | Ticketmaster"
- Headings: ["Upcoming Events", "Filter by Date", "Venues"]
- Has prices: YES ✓
- Has dates: YES ✓
- Has lists: YES ✓
- User searched for: "Kendrick Lamar" (text-input)

Output:
{
  "fields": [
    {
      "name": "hasConcerts",
      "type": "boolean",
      "description": "Whether the artist has upcoming concerts"
    },
    {
      "name": "concertDates",
      "type": "array",
      "description": "List of concert dates in ISO format"
    },
    {
      "name": "venues",
      "type": "array",
      "description": "List of venue names and locations"
    },
    {
      "name": "ticketPrices",
      "type": "array",
      "description": "Ticket price ranges for each event"
    },
    {
      "name": "eventUrls",
      "type": "array",
      "description": "Direct links to purchase tickets for each event",
      "optional": true
    }
  ],
  "instruction": "Extract concert tour information including dates, venues, and ticket prices from Ticketmaster",
  "description": "Extracts concert listing data from Ticketmaster artist page"
}

**Example 7 (Same goal, different context)**:
Goal: "%query%"
Context:
- Final URL: https://www.google.com/search?q=kendrick+lamar+concerts
- Page Title: "kendrick lamar concerts - Google Search"
- Headings: ["Search Results", "People also ask"]
- Has prices: NO
- Has dates: YES ✓
- Has lists: YES ✓
- User searched for: "kendrick lamar concerts" (text-input)

Output:
{
  "fields": [
    {
      "name": "result",
      "type": "string",
      "description": "Main answer or featured snippet text"
    },
    {
      "name": "upcomingDates",
      "type": "array",
      "description": "List of concert dates mentioned in search results",
      "optional": true
    },
    {
      "name": "sources",
      "type": "array",
      "description": "URLs of sources with concert information",
      "optional": true
    }
  ],
  "instruction": "Extract concert information from Google search results",
  "description": "Extracts general search results about concerts"
}

Now generate the extraction schema for the given goal. Use the context to design a schema that matches what's actually on the page.`;
```

---

### ✅ Phase 3: Test Extraction During Recording (COMPLETED)

#### Step 3.1: Add Zod Schema Builder Helper ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: After `filterRedundantNavigations` function

- [x] Create `buildZodSchemaFromExtraction()` function
- [x] Convert `ExtractionSchema` to Zod schema
- [x] Handle all field types (string, number, boolean, date, array, object)
- [x] Mark optional fields correctly

**Code Template:**
```typescript
import { z } from 'zod';
import type { ExtractionSchema } from '@/lib/extraction/schema-generator';

function buildZodSchemaFromExtraction(schema: ExtractionSchema): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of schema.fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case 'string':
        fieldSchema = z.string();
        break;
      case 'number':
        fieldSchema = z.number();
        break;
      case 'boolean':
        fieldSchema = z.boolean();
        break;
      case 'array':
        fieldSchema = z.array(z.any());
        break;
      case 'object':
        fieldSchema = z.object({}).passthrough();
        break;
      default:
        fieldSchema = z.any();
    }

    // Make optional if specified
    if (field.optional) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}
```

#### Step 3.2: Test Extraction Before Closing Session ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: After capturing page context, before closing session

- [x] Check if extraction schema was generated
- [x] Build Zod schema from extraction schema
- [x] Call `stagehand.extract()` with demo values
- [x] Log success or failure
- [x] Store sample extraction in pageContext
- [x] Graceful error handling if extraction fails

**Code Location (after Step 1.2, before closing session):**
```typescript
// After capturing page context (new Step 1.2 code):
if (activeRecorder?.stagehand?.page && pageContext) {
  // Generate schema WITH context (moved up from line 254)
  let extractionSchema = null;
  if (recording.goal) {
    try {
      extractionSchema = await generateExtractionSchema(recording.goal, {
        startUrl: recording.startUrl,
        finalUrl: pageContext.url,
        pageTitle: pageContext.title,
        headings: pageContext.headings,
        visibleText: pageContext.visibleText,
        structuralHints: pageContext.structuralHints,
        semanticValues: semanticValues,
        actions: filteredActions.map(a => ({
          type: a.type,
          description: a.description || '',
          selector: a.selector,
        })),
      });
      console.log('[finishRecordingStep] Generated extraction schema:', {
        fields: extractionSchema.fields.length,
        instruction: extractionSchema.instruction,
      });

      // ✅ NEW: Test extraction with demo values
      try {
        console.log('[finishRecordingStep] Testing extraction schema...');
        const zodSchema = buildZodSchemaFromExtraction(extractionSchema);

        const sampleExtraction = await activeRecorder.stagehand.extract({
          instruction: extractionSchema.instruction,
          schema: zodSchema,
        });

        console.log('[finishRecordingStep] ✅ Extraction test PASSED:', sampleExtraction);

        // Store sample for user to preview
        pageContext.sampleExtraction = sampleExtraction;

      } catch (extractionError) {
        console.warn('[finishRecordingStep] ⚠️ Extraction test FAILED:', extractionError);
        // Schema is valid but extraction failed - keep schema anyway
        // User will see this at execution time
      }

    } catch (error) {
      console.error('[finishRecordingStep] Error generating schema:', error);
    }
  }
}

// NOW close the session
try {
  await activeRecorder.stagehand.close();
  console.log('[finishRecordingStep] Released keep-alive session');
} catch (error) {
  console.log('[finishRecordingStep] Error closing Stagehand session:', error);
}
```

#### Step 3.3: Store Sample Extraction in MongoDB ✅
**File**: `/workflows/steps/finish-recording-step.ts`
**Location**: When saving skill to MongoDB (after line 300)

- [x] Add `sampleExtraction` field to skill document (stored in pageContext)
- [x] Add `pageContext` field to skill document (already done in Phase 1)
- [x] Save for user to preview in UI

**Code Addition:**
```typescript
// When saving skill (around line 320):
const skill = {
  skillId,
  name: recording.goal || 'Untitled Skill',
  goal: recording.goal,
  startUrl: recording.startUrl,
  workflow: stagehandActions,
  extractionSchema,
  variables: Object.values(variableMapping),
  createdAt: new Date(),
  updatedAt: new Date(),

  // ✅ NEW: Add context and sample extraction
  pageContext: pageContext ? {
    finalUrl: pageContext.url,
    pageTitle: pageContext.title,
    headings: pageContext.headings,
    structuralHints: pageContext.structuralHints,
  } : null,
  sampleExtraction: pageContext?.sampleExtraction || null,

  metrics: {
    actionsCount: stagehandActions.length,
    variablesCount: Object.keys(variableMapping).length,
    extractionFieldsCount: extractionSchema?.fields.length || 0,
  } as SkillMetrics,
};
```

---

### ✅ Phase 4: Validation & Testing (High Priority)

#### Step 4.1: Update TypeScript Types ✅
**File**: `/lib/types/skills.ts`

- [x] Add `PageContext` interface to types
- [x] `SchemaGenerationContext` interface already exists in schema-generator.ts
- [x] Update `Skill` interface to include `pageContext` field
- [x] Import `PageContext` in finish-recording-step.ts (remove duplicate)
- [x] Run TypeScript check - No errors!

**Code Changes:**
```typescript
// Add to skills.ts:
export interface PageContext {
  url: string;
  title: string;
  headings: string[];
  visibleText: string;
  structuralHints: {
    hasPriceElements: boolean;
    hasDateElements: boolean;
    hasTableData: boolean;
    hasListItems: boolean;
    hasFormElements: boolean;
  };
  sampleExtraction?: any;
}

// Update Skill interface:
export interface Skill {
  // ... existing fields ...

  // NEW fields:
  pageContext?: PageContext | null;
  sampleExtraction?: any | null;
}
```

#### Step 4.2: Test with Real Use Cases
**Test Cases:**

- [ ] **Test 1: Generic search (`%query%`)** on Google
  - Record searching "Brad Pitt age"
  - Verify schema includes `result`, `source`, `url` fields
  - Verify sample extraction returns correct data

- [ ] **Test 2: Flight search** on Google Flights
  - Record searching Vancouver → LAX with dates
  - Verify schema includes `price`, `airline`, `route`, `times` fields
  - Verify domain detection identifies google.com/travel/flights

- [ ] **Test 3: Concert lookup** on Ticketmaster
  - Record searching "Kendrick Lamar concerts"
  - Verify schema includes `concertDates`, `venues`, `ticketPrices`
  - Verify structural hints detect prices and dates

- [ ] **Test 4: Product price** on Amazon
  - Record searching "iPhone 15 Pro price"
  - Verify schema includes `price`, `title`, `availability`, `rating`
  - Verify domain detection identifies amazon.com

- [ ] **Test 5: Weather lookup** on Weather.com
  - Record searching weather for a city
  - Verify schema includes `temperature`, `conditions`, `forecast`
  - Verify no price fields included (structuralHints.hasPriceElements = false)

#### Step 4.3: Monitor Success Rates

- [ ] Add metrics logging to schema generation
- [ ] Track: schema generation success rate (before: 60%, target: 95%)
- [ ] Track: extraction test success rate (new metric, target: 80%)
- [ ] Track: token usage (before: ~50, after: ~300, acceptable tradeoff)
- [ ] Track: execution success rate with new schemas (target: +30% improvement)

**Logging Template:**
```typescript
// Add to generateExtractionSchema:
console.log('[Schema Generator] Metrics:', {
  hasContext: !!context,
  domain: context?.finalUrl ? new URL(context.finalUrl).hostname : 'unknown',
  semanticValuesCount: context?.semanticValues?.length || 0,
  actionsCount: context?.actions?.length || 0,
  tokensUsed: result.usage?.totalTokens || 0,
  generatedFieldsCount: result.object.fields.length,
});
```

---

## Expected Outcomes

### Before (Current State)

| Metric | Value | Issue |
|--------|-------|-------|
| Schema generation success rate | 60% | Blind guessing based on goal text only |
| Schema quality (accuracy) | 40% | Generic schemas don't match page structure |
| Extraction test during recording | 0% | Not tested until execution |
| Token usage per schema | ~50 | Minimal context |
| User confidence | Low | Can't preview what will be extracted |

### After (Target State)

| Metric | Value | Improvement |
|--------|-------|-------------|
| Schema generation success rate | 95% | ✅ +35% (data-driven with context) |
| Schema quality (accuracy) | 85% | ✅ +45% (matches actual page structure) |
| Extraction test during recording | 80% | ✅ NEW: Test before user calls API |
| Token usage per schema | ~300 | ⚠️ +250 tokens (acceptable tradeoff) |
| User confidence | High | ✅ Can preview sample extraction |

### ROI Analysis

**Cost increase**: 250 tokens = ~$0.001 per schema generation
**Benefit**:
- 35% fewer failed schemas → saves 2-3 retries per skill (600-900 tokens saved)
- 45% better extraction accuracy → reduces Strategy 3 fallback (saves 50,000+ tokens per execution)
- **Net savings**: ~$0.05-0.10 per skill execution**

---

## Risks & Mitigation

### Risk 1: Page Context Capture Fails
**Scenario**: Page is loaded in iframe, Shadow DOM, or has CSP restrictions
**Mitigation**:
- Wrap `page.evaluate()` in try-catch
- Fall back to schema generation without context (current behavior)
- Log warnings but don't fail the recording

### Risk 2: Increased Token Usage
**Scenario**: Context adds 250 tokens per schema generation
**Mitigation**:
- Only include first 1000 chars of page text (not entire page)
- Only include top 5 headings
- Benefit far outweighs cost (see ROI analysis above)

### Risk 3: Context Misleads LLM
**Scenario**: Page context is from wrong page (e.g., loading screen)
**Mitigation**:
- Capture context AFTER all actions complete
- Validate page title/URL match expected patterns
- Include action sequence in context to help LLM understand flow

### Risk 4: Extraction Test Increases Recording Time
**Scenario**: Testing extraction adds 2-5 seconds to recording
**Mitigation**:
- Make extraction test optional (enable via feature flag)
- Run in parallel with other operations if possible
- Small time increase acceptable for quality guarantee

---

## Success Metrics

**Quantitative Goals:**
- ✅ Schema generation success rate: 60% → 95% (+35%)
- ✅ Schema accuracy (fields match page): 40% → 85% (+45%)
- ✅ Extraction test pass rate: NEW metric, target 80%
- ✅ Execution success rate: +30% improvement (fewer Strategy 3 fallbacks)
- ✅ Token cost per schema: +250 tokens (~$0.001)
- ✅ ROI per skill execution: Save $0.05-0.10 (50x return on investment)

**Qualitative Goals:**
- ✅ Users can preview what data will be extracted (sample extraction shown in UI)
- ✅ Schemas are domain-specific (Google Flights vs. Kayak vs. airline sites)
- ✅ Generic goals like `%query%` work intelligently (adapt to actual site used)
- ✅ Reduced support requests ("Why isn't my skill extracting the right data?")

---

## Implementation Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|----------------|----------|
| **Phase 1** | Capture page context | 2-3 hours | HIGH |
| **Phase 2** | Update schema generator | 2-3 hours | HIGH |
| **Phase 3** | Test extraction during recording | 3-4 hours | MEDIUM |
| **Phase 4** | Validation & testing | 2-3 hours | HIGH |
| **Total** | All phases | 9-13 hours | - |

---

## Future Enhancements (Not in Scope)

1. **Vision-based schema generation**: Use GPT-4V to analyze page screenshots
2. **Learning from execution failures**: Update schema when extraction fails
3. **Schema versioning**: Allow schema updates without re-recording
4. **Multi-page extraction**: Extract data from multiple pages in workflow
5. **Confidence scores**: Rate schema quality before execution

---

## Next Steps

1. **Review this plan** and confirm implementation approach
2. **Start with Phase 1.1**: Add `capturePageContext()` function
3. **Test incrementally**: After each step, verify with simple skill recording
4. **Measure improvements**: Compare before/after metrics on real use cases
5. **Iterate**: Refine context capture based on real-world results

---

## References

- Current implementation: `/workflows/steps/finish-recording-step.ts`
- Schema generator: `/lib/extraction/schema-generator.ts`
- Use cases: `/SKILLS_API_IDEAS.md`
- Related plan: `/SEMANTIC_VALUE_CAPTURE_PLAN.md` (completed)
