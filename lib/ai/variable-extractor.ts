/**
 * Variable Extraction for Skills System
 *
 * Extracts variable values from user input using NLU.
 * Uses AI to understand user intent and map values to variables.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Extracted variables as key-value pairs
 */
export interface ExtractedVariables {
  [key: string]: string;
}

/**
 * Extracts variable values from user input based on the skill goal.
 *
 * Uses AI to intelligently parse natural language input and extract
 * the values for each variable placeholder in the goal.
 *
 * @param skillGoal - The skill goal with variables (e.g., "Get weather for %city%")
 * @param userInput - Natural language input (e.g., "what's the weather in Tokyo")
 * @param variableNames - List of variable placeholders (e.g., ["%city%"])
 * @returns Extracted values as key-value pairs (e.g., { "%city%": "Tokyo" })
 */
export async function extractVariablesFromInput(
  skillGoal: string,
  userInput: string,
  variableNames: string[]
): Promise<ExtractedVariables> {
  console.log('[Variable Extraction] Extracting variables:', {
    skillGoal,
    userInput,
    variableNames
  });

  // Build Zod schema dynamically based on variable names
  const schemaFields: Record<string, z.ZodString> = {};
  variableNames.forEach(varName => {
    schemaFields[varName] = z.string().describe(`Value for ${varName}`);
  });

  const ExtractedVariablesSchema = z.object(schemaFields);

  const prompt = `You are an expert at extracting structured data from natural language input.

**Skill Goal**: "${skillGoal}"
**User Input**: "${userInput}"
**Variables to Extract**: ${variableNames.join(', ')}

**Your Task**: Extract the value for each variable from the user input.

**Examples**:

1. Goal: "Get weather for %city%"
   Input: "what's the weather in Tokyo"
   Output: { "%city%": "Tokyo" }

2. Goal: "Get weather for %city%"
   Input: "Tokyo weather"
   Output: { "%city%": "Tokyo" }

3. Goal: "Find jobs for %role% in %location%"
   Input: "software engineer positions in San Francisco"
   Output: { "%role%": "software engineer", "%location%": "San Francisco" }

4. Goal: "Search Google for %query%"
   Input: "how old is brad pitt"
   Output: { "%query%": "how old is brad pitt" }

5. Goal: "Find flights from %origin% to %destination% on %date%"
   Input: "flights from SFO to NYC on Dec 25"
   Output: { "%origin%": "SFO", "%destination%": "NYC", "%date%": "Dec 25" }

6. Goal: "Find price for %product% on Amazon"
   Input: "iPhone 15 Pro price"
   Output: { "%product%": "iPhone 15 Pro" }

7. Goal: "Get stock price for %ticker%"
   Input: "AAPL stock"
   Output: { "%ticker%": "AAPL" }

8. Goal: "Find hotels in %location% for %duration%"
   Input: "hotels in Paris for 3 nights"
   Output: { "%location%": "Paris", "%duration%": "3 nights" }

**Guidelines**:
- Extract the exact values mentioned in the user input
- Don't add extra words or modify the values
- If a variable value is not in the input, use the entire input as fallback
- Preserve the original formatting and case
- For query variables, use the entire input if it doesn't match other variables

**Extract the values for each variable from the user input.**`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: ExtractedVariablesSchema,
      prompt,
      temperature: 0.2, // Lower temperature for consistent extraction
    });

    console.log('[Variable Extraction] Extraction result:', result.object);

    return result.object as ExtractedVariables;

  } catch (error) {
    console.error('[Variable Extraction] Error during extraction:', error);

    // Fallback: Return user input for all variables
    const fallbackValues: ExtractedVariables = {};
    variableNames.forEach(varName => {
      fallbackValues[varName] = userInput;
    });

    console.log('[Variable Extraction] Using fallback (input for all variables):', fallbackValues);
    return fallbackValues;
  }
}
