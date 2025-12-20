/**
 * Variable Detector
 *
 * Uses LLM to map typed values during recording to goal variables.
 *
 * Example:
 *   Goal: "Search for flights from %origin% to %destination% on %departureDate%"
 *   Typed values: ["Vancouver", "LAX", "2025-12-17"]
 *   Output: {
 *     "Vancouver": "%origin%",
 *     "LAX": "%destination%",
 *     "2025-12-17": "%departureDate%"
 *   }
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { InteractionType } from '../types/skills';

export interface VariableMapping {
  [demoValue: string]: string; // e.g., "Vancouver" → "%origin%"
}

/**
 * Semantic value with interaction type and context
 * Used for enhanced variable detection across all widget types
 */
export interface SemanticValue {
  value: string | number | boolean;  // The actual value (e.g., "2025-12-17", "economy", 2, true)
  type: InteractionType;              // Type of interaction (date-picker, dropdown, etc.)
  label: string;                      // Contextual label (e.g., "departure date", "cabin class")
  actionIndex: number;                // Position in the recorded actions sequence
}

const VariableMappingSchema = z.object({
  mappings: z.record(z.string(), z.string()),
  explanation: z.string().optional(),
});

/**
 * Detects variables in goal and maps typed values to them
 */
export async function detectVariables(
  goal: string,
  typedValues: string[]
): Promise<VariableMapping> {
  // If no typed values, return empty mapping
  if (!typedValues || typedValues.length === 0) {
    return {};
  }

  // Extract all variables from goal (anything between % %)
  const variableRegex = /%([a-zA-Z0-9_]+)%/g;
  const variables = [...goal.matchAll(variableRegex)].map(match => match[1]);

  // If no variables in goal, return empty mapping
  if (variables.length === 0) {
    return {};
  }

  // Use OpenAI to map typed values to variables
  const prompt = `You are analyzing a web automation recording. The user demonstrated a task with specific values, and the goal contains variables (marked with %).

**Goal**: ${goal}

**Variables in goal**: ${variables.map(v => `%${v}%`).join(', ')}

**Values typed during recording**: ${JSON.stringify(typedValues)}

Your task: Map each typed value to its corresponding variable based on context.

**Rules**:
1. Match based on semantic meaning and order
2. Origin/departure/from → first location
3. Destination/arrival/to → second location
4. Dates should map to date-related variables
5. If a typed value doesn't match any variable, don't include it in mappings
6. Use the exact variable format with % symbols (e.g., "%origin%")

**Examples**:

Goal: "Search flights from %origin% to %destination%"
Typed values: ["Vancouver", "LAX"]
→ { "Vancouver": "%origin%", "LAX": "%destination%" }

Goal: "Find product %productName% with max price %maxPrice%"
Typed values: ["iPhone 15 Pro", "1000"]
→ { "iPhone 15 Pro": "%productName%", "1000": "%maxPrice%" }

Goal: "Book hotel in %location% from %checkIn% to %checkOut%"
Typed values: ["New York", "2025-12-20", "2025-12-25"]
→ { "New York": "%location%", "2025-12-20": "%checkIn%", "2025-12-25": "%checkOut%" }

Now map the typed values to variables for the given goal.`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: VariableMappingSchema,
      prompt,
      temperature: 0.1, // Low temperature for consistent mapping
    });

    console.log('[Variable Detector] Mapping result:', result.object);

    return result.object.mappings;
  } catch (error) {
    console.error('[Variable Detector] Error detecting variables:', error);
    // Fallback: return empty mapping
    return {};
  }
}

/**
 * Enhanced variable detection that supports ALL interaction types
 * (text inputs, dropdowns, date pickers, number inputs, autocomplete, checkboxes)
 */
