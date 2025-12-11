# Semantic Value Capture - Implementation Plan

## Analysis: Real-World Use Cases

Based on 20 documented use cases (`SKILLS_API_IDEAS.md`) and actual testing, here's what interaction patterns we need to support:

### Interaction Pattern Frequency (20 use cases analyzed)

| Pattern | Frequency | Examples |
|---------|-----------|----------|
| **Text Search** | 100% (20/20) | Product names, locations, keywords, tracking numbers |
| **Dropdowns** | 65% (13/20) | Cabin class, property type, make/model, service type |
| **Date Pickers** | 45% (9/20) | Flight dates, hotel check-in/out, appointments, events |
| **Number/Range Inputs** | 40% (8/20) | Guest count, price ranges, weight, quantity |
| **Filters/Checkboxes** | 35% (7/20) | Remote jobs, price filters, rating filters |
| **Location Inputs** | 40% (8/20) | Addresses, cities, airports, zip codes |
| **Multi-step Forms** | 25% (5/20) | Contact forms, booking flows, checkout |

### Current Support Status

✅ **Fully Supported** (works in all 3 strategies):
- Text inputs (search, names, messages)

⚠️ **Partially Supported** (Strategy 3 only, expensive):
- Date pickers
- Dropdowns
- Number inputs
- Range sliders
- Checkboxes
- Radio buttons

❌ **Not Captured at All**:
- Selected dropdown values (we record the click, not the value)
- Checked states (we record the click, not true/false)
- Slider positions (we record the click, not the number)

### Test Results: Flight Search Skill

**What we learned:**
- ✅ Cities (text inputs): Worked in Strategy 1 (fast, free)
- ❌ Dates (calendar widgets): Failed Strategy 1 & 2, fell back to Strategy 3
- 📊 Execution: 84 seconds, ~$0.05-0.10, partial success (wrong data extracted)
- 🎯 **Key insight**: Agent got confused even in Strategy 3, extracted Chicago flights instead of NYC→Tokyo

**Impact**: 45% of use cases (9/20) involve date pickers, 65% (13/20) involve dropdowns. Current system is expensive and unreliable for majority of real-world workflows.

---

## Overview of Current System

### Current Recording System

**File**: `/lib/capture/action-recorder.ts`

**How it works:**
1. Injects JavaScript into the page to listen for DOM events
2. Captures raw interactions:
   ```javascript
   // Text input - ✅ Captures semantic value
   { type: 'fill', selector: '#origin', value: 'vancouver' }

   // Click on button - ❌ No semantic value
   { type: 'click', selector: '#calendar-day-17', description: 'Click ", 245 US dollars"' }

   // Click on dropdown option - ❌ No semantic value
   { type: 'click', selector: '.dropdown-item[data-value="economy"]', description: 'Click "Economy"' }
   ```

3. Groups multiple raw events into semantic actions (via `action-grouper.ts`)
4. Stores recorded actions in MongoDB

**Limitation**: Only text inputs have semantic values. Clicks on date pickers, dropdowns, checkboxes, etc. are captured as simple click events without understanding what value was selected.

---

### Current Strategy 2 (Natural Language)

**File**: `/workflows/steps/execute-skill-step.ts` → `executeNaturalLanguage()`

**How it works:**
1. Converts recorded actions to natural language instructions
2. Substitutes variables in instructions
3. Uses Stagehand `act()` to execute with AI

**Example conversion** (`convertToStagehand()` in `finish-recording-step.ts`):
```javascript
// Recorded action:
{ type: 'fill', selector: '#origin', value: '%origin%' }

// Converted to:
{ method: 'act', instruction: 'Fill origin with %origin%' }

// At execution with variables:
{ method: 'act', instruction: 'Fill origin with Seattle' }
```

**Problem with current approach for date pickers:**
```javascript
// Recorded action:
{ type: 'click', selector: '#calendar-day-17', description: 'Click ", 245 US dollars"' }

// Converted to (NOT semantic):
{ method: 'act', instruction: 'Click ", 245 US dollars"' }

// What we NEED:
{ method: 'act', instruction: 'Select departure date %departureDate%' }
// At execution: 'Select departure date December 17, 2025'
```

The instruction `'Click ", 245 US dollars"'` doesn't help the AI understand:
- What is being selected (a date)
- Which semantic variable it corresponds to (%departureDate%)
- What the actual value is (2025-12-17)

---

## The Problem: Widget Interactions Without Semantic Values

### Date Pickers
**User action**: Clicks on December 17 in a calendar widget
**What we capture**: `{ type: 'click', selector: '#calendar-day-17' }`
**What we need**: `{ type: 'date-select', semanticValue: '2025-12-17', intent: 'departure date' }`

### Dropdowns
**User action**: Selects "Economy" from cabin class dropdown
**What we capture**: `{ type: 'click', selector: '.dropdown-item' }`
**What we need**: `{ type: 'select', semanticValue: 'economy', intent: 'cabin class' }`

