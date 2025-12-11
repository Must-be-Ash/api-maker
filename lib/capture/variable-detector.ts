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