export async function detectVariablesEnhanced(
  goal: string,
  semanticValues: SemanticValue[]
): Promise<VariableMapping> {
  // If no semantic values, return empty mapping
  if (!semanticValues || semanticValues.length === 0) {
    return {};
  }

  // Extract all variables from goal (anything between % %)
  const variables = extractVariablesFromGoal(goal);

  // If no variables in goal, return empty mapping
  if (variables.length === 0) {
    return {};
  }

  // Build enhanced prompt with interaction type and context
  const valuesDescription = semanticValues.map((sv, index) => {
    const valueStr = typeof sv.value === 'boolean'
      ? (sv.value ? 'true (checked)' : 'false (unchecked)')
      : String(sv.value);

    return `${index + 1}. Value: "${valueStr}"
   Type: ${sv.type}
   Context: ${sv.label}
   Step: ${sv.actionIndex}`;
  }).join('\n\n');

  const prompt = `You are analyzing a web automation recording. The user demonstrated a task with specific values across different types of inputs (text, dropdowns, date pickers, numbers, checkboxes, autocomplete).

**Goal**: ${goal}

**Variables in goal**: ${variables.map(v => `%${v}%`).join(', ')}

**Values captured during recording**:
${valuesDescription}

**Your task**: Map each captured value to its corresponding variable based on:
1. **Semantic meaning and context** - The label/context tells you what the value represents
2. **Variable names** - Match meaningful names (e.g., "departureDate" should map to date values with "departure" context)
3. **Order of occurrence** - First location → origin, second → destination
4. **Interaction type** - Dates map to date variables, numbers to number variables, etc.

**Interaction Type Guide**:
- **text-input**: General text (search queries, names, messages)
- **date-picker**: Dates from calendar widgets (format: YYYY-MM-DD)
- **dropdown**: Single-select options (cabin class, property type, make/model)
- **number-input**: Numeric values (guest count, price, quantity, weight)
- **autocomplete**: Location/address selections (cities, airports, addresses)
- **checkbox**: Boolean filters (true = checked, false = unchecked)

**Examples**:

**Example 1: Flight search**
Goal: "find flights from %origin% to %destination% on %departureDate% returning %returnDate%"
Values:
1. Value: "Vancouver"
   Type: text-input (or autocomplete)
   Context: origin
   Step: 2

2. Value: "Los Angeles"
   Type: text-input (or autocomplete)
   Context: destination
   Step: 4

3. Value: "2025-12-17"
   Type: date-picker
   Context: departure date
   Step: 6

4. Value: "2025-12-24"
   Type: date-picker
   Context: return date
   Step: 8

→ Mapping:
{
  "Vancouver": "%origin%",
  "Los Angeles": "%destination%",
  "2025-12-17": "%departureDate%",
  "2025-12-24": "%returnDate%"
}

**Example 2: Hotel booking**
Goal: "book hotel in %city% for %guests% guests"
Values:
1. Value: "New York"
   Type: autocomplete
   Context: city
   Step: 2

2. Value: 3
   Type: number-input
   Context: guest count
   Step: 4

→ Mapping:
{
  "New York": "%city%",
  "3": "%guests%"
}

**Example 3: Job search with filters**
Goal: "search for %jobTitle% jobs with %remote% remote option"
Values:
1. Value: "Software Engineer"
   Type: text-input
   Context: job title
   Step: 2

2. Value: true
   Type: checkbox
   Context: remote only
   Step: 4

→ Mapping:
{
  "Software Engineer": "%jobTitle%",
  "true": "%remote%"
}

**Example 4: Car rental**
Goal: "rent %carType% car from %pickupLocation%"
Values:
1. Value: "SUV"
   Type: dropdown
   Context: car type
   Step: 2

2. Value: "Los Angeles Airport"
   Type: autocomplete
   Context: pickup location
   Step: 4

→ Mapping:
{
  "SUV": "%carType%",
  "Los Angeles Airport": "%pickupLocation%"
}

**Important Rules**:
- Match values to variables based on BOTH context AND variable name
- If a value doesn't match any variable, don't include it in mappings
- Use exact variable format with % symbols (e.g., "%origin%")
- For boolean values, map "true" or "false" as strings
- For numbers, map as strings (e.g., "3" not 3)
- Consider the order: first location usually maps to origin/from, second to destination/to

Now map the captured values to variables for the given goal:`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: VariableMappingSchema,
      prompt,
      temperature: 0.1, // Low temperature for consistent mapping
    });

    console.log('[Variable Detector Enhanced] Mapping result:', result.object);

    return result.object.mappings;
  } catch (error) {
    console.error('[Variable Detector Enhanced] Error detecting variables:', error);
    // Fallback: return empty mapping
    return {};
  }
}