### Checkboxes/Toggles
**User action**: Checks "Direct flights only"
**What we capture**: `{ type: 'click', selector: '#direct-flights-checkbox' }`
**What we need**: `{ type: 'toggle', semanticValue: true, intent: 'direct flights filter' }`

### Sliders/Range Inputs
**User action**: Moves price slider to $500
**What we capture**: `{ type: 'click', selector: '.slider-handle' }`
**What we need**: `{ type: 'range-select', semanticValue: 500, intent: 'max price' }`

---

## Implementation Plan

### Phase 1: Semantic Value Extraction (Post-Interaction)

**Goal**: After each interaction, query the DOM to extract the semantic value that was just set.

**Approach**: Enhance the action recorder to inspect DOM state after interactions.

#### 1.1: Date Picker Detection

**File to modify**: `/lib/capture/action-recorder.ts`

**Implementation**:
```typescript
async function captureSemanticValue(
  page: Page,
  action: RecordedAction,
  clickedElement: ElementHandle
): Promise<string | null> {

  // Strategy 1: Check if element has date-related attributes
  const ariaLabel = await clickedElement.getAttribute('aria-label');
  if (ariaLabel && isDateLike(ariaLabel)) {
    return parseDateFromLabel(ariaLabel); // "December 17, 2025" → "2025-12-17"
  }

  // Strategy 2: Check parent for date picker role
  const parent = await page.evaluateHandle(
    (el) => el.closest('[role="dialog"], [class*="datepicker"], [class*="calendar"]'),
    clickedElement
  );

  if (parent) {
    // Look for associated input field
    const dateInputSelector = await findAssociatedInput(page, parent);
    if (dateInputSelector) {
      const value = await page.$eval(dateInputSelector, el => el.value);
      if (isDateLike(value)) {
        return value; // "12/17/2025" → "2025-12-17"
      }
    }
  }

  // Strategy 3: Check for common date picker patterns
  const elementClasses = await clickedElement.getAttribute('class');
  if (elementClasses?.includes('calendar-day') || elementClasses?.includes('date-cell')) {
    const textContent = await clickedElement.textContent();
    const dateContext = await getDatePickerContext(page, clickedElement);
    return constructDate(textContent, dateContext); // "17" + context → "2025-12-17"
  }

  return null;
}

// Helper: Detect if string looks like a date
function isDateLike(str: string): boolean {
  return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(str) || // MM/DD/YYYY
         /\d{4}-\d{2}-\d{2}/.test(str) ||                   // ISO format
         /(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(str);
}

// Helper: Get date picker context (month/year shown)
async function getDatePickerContext(page: Page, element: ElementHandle): Promise<{ month: number, year: number }> {
  // Find month/year display elements
  const context = await page.evaluate((el) => {
    const picker = el.closest('[class*="datepicker"], [class*="calendar"]');
    const monthEl = picker?.querySelector('[class*="month"], [class*="current-month"]');
    const yearEl = picker?.querySelector('[class*="year"], [class*="current-year"]');

    return {
      month: monthEl?.textContent,
      year: yearEl?.textContent
    };
  }, element);

  return {
    month: parseMonth(context.month),
    year: parseInt(context.year)
  };
}
```

**Integration point**:
```typescript
// In action-recorder.ts, after capturing a click:
page.on('click', async (event) => {
  const action = captureClickAction(event);

  // NEW: Try to extract semantic value
  const semanticValue = await captureSemanticValue(page, action, event.target);
  if (semanticValue) {
    action.semanticValue = semanticValue;
    action.semanticType = 'date'; // or 'dropdown', 'checkbox', etc.
  }

  recordedActions.push(action);
});
```

#### 1.2: Dropdown Detection

**Implementation**:
```typescript
async function captureDropdownValue(
  page: Page,
  clickedElement: ElementHandle
): Promise<{ value: string, label: string } | null> {

  // Strategy 1: Native <select> element
  const selectParent = await page.evaluateHandle(
    (el) => el.closest('select'),
    clickedElement
  );

  if (selectParent) {
    const { value, label } = await page.evaluate((select) => ({
      value: select.value,
      label: select.options[select.selectedIndex]?.text
    }), selectParent);
    return { value, label };
  }

  // Strategy 2: Custom dropdown (React Select, etc.)
  const dropdownItem = await clickedElement.getAttribute('data-value') ||
                        await clickedElement.textContent();

  if (dropdownItem) {
    return {
      value: dropdownItem.trim(),
      label: dropdownItem.trim()
    };
  }

  // Strategy 3: ARIA combobox pattern
  const ariaRole = await clickedElement.getAttribute('role');
  if (ariaRole === 'option') {
    const value = await clickedElement.getAttribute('data-value') ||
                  await clickedElement.textContent();
    return { value: value?.trim(), label: value?.trim() };
  }

  return null;
}
```

#### 1.3: Checkbox/Toggle Detection

