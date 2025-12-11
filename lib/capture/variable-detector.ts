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

export interface VariableMapping {
  [demoValue: string]: string; // e.g., "Vancouver" → "%origin%"
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