/**
 * Extracts all variables from a goal string
 */
export function extractVariablesFromGoal(goal: string): string[] {
  const variableRegex = /%([a-zA-Z0-9_]+)%/g;
  const matches = [...goal.matchAll(variableRegex)];
  return matches.map(match => match[1]);
}

/**
 * Validates that all variables in goal have been mapped
 */
export function validateMapping(
  goal: string,
  mapping: VariableMapping
): { valid: boolean; unmappedVariables: string[] } {
  const variables = extractVariablesFromGoal(goal);
  const mappedVariables = new Set(
    Object.values(mapping).map(v => v.replace(/%/g, ''))
  );

  const unmappedVariables = variables.filter(v => !mappedVariables.has(v));

  return {
    valid: unmappedVariables.length === 0,
    unmappedVariables,
  };
}

/**
 * Gets the variable name for a demo value (without % symbols)
 */
export function getVariableName(mapping: VariableMapping, demoValue: string): string | null {
  const variable = mapping[demoValue];
  if (!variable) return null;

  // Remove % symbols
  return variable.replace(/%/g, '');
}

/**
 * Helper to extract useful hints from URL parameters
 */
function extractUrlHints(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = Array.from(urlObj.searchParams.entries());

    if (params.length === 0) return '';

    const hints = params
      .filter(([key]) => key.includes('date') || key.includes('departure') || key.includes('return') || key.includes('check') || key.includes('from') || key.includes('to'))
      .map(([key, value]) => `  - ${key}: ${value}`)
      .join('\n');

    return hints ? `\n\n**URL Parameters (hints for full values)**:\n${hints}` : '';
  } catch (e) {
    return '';
  }
}

/**
 * LLM-based semantic inference for actions without browser-detected metadata
 *
 * Uses goal context to infer what actions mean (e.g., "Click 19" → date selection)
 * This handles cases where browser detection fails but context provides clear hints
 *
 * @param goal - The user's goal with variables
 * @param actions - Grouped actions (may have missing semantic metadata)
 * @param finalUrl - The final URL after all actions (may contain date params, search results, etc.)
 * @returns Enriched actions with inferred semantic types/values/labels
 */