**Implementation**:
```typescript
async function captureToggleValue(
  clickedElement: ElementHandle
): Promise<{ checked: boolean, label: string } | null> {

  // Check if element is a checkbox or has checkbox role
  const type = await clickedElement.getAttribute('type');
  const role = await clickedElement.getAttribute('role');

  if (type === 'checkbox' || role === 'checkbox') {
    const checked = await clickedElement.evaluate((el: any) => el.checked);
    const label = await findLabelForInput(clickedElement);
    return { checked, label };
  }

  // Custom toggle switches
  const ariaChecked = await clickedElement.getAttribute('aria-checked');
  if (ariaChecked !== null) {
    return {
      checked: ariaChecked === 'true',
      label: await clickedElement.textContent() || 'toggle'
    };
  }

  return null;
}
```

#### 1.4: Number/Range Input Detection

**Use cases**: Guest count (hotels), party size (restaurants), price ranges (real estate), weight (shipping), quantity (tickets)

**Implementation**:
```typescript
async function captureNumberValue(
  clickedElement: ElementHandle
): Promise<{ value: number, min?: number, max?: number, label: string } | null> {

  // Strategy 1: Native number input
  const type = await clickedElement.getAttribute('type');
  if (type === 'number' || type === 'range') {
    const value = await clickedElement.evaluate((el: any) => parseFloat(el.value));
    const min = await clickedElement.getAttribute('min');
    const max = await clickedElement.getAttribute('max');
    const label = await findInputLabel(clickedElement);

    return {
      value,
      min: min ? parseFloat(min) : undefined,
      max: max ? parseFloat(max) : undefined,
      label: label || 'number input'
    };
  }

  // Strategy 2: Increment/decrement buttons (common in guest selectors)
  const buttonText = await clickedElement.textContent();
  if (buttonText === '+' || buttonText === '-' || buttonText === '▲' || buttonText === '▼') {
    // Find associated display element
    const parent = await clickedElement.evaluate(el => {
      const container = el.closest('[class*="counter"], [class*="stepper"], [class*="number-input"]');
      const display = container?.querySelector('[class*="value"], [class*="count"], input[type="number"]');
      return display ? (display as any).value || display.textContent : null;
    });

    if (parent) {
      return {
        value: parseFloat(parent),
        label: await findInputLabel(clickedElement) || 'counter'
      };
    }
  }

  // Strategy 3: Slider handle
  const role = await clickedElement.getAttribute('role');
  if (role === 'slider') {
    const value = await clickedElement.getAttribute('aria-valuenow');
    const min = await clickedElement.getAttribute('aria-valuemin');
    const max = await clickedElement.getAttribute('aria-valuemax');
    const label = await clickedElement.getAttribute('aria-label');

    return {
      value: value ? parseFloat(value) : 0,
      min: min ? parseFloat(min) : undefined,
      max: max ? parseFloat(max) : undefined,
      label: label || 'slider'
    };
  }

  return null;
}
```

#### 1.5: Location/Autocomplete Input Detection

**Use cases**: Addresses (contact forms), cities (flights, hotels), zip codes (shipping), airports

**Challenge**: Autocomplete inputs often populate via dropdown clicks after typing

**Implementation**:
```typescript
async function captureAutocompleteValue(
  page: Page,
  clickedElement: ElementHandle
): Promise<{ value: string, displayText: string, coordinates?: { lat: number, lng: number } } | null> {

  // Check if this is an autocomplete option click
  const role = await clickedElement.getAttribute('role');
  const classList = await clickedElement.getAttribute('class');

  if (role === 'option' || classList?.includes('autocomplete') || classList?.includes('suggestion')) {
    const displayText = await clickedElement.textContent() || '';

    // Try to get structured data attributes
    const dataValue = await clickedElement.getAttribute('data-value');
    const placeId = await clickedElement.getAttribute('data-place-id');

    // Try to extract coordinates if this is a Google Places autocomplete
    const coordinates = await page.evaluate((el) => {
      const data = el.dataset;
      if (data.lat && data.lng) {
        return {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lng)
        };
      }
      return undefined;
    }, clickedElement);

    return {
      value: dataValue || displayText.trim(),
      displayText: displayText.trim(),
      coordinates
    };
  }

  return null;
}
```

#### 1.6: Multi-Select Detection

**Use cases**: Filter selections (job search, real estate), amenities (hotels), features (products)

**Implementation**:
```typescript
async function captureMultiSelectValue(
  page: Page,
  clickedElement: ElementHandle
): Promise<{ values: string[], labels: string[], action: 'add' | 'remove' } | null> {

  // Check if element is part of a multi-select
  const ariaMultiselectable = await page.evaluate((el) => {
    const listbox = el.closest('[role="listbox"][aria-multiselectable="true"]');
    const tagList = el.closest('[class*="tag-list"], [class*="chip-list"], [class*="multi-select"]');
    return listbox || tagList;
  }, clickedElement);

  if (!ariaMultiselectable) return null;

  // Determine if this is adding or removing a value
  const isSelected = await clickedElement.getAttribute('aria-selected') === 'true';
  const value = await clickedElement.getAttribute('data-value') || await clickedElement.textContent();

  // Get all currently selected values
  const selectedValues = await page.evaluate((container) => {
    const selected = container.querySelectorAll('[aria-selected="true"], [class*="selected"]');
    return Array.from(selected).map(el => el.textContent?.trim() || '');
  }, ariaMultiselectable);

  return {
    values: selectedValues.filter(Boolean),
    labels: selectedValues.filter(Boolean),
    action: isSelected ? 'remove' : 'add'
  };
}
```

---

### Phase 2: Pattern Detection & Classification

**Goal**: Classify interactions by type to enable proper variable mapping.

**File to create**: `/lib/capture/interaction-classifier.ts`

**Implementation**:
```typescript
export type InteractionType =
  | 'text-input'          // Search boxes, text fields (100% of use cases)
  | 'date-picker'         // Calendar widgets (45% of use cases)
  | 'dropdown'            // Single-select dropdowns (65% of use cases)
  | 'checkbox'            // Checkboxes, toggles (35% of use cases)
  | 'radio'               // Radio buttons
  | 'number-input'        // Number inputs, counters (40% of use cases)
  | 'range-slider'        // Price ranges, sliders (20% of use cases)
  | 'autocomplete'        // Location/address autocomplete (40% of use cases)
  | 'multi-select'        // Multi-select filters (15% of use cases)
  | 'button-click'        // Submit buttons, action buttons
  | 'link-click'          // Navigation links
  | 'unknown';

export interface ClassifiedInteraction {
  type: InteractionType;
  semanticValue: string | number | boolean | null;
  semanticLabel: string | null;
  confidence: number; // 0-1
}

export async function classifyInteraction(
  page: Page,
  action: RecordedAction,
  element: ElementHandle
): Promise<ClassifiedInteraction> {

  // Priority 1: Check element type and role attributes
  const elementType = await element.getAttribute('type');
  const role = await element.getAttribute('role');
  const tagName = await element.evaluate(el => el.tagName.toLowerCase());

  // Text inputs
  if (elementType === 'text' || elementType === 'email' || tagName === 'textarea') {
    return {
      type: 'text-input',
      semanticValue: action.value || null,
      semanticLabel: await findInputLabel(element),
      confidence: 1.0
    };
  }

  // Date inputs
  if (elementType === 'date' || role === 'gridcell' || await isDatePicker(page, element)) {
    const semanticValue = await captureSemanticValue(page, action, element);
    return {
      type: 'date-picker',
      semanticValue,
      semanticLabel: await inferDateIntent(page, element), // "departure date", "return date"
      confidence: semanticValue ? 0.9 : 0.5
    };
  }

  // Dropdowns
  if (tagName === 'select' || role === 'combobox' || role === 'option') {
    const dropdownValue = await captureDropdownValue(page, element);
    return {
      type: 'dropdown',
      semanticValue: dropdownValue?.value || null,
      semanticLabel: await inferDropdownIntent(page, element),
      confidence: dropdownValue ? 0.9 : 0.6
    };
  }

  // Checkboxes
  if (elementType === 'checkbox' || role === 'checkbox') {
    const toggleValue = await captureToggleValue(element);
    return {
      type: 'checkbox',
      semanticValue: toggleValue?.checked || null,
      semanticLabel: toggleValue?.label || null,
      confidence: 0.9
    };
  }

  // Default: regular click
  return {
    type: 'button-click',
    semanticValue: null,
    semanticLabel: await element.textContent() || null,
    confidence: 0.7
  };
}

// Helper: Infer intent from surrounding context
async function inferDateIntent(page: Page, element: ElementHandle): Promise<string> {
  // Look at labels, aria-labels, nearby text
  const label = await findInputLabel(element);

  if (!label) return 'date';

  const lowerLabel = label.toLowerCase();

  if (lowerLabel.includes('depart') || lowerLabel.includes('departure') || lowerLabel.includes('leaving')) {
    return 'departure date';
  }
  if (lowerLabel.includes('return') || lowerLabel.includes('arriving')) {
    return 'return date';
  }
  if (lowerLabel.includes('check') && lowerLabel.includes('in')) {
    return 'check-in date';
  }
  if (lowerLabel.includes('check') && lowerLabel.includes('out')) {
    return 'check-out date';
  }

  return 'date';
}
```

---

### Phase 3: Enhanced Variable Mapping

**Goal**: Map semantic values from ALL interaction types to goal variables, not just text inputs.

**File to modify**: `/lib/capture/variable-detector.ts`

**Current behavior**:
```typescript
// Only processes typed text values
const typedValues = extractTypedValues(recordedActions); // ["vancouver", "los angeles"]
const mapping = await detectVariables(goal, typedValues);
```

**Enhanced behavior**:
```typescript
export interface SemanticValue {
  value: string;
  type: InteractionType;
  label: string;
  actionIndex: number;
}

export async function detectVariablesEnhanced(
  goal: string,
  semanticValues: SemanticValue[]
): Promise<VariableMapping> {

  const prompt = `You are analyzing a web automation recording. The user demonstrated a task with specific values across different types of inputs.

**Goal**: ${goal}

**Variables in goal**: ${extractVariablesFromGoal(goal).map(v => `%${v}%`).join(', ')}