export async function inferSemanticContext(
  goal: string,
  actions: any[],
  finalUrl?: string
): Promise<any[]> {
  // Extract variables from goal to understand what we're looking for
  const variables = extractVariablesFromGoal(goal);

  if (variables.length === 0 || actions.length === 0) {
    return actions; // No variables or actions to analyze
  }

  // Find actions that lack semantic metadata
  const actionsNeedingInference = actions
    .map((action, index) => ({ action, index }))
    .filter(({ action }) => !action.semanticType && !action.semanticValue);

  if (actionsNeedingInference.length === 0) {
    return actions; // All actions already have metadata
  }

  // Build description of actions for LLM
  const actionsDescription = actions.map((action, index) => {
    const hasMetadata = action.semanticType || action.semanticValue;
    return `${index + 1}. ${action.description || action.type}${hasMetadata ? ` (has metadata: ${action.semanticType})` : ' (no metadata)'}`;
  }).join('\n');

  // Extract URL parameters if available (useful for dates, IDs, etc.)
  const urlContext = finalUrl ? `\n**Final URL**: ${finalUrl}${extractUrlHints(finalUrl)}` : '';

  const prompt = `You are analyzing a web automation recording to infer semantic meaning from actions that lack explicit metadata.

**Goal**: ${goal}

**Variables in goal**: ${variables.map(v => `%${v}%`).join(', ')}
${urlContext}

**Action Sequence**:
${actionsDescription}

**Your task**: For actions marked "(no metadata)", infer their semantic type, value, and label based on:
1. **Goal context** - What variables exist? (dates, locations, numbers, etc.)
2. **Action description** - What does the text suggest? (e.g., "Click 19" suggests day selection)
3. **Sequence position** - What came before/after? (dates usually follow locations)
4. **Common patterns** - Numeric clicks (1-31) after location inputs = calendar

**Semantic Types**:
- **date-picker**: Clicking calendar day cells, selecting dates
- **autocomplete**: Selecting from location/address dropdowns
- **dropdown**: Selecting from option lists (cabin class, property type)
- **number-input**: Entering counts, prices, quantities
- **text-input**: Typing search queries, names
- **checkbox**: Enabling/disabling filters

**Examples**:

**Example 1: Date selection with URL context**
Goal: "find flights for dates %start_date% to %end_date%"
Final URL: https://example.com/flights?depart_date=2025-12-19&return_date=2025-12-26

URL Parameters (hints):
  - depart_date: 2025-12-19
  - return_date: 2025-12-26

Actions:
1. Type "vancouver" into location field (has metadata: autocomplete)
2. Type "los angeles" into location field (has metadata: autocomplete)
3. Click field with placeholder "Depart date" (no metadata)
4. Click "19" (no metadata)
5. Click field with placeholder "Return date" (no metadata)
6. Click "26" (no metadata)
7. Submit (no metadata)

→ Expected Output:
{
  "inferences": [
    {
      "actionIndex": 4,
      "semanticType": "date-picker",
      "semanticValue": "2025-12-19",
      "semanticLabel": "depart date"
    },
    {
      "actionIndex": 6,
      "semanticType": "date-picker",
      "semanticValue": "2025-12-26",
      "semanticLabel": "return date"
    }
  ]
}

Note: Actions 3, 5, 7 are skipped (widget openers and submit)

**Example 2: Cabin class selection**
Goal: "find %class% flights"
Actions:
1. Click "Economy" (no metadata)

→ Expected Output:
{
  "inferences": [
    {
      "actionIndex": 1,
      "semanticType": "dropdown",
      "semanticValue": "Economy",
      "semanticLabel": "cabin class"
    }
  ]
}

**Rules**:
1. ONLY infer for actions marked "(no metadata)"
2. Skip widget openers (e.g., "Click field with placeholder")
3. **For date clicks** (numeric 1-31):
   - Use URL parameters to get FULL dates (YYYY-MM-DD format)
   - Match day numbers to URL date params by position
   - Example: "Click 19" + URL param "depart_date=2025-12-19" → semanticValue: "2025-12-19"
   - Look at PREVIOUS action (widget opener) to get user-visible label
   - Example: "Click field with placeholder 'Depart date'" → use "depart date" as label
4. For text clicks after typing, infer based on variable context
5. **CRITICAL**: Use **user-visible contextual labels**, NOT variable names
   - ✅ CORRECT: semanticLabel: "depart date", "return date", "cabin class"
   - ❌ WRONG: semanticLabel: "start_date", "end_date", "class"
   - These labels are used in Stagehand instructions to find fields on the page

**Output format**:

Return a JSON object with this EXACT structure:
{
  "inferences": [
    {
      "actionIndex": 5,
      "semanticType": "date-picker",
      "semanticValue": "2025-12-19",
      "semanticLabel": "depart date"
    },
    {
      "actionIndex": 7,
      "semanticType": "date-picker",
      "semanticValue": "2025-12-26",
      "semanticLabel": "return date"
    }
  ]
}

**CRITICAL**:
- The root object MUST have an "inferences" key with an array value
- Include ALL inferred actions in this single array
- If no actions need inference, return: {"inferences": []}
- Skip widget openers and submit actions (don't include them)`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: z.object({
        inferences: z.array(z.object({
          actionIndex: z.number(),
          semanticType: z.string(),
          semanticValue: z.union([z.string(), z.number(), z.boolean()]),
          semanticLabel: z.string(),
        })),
        explanation: z.string().optional(),
      }),
      prompt,
      temperature: 0.2, // Slightly higher for inference creativity
    });

    console.log('[Semantic Inference] LLM inferred metadata for actions:', result.object);

    // Apply inferences to actions
    const enrichedActions = actions.map((action, index) => {
      const inference = result.object.inferences.find(inf => inf.actionIndex === index + 1);
      if (inference) {
        return {
          ...action,
          semanticType: inference.semanticType,
          semanticValue: inference.semanticValue,
          semanticLabel: inference.semanticLabel,
        };
      }
      return action;
    });

    return enrichedActions;
  } catch (error) {
    console.error('[Semantic Inference] Error inferring semantic context:', error);
    // Fallback: return original actions
    return actions;
  }
}