**Values captured during recording**:
${semanticValues.map(sv => `
- Value: "${sv.value}"
  Type: ${sv.type}
  Context: ${sv.label}
  Step: ${sv.actionIndex}
`).join('\n')}

Map each captured value to its corresponding variable based on:
1. Semantic meaning and context
2. Variable names (e.g., "departureDate" should map to date values with "departure" context)
3. Order of occurrence
4. Input type (dates map to date variables, locations to location variables, etc.)

**Examples**:

Goal: "find flights from %origin% to %destination% on %departureDate% returning %returnDate%"
Values:
- "vancouver" (text-input, context: "Where from?")
- "los angeles" (text-input, context: "Where to?")
- "2025-12-17" (date-picker, context: "departure date")
- "2025-12-24" (date-picker, context: "return date")

→ Mapping:
{
  "vancouver": "%origin%",
  "los angeles": "%destination%",
  "2025-12-17": "%departureDate%",
  "2025-12-24": "%returnDate%"
}

Now map the captured values for the given goal.`;

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: VariableMappingSchema,
    prompt,
    temperature: 0.1,
  });

  return result.object.mappings;
}
```

**Integration in finish-recording-step.ts**:
```typescript
// Extract ALL semantic values (not just typed text)
const semanticValues: SemanticValue[] = recording.recordedActions
  .map((action, index) => ({
    value: action.semanticValue || action.value,
    type: action.semanticType || 'text-input',
    label: action.semanticLabel || action.description,
    actionIndex: index
  }))
  .filter(sv => sv.value); // Only include actions with values

// Enhanced variable detection
const variableMapping = await detectVariablesEnhanced(recording.goal, semanticValues);
```

---

### Phase 4: Semantic Natural Language Generation

**Goal**: Generate natural language instructions that include variable placeholders for ALL interaction types.

**File to modify**: `/workflows/steps/finish-recording-step.ts` → `convertToStagehand()`

**Current implementation**:
```typescript
function convertToStagehand(actions: RecordedAction[]): StagehandAction[] {
  return actions.map(action => {
    if (action.type === 'click') {
      return {
        method: 'act',
        instruction: action.description, // ❌ Not semantic
      };
    }
    // ...
  });
}
```

**Enhanced implementation**:
```typescript
function convertToStagehand(
  actions: RecordedAction[],
  variableMapping: VariableMapping
): StagehandAction[] {

  return actions.map(action => {
    // Navigate actions
    if (action.type === 'navigate') {
      return {
        method: 'navigate',
        url: action.url!,
        instruction: `Navigate to ${action.url}`,
      };
    }

    // Text input actions - ✅ Already works
    if (action.type === 'fill' || action.type === 'type') {
      const valueInstruction = action.value?.startsWith('%')
        ? action.value
        : `"${action.value}"`;

      return {
        method: 'act',
        selector: action.selector,
        instruction: `${action.description} with value ${valueInstruction}`,
        value: action.value,
      };
    }

    // NEW: Date picker actions with semantic values
    if (action.semanticType === 'date-picker' && action.semanticValue) {
      // Find which variable this maps to
      const variablePlaceholder = variableMapping[action.semanticValue];

      if (variablePlaceholder) {
        // Generate semantic instruction with variable
        return {
          method: 'act',
          instruction: `Select ${action.semanticLabel || 'date'} ${variablePlaceholder}`,
          semanticValue: action.semanticValue,
          // Example: "Select departure date %departureDate%"
        };
      } else {
        // No variable mapping, use literal value
        return {
          method: 'act',
          instruction: `Select ${action.semanticLabel || 'date'} ${action.semanticValue}`,
        };
      }
    }

    // NEW: Dropdown actions with semantic values
    if (action.semanticType === 'dropdown' && action.semanticValue) {
      const variablePlaceholder = variableMapping[action.semanticValue];

      return {
        method: 'act',
        instruction: variablePlaceholder
          ? `Select ${action.semanticLabel || 'option'} ${variablePlaceholder}`
          : `Select ${action.semanticLabel || 'option'} "${action.semanticValue}"`,
      };
    }

    // NEW: Checkbox/toggle actions
    if (action.semanticType === 'checkbox' && action.semanticValue !== undefined) {
      const variablePlaceholder = variableMapping[String(action.semanticValue)];

      return {
        method: 'act',
        instruction: variablePlaceholder
          ? `${action.semanticValue ? 'Check' : 'Uncheck'} ${variablePlaceholder}`
          : `${action.semanticValue ? 'Check' : 'Uncheck'} "${action.semanticLabel}"`,
      };
    }

    // Default: Regular click (buttons, links)
    return {
      method: 'act',
      selector: action.selector,
      instruction: action.description,
    };
  });
}
```

---

### Phase 5: Enhanced Variable Substitution at Execution

**File to modify**: `/workflows/steps/execute-skill-step.ts` → `executeNaturalLanguage()`

**Current implementation** (already works well):
```typescript
async function executeNaturalLanguage(
  stagehand: any,
  workflow: StagehandAction[],
  variables?: Record<string, any>
): Promise<any> {

  for (const action of workflow) {
    let instruction = action.instruction;

    // Substitute variables in instruction
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        const placeholder = `%${key}%`;
        instruction = instruction.replace(new RegExp(placeholder, 'g'), String(val));
      });
    }

    if (action.method === 'navigate') {
      await stagehand.page.goto(action.url);
    } else {
      await stagehand.act(instruction);
    }
  }
}
```

**This already works!** No changes needed if we generate proper semantic instructions.

**Example flow**:
```javascript
// Recording: User selects Dec 17, 2025
Recorded: { semanticValue: '2025-12-17', semanticLabel: 'departure date' }

// Variable Detection:
Mapping: { '2025-12-17': '%departureDate%' }

// Conversion to Stagehand:
Instruction: 'Select departure date %departureDate%'

// Execution with variables: { departureDate: '2025-01-15' }
Substituted: 'Select departure date 2025-01-15'

// Stagehand executes:
stagehand.act('Select departure date 2025-01-15')
// ✅ AI figures out how to click the right calendar cell for Jan 15
```

---

## Implementation Checklist

### Implementation Priority (Based on Use Case Frequency)

**Priority 1 (65-100% of use cases):**
- [ ] Dropdowns (65%) - cabin class, property type, make/model

**Priority 2 (40-45% of use cases):**
- [ ] Date pickers (45%) - flights, hotels, appointments
- [ ] Number inputs (40%) - guest count, price ranges, quantity
- [ ] Location autocomplete (40%) - addresses, cities, airports

**Priority 3 (20-35% of use cases):**
- [ ] Checkboxes/toggles (35%) - filters, preferences
- [ ] Range sliders (20%) - price ranges

**Priority 4 (Edge cases):**
- [ ] Multi-select (15%) - amenities, features
- [ ] Radio buttons (10%) - options

### Recording Phase (Phase 1-2)
- [x] Add `semanticValue`, `semanticType`, `semanticLabel` fields to `RecordedAction` type in `/lib/types/skills.ts`
- [x] **P1**: Implement `captureDropdownValue()` in `/lib/capture/action-recorder.ts`
- [x] **P2**: Implement `captureSemanticValue()` for date pickers
- [x] **P2**: Implement `captureNumberValue()` for number/range inputs
- [x] **P2**: Implement `captureAutocompleteValue()` for location inputs
- [x] **P3**: Implement `captureToggleValue()` for checkboxes
- [ ] **P4**: Implement `captureMultiSelectValue()` for multi-select filters
- [ ] Create `/lib/capture/interaction-classifier.ts` with classification logic for ALL widget types
- [x] Integrate semantic capture into click event handler in `action-recorder.ts`
- [x] Add post-interaction DOM queries to extract values (with 200ms delay for DOM updates)
- [ ] Test with: dropdowns (P1), date pickers (P2), number inputs (P2), location autocomplete (P2)

### Variable Detection (Phase 3)
- [x] Create `SemanticValue` interface in `/lib/capture/variable-detector.ts`
- [x] Implement `detectVariablesEnhanced()` with support for all interaction types
- [x] Update prompt to include interaction type and context
- [x] Modify `finish-recording-step.ts` to use enhanced detection
- [x] Extract semantic values from all actions, not just text inputs
- [ ] Test variable mapping for multi-type workflows (text + dates + dropdowns)

### Natural Language Generation (Phase 4)
- [x] Update `convertToStagehand()` in `/finish-recording-step.ts`
- [x] **P1**: Add logic for dropdown semantic instructions ("Select cabin class %cabinClass%")
- [x] **P2**: Add logic for date picker semantic instructions ("Select departure date %departureDate%")
- [x] **P2**: Add logic for number input semantic instructions ("Set guest count to %guests%")
- [x] **P2**: Add logic for autocomplete semantic instructions ("Select location %city%")
- [x] **P3**: Add logic for checkbox semantic instructions ("Enable %filterName% filter")
- [ ] **P4**: Add logic for multi-select semantic instructions ("Select amenities %amenities%")
- [x] Generate instructions with variable placeholders for ALL interaction types
- [x] Preserve semantic metadata in `stagehandWorkflow` (value, type, label)
- [ ] Test generated instructions are human-readable and AI-understandable

### Execution Phase (Phase 5)
- [ ] Test `executeNaturalLanguage()` with semantic instructions
- [ ] Verify variable substitution works for dates
- [ ] Verify Stagehand AI can interpret semantic instructions
- [ ] Add logging for semantic instruction execution
- [ ] Test fallback from Strategy 1 to Strategy 2 for date pickers

### Testing & Validation

**P1 Tests (Dropdowns - 65% of use cases):**
- [ ] Test flight search: cabin class dropdown ("economy", "business", "first")
- [ ] Test car search: make/model dropdowns ("Toyota", "Honda", "Tesla")
- [ ] Test real estate: property type dropdown ("House", "Condo", "Apartment")
- [ ] Test custom React Select components
- [ ] Test native `<select>` elements

**P2 Tests (Date Pickers & Numbers - 40-45% of use cases):**
- [ ] Test Google Flights: departure/return date pickers
- [ ] Test hotel bookings: check-in/check-out calendars (Booking.com, Hotels.com)
- [ ] Test appointment booking: date selection (OpenTable, Calendly)
- [ ] Test number inputs: guest count, party size, quantity selectors
- [ ] Test range sliders: price ranges, weight inputs
- [ ] Test location autocomplete: Google Places, airport selectors

**P3 Tests (Filters & Toggles - 20-35% of use cases):**
- [ ] Test checkbox filters: LinkedIn job filters, real estate filters
- [ ] Test toggle switches: "Direct flights only", "Show available only"
- [ ] Test radio button groups: shipping methods, payment options

**Integration Tests:**
- [ ] Test mixed workflow: Flight search (text + dropdown + dates + numbers)
- [ ] Test hotel booking: (location autocomplete + dates + guests + filters)
- [ ] Test e-commerce: (search + dropdowns + price range + checkboxes)
- [ ] Compare Strategy 2 success rate: before (8%) vs. after (target: 25-30%)
- [ ] Compare avg execution time: before (Strategy 3: 84s) vs. after (Strategy 2: 5-10s)
- [ ] Compare avg cost: before ($0.05-0.10) vs. after ($0.01-0.02)

---

## Expected Outcomes

### Before Enhancement (Current State)
✅ **Fully Supported** (Strategy 1, 2, 3):
- Text inputs: search, names, messages

⚠️ **Partially Supported** (Strategy 3 only - slow & expensive):
- Date pickers (45% of use cases)
- Dropdowns (65% of use cases)
- Number inputs (40% of use cases)
- Checkboxes (35% of use cases)
- Location autocomplete (40% of use cases)

📊 **Current Performance** (Flight search test):
- Execution time: 84 seconds
- Cost: ~$0.05-0.10
- Success rate: Partial (extracted wrong data - Chicago instead of NYC→Tokyo)
- Strategy used: Strategy 3 (agent mode)

### After Enhancement (Target State)

✅ **Fully Supported** (Strategy 1, 2, 3):
- Text inputs (unchanged)
- **NEW**: Dropdowns - cabin class, property type, make/model (P1)

✅ **Strategy 2 Supported** (natural language + agent):
- **NEW**: Date pickers - flights, hotels, appointments (P2)
- **NEW**: Number inputs - guest count, price ranges, quantity (P2)
- **NEW**: Location autocomplete - addresses, cities, airports (P2)
- **NEW**: Checkboxes/toggles - filters, preferences (P3)
- **NEW**: Range sliders - price ranges (P3)
- **NEW**: Multi-select - amenities, features (P4)

📊 **Target Performance** (Flight search after enhancement):
- Execution time: 5-10 seconds (Strategy 2) vs. 84 seconds before (8-17x faster)
- Cost: ~$0.01-0.02 vs. $0.05-0.10 before (2-5x cheaper)
- Success rate: High (follows recorded path, less confusion)
- Strategy used: Strategy 2 (natural language) instead of Strategy 3

### Success Metrics

**Quantitative Goals:**
- **Variable detection accuracy**: 90%+ for ALL widget types (dropdowns, dates, numbers, locations)
- **Strategy 2 success rate**: Increase from 8% to 25-30% (3-4x improvement)
- **Average execution time**: Reduce by 80% for widget-heavy workflows (84s → 10-15s)
- **Average execution cost**: Reduce by 60-80% for widget-heavy workflows ($0.05 → $0.01)
- **Use case coverage**: Support 85%+ of documented use cases (17/20) in Strategy 2

**Qualitative Goals:**
- Users can create flight/hotel booking skills that work reliably
- E-commerce price comparison skills work with filters
- Job search skills work with dropdowns and checkboxes
- Real estate search skills work with property type and price ranges
- Reduced reliance on expensive Strategy 3 (agent mode)

---

## Risks & Challenges

### Technical Challenges
1. **Website diversity**: Every site implements date pickers differently
2. **Dynamic content**: Values may not be in DOM until after interaction completes
3. **Shadow DOM**: Some widgets use Shadow DOM (harder to query)
4. **Timing issues**: Need to wait for DOM updates after clicks
5. **False positives**: Misclassifying regular clicks as semantic interactions

### Mitigation Strategies
1. **Multiple detection strategies**: Try several approaches, use highest confidence
2. **Delayed queries**: Add small delays after interactions to let DOM settle
3. **Confidence scoring**: Only use semantic values with high confidence
4. **Fallback logic**: If semantic extraction fails, fall back to regular click recording
5. **Extensive testing**: Test with popular sites (Google Flights, Booking.com, Amazon)

---

## Alternative Approaches (Considered but Not Recommended)

### 1. Video/Screenshot Analysis
**Idea**: Record video, use vision model to understand interactions
**Why not**: Expensive, slow, adds complexity, requires video storage

### 2. Browser Extension Recording
**Idea**: Use extension to get deeper DOM access
**Why not**: Requires users to install extension, harder deployment

### 3. Manual Schema Definition
**Idea**: User manually annotates which interactions map to which variables
**Why not**: Defeats the purpose of "show don't tell", poor UX

---

## Lessons Learned from Flight Search Test

### What Worked
✅ **Text inputs** (origin/destination cities): Worked perfectly in Strategy 1 (fast, free)
✅ **Triple strategy resilience**: System didn't crash, fell back to Strategy 3
✅ **Variable substitution logic**: Correctly replaced "vancouver" → "Seattle" in instructions

### What Failed
❌ **Date pickers** (departure/return): Fell through Strategy 1 & 2, required Strategy 3
❌ **Strategy 3 reliability**: Agent got confused, extracted Chicago flights instead of NYC→Tokyo
❌ **Cost & performance**: 84 seconds, $0.05-0.10, unreliable results

### Root Causes
1. **No semantic values captured**: Date picker clicks recorded without date values
2. **Hardcoded navigation URLs**: Recorded URLs contained demo dates in query params
3. **Non-semantic instructions**: Strategy 2 instructions like "Click ", 245 US dollars"" don't help AI
4. **Agent confusion**: Even Strategy 3 struggled without context from recorded flow

### Key Insights
- **65% of use cases need dropdowns**: More common than date pickers (45%)
- **40% need number inputs**: Guest counts, prices, quantities
- **40% need location autocomplete**: Addresses, airports, cities
- **Strategy 3 is not a silver bullet**: Agent mode can still fail or extract wrong data
- **Recording context matters**: Semantic values guide the AI to the right elements

### Implementation Priorities (Revised)
1. **Priority 1**: Dropdowns (highest frequency, 65%)
2. **Priority 2**: Date pickers + Number inputs + Location autocomplete (40-45%)
3. **Priority 3**: Checkboxes/toggles + Range sliders (20-35%)
4. **Priority 4**: Multi-select + Radio buttons (10-15%)

---

## About "No CDP Complexity"

**Note**: The original plan mentioned "No CDP complexity" (skill-idea.md:42), which referred to avoiding **raw CDP programming**, not avoiding CDP entirely.

**What we're using now:**
- Playwright (which uses CDP under the hood) for event capture
- Simple event listeners for clicks, fills, navigations
- NOT: Complex CDP session management, protocol message parsing

**What semantic value capture adds:**
- Post-interaction DOM queries to extract values
- Pattern detection (is this a date picker? dropdown?)
- Still uses Playwright APIs (evaluate, getAttribute, etc.)
- NOT more complex than current CDP usage

**Conclusion**: Semantic value capture fits within the "No CDP complexity" philosophy. We're still using Playwright's abstraction layer, just querying the DOM more intelligently after interactions.

---

## Next Steps

1. **Prototype Phase 1 - Dropdowns (P1, 65% of use cases)**
   - Implement `captureDropdownValue()` for native `<select>` and custom dropdowns
   - Test with Google Flights cabin class selector
   - Test with Cars.com make/model dropdowns
   - Validate semantic values captured correctly
   - Measure detection accuracy (target: 90%+)

2. **Prototype Phase 2 - Date Pickers (P2, 45% of use cases)**
   - Implement `captureSemanticValue()` for calendar widgets
   - Test with Google Flights departure/return dates
   - Test with Booking.com check-in/check-out dates
   - Handle multiple date picker UI patterns
   - Measure detection accuracy (target: 85%+, more variation than dropdowns)

3. **Prototype Phase 3 - Enhanced Variable Detection (All types)**
   - Extend `detectVariablesEnhanced()` to handle dropdowns, dates, numbers, locations
   - Update AI prompt to understand interaction types and context
   - Test mapping: "economy" → "%cabinClass%", "2025-12-17" → "%departureDate%"
   - Verify correct variable assignment across all widget types
   - Measure mapping accuracy (target: 90%+)

4. **Prototype Phase 4 - Semantic Instruction Generation (All types)**
   - Update `convertToStagehand()` to generate semantic instructions
   - Generate: "Select cabin class %cabinClass%", "Select departure date %departureDate%"
   - Test with Stagehand `act()` execution
   - Verify AI can interpret and execute correctly
   - Compare Strategy 2 success rate: before (8%) vs. after (target: 25%+)

5. **Full Implementation (Phases 1-5)**
   - Implement remaining widget types: numbers (P2), location autocomplete (P2), checkboxes (P3)
   - Add comprehensive testing across 20 use cases
   - Benchmark performance: execution time, cost, success rate
   - Deploy and monitor Strategy 2 vs. Strategy 3 usage ratios

6. **Iterate Based on Real-World Usage**
   - Collect failure cases from production executions
   - Improve detection heuristics for common widget patterns
   - Add support for edge cases and new widget types (sliders, multi-select)
   - Optimize for most common use cases (flights, hotels, e-commerce)

**Estimated Timeline:**
- Phase 1 (Dropdowns): 1-2 weeks
- Phase 2 (Date Pickers): 1-2 weeks
- Phase 3 (Variable Detection): 1 week
- Phase 4 (Instruction Generation): 1 week
- Phase 5 (Full Implementation): 2-3 weeks
- **Total**: 6-9 weeks for full implementation
