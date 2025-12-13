/**
 * Goal Inference for Skills System
 *
 * Transforms vague user input into structured, variable-aware goals.
 * Uses AI to analyze user intent, demo actions, and context to infer proper goals.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { GoalCategory } from '@/lib/extraction/schema-generator';

/**
 * Result of goal inference analysis
 */
export interface InferredGoal {
  structuredGoal: string;      // e.g., "Search Google for %query% and extract the answer"
  variables: string[];          // e.g., ["%query%"]
  category: GoalCategory;       // e.g., "generic_search"
  extractionHints: string[];    // e.g., ["answer", "source", "url"]
  confidence: number;           // 0-1 confidence score
}

/**
 * Zod schema for AI response validation
 */
const InferredGoalSchema = z.object({
  structuredGoal: z.string().describe('The inferred goal with variable placeholders (e.g., "Search Google for %query%")'),
  variables: z.array(z.string()).describe('List of variable placeholders found in the goal (e.g., ["%query%", "%city%"])'),
  category: z.enum([
    'generic_search',
    'job_search',
    'weather_lookup',
    'flight_search',
    'product_search',
    'hotel_search',
    'stock_lookup',
    'contact_form',
    'custom'
  ]).describe('The category this goal falls into'),
  extractionHints: z.array(z.string()).describe('Suggested field names for extraction (e.g., ["answer", "source", "url"])'),
  confidence: z.number().min(0).max(1).describe('Confidence score (0-1) for this inference')
});

/**
 * Infers a structured goal from vague user intent and demo actions.
 *
 * Analyzes the user's intent, demo query, URL, and actions to generate
 * a proper structured goal with variable placeholders.
 *
 * @param userIntent - Vague user input (e.g., "doing google search", "%query%", "get weather")
 * @param demoQuery - The value user entered during demo (e.g., "how old is brad pitt", "Tokyo")
 * @param startUrl - The URL where recording started
 * @param actions - List of actions user performed during recording
 * @returns Inferred goal with variables, category, and confidence score
 */
export async function inferGoalFromIntent(
  userIntent: string,
  demoQuery: string,
  startUrl: string,
  actions: Array<{ type: string; description: string }>
): Promise<InferredGoal> {
  console.log('[Goal Inference] Analyzing user intent:', {
    userIntent,
    demoQuery,
    startUrl,
    actionCount: actions.length
  });

  // Build action summary for context
  const actionSummary = actions
    .map((a, i) => `${i + 1}. ${a.type.toUpperCase()}: ${a.description}`)
    .join('\n');

  const prompt = `You are an expert at understanding user intent for web automation tasks.

**User's Intent**: "${userIntent}"
**Demo Value**: "${demoQuery}"
**Start URL**: ${startUrl}
**Actions Taken**:
${actionSummary || 'No actions recorded'}

**Your Task**: Infer a structured goal that:
1. Uses proper variable placeholders (e.g., %query%, %city%, %role%, %location%)
2. Is specific enough to guide extraction
3. Is generic enough to work with different inputs
4. Matches common automation patterns

**Examples of Good Goal Inference**:

1. User Intent: "doing google search"
   Demo: "how old is brad pitt"
   Inferred Goal: "Search Google for %query% and extract the answer"
   Variables: ["%query%"]
   Category: "generic_search"

2. User Intent: "get weather"
   Demo: "Tokyo"
   Inferred Goal: "Get current weather for %city%"
   Variables: ["%city%"]
   Category: "weather_lookup"

3. User Intent: "find jobs"
   Demo: "software engineer in San Francisco"
   Inferred Goal: "Find jobs on LinkedIn for %role% in %location%"
   Variables: ["%role%", "%location%"]
   Category: "job_search"

4. User Intent: "check flight prices"
   Demo: "SFO to NYC on Dec 25"
   Inferred Goal: "Find flights from %origin% to %destination% on %date%"
   Variables: ["%origin%", "%destination%", "%date%"]
   Category: "flight_search"

5. User Intent: "product price"
   Demo: "iPhone 15 Pro"
   Inferred Goal: "Find price for %product% on Amazon"
   Variables: ["%product%"]
   Category: "product_search"

6. User Intent: "hotel search"
   Demo: "Hotels in Paris for 2 nights"
   Inferred Goal: "Find hotels in %location% for %duration%"
   Variables: ["%location%", "%duration%"]
   Category: "hotel_search"

7. User Intent: "stock price"
   Demo: "AAPL"
   Inferred Goal: "Get stock price for %ticker%"
   Variables: ["%ticker%"]
   Category: "stock_lookup"

8. User Intent: "%query%"
   Demo: "Brad Pitt age"
   Inferred Goal: "Search Google for %query% and extract the answer"
   Variables: ["%query%"]
   Category: "generic_search"

9. User Intent: "doing a search"
   Demo: "what's the weather in New York"
   Inferred Goal: "Search Google for %query% and extract the answer"
   Variables: ["%query%"]
   Category: "generic_search"

10. User Intent: "looking up something"
    Demo: "Tesla stock"
    Inferred Goal: "Search Google for %query% and extract the answer"
    Variables: ["%query%"]
    Category: "generic_search"

**Guidelines**:
- If the intent is vague (e.g., "doing search", "looking up"), assume generic search
- Extract multiple variables if the demo contains multiple distinct values
- Match category to the most specific type (weather > search, jobs > search, etc.)
- Use clear variable names that indicate what they represent
- Include action verbs (Search, Find, Get, Check) for clarity
- Confidence should be 0.9+ for common patterns, 0.7-0.9 for less common, 0.5-0.7 for unusual

**Analyze the user's intent and demo to infer the structured goal.**`;

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: InferredGoalSchema,
      prompt,
      temperature: 0.3, // Lower temperature for more consistent results
    });

    console.log('[Goal Inference] Inference result:', {
      structuredGoal: result.object.structuredGoal,
      variables: result.object.variables,
      category: result.object.category,
      confidence: result.object.confidence
    });

    return result.object;

  } catch (error) {
    console.error('[Goal Inference] Error during inference:', error);

    // Fallback: Create a generic search goal if inference fails
    const fallbackGoal: InferredGoal = {
      structuredGoal: userIntent.includes('%')
        ? userIntent
        : `Search for %query% and extract the result`,
      variables: userIntent.includes('%')
        ? (userIntent.match(/%\w+%/g) || ['%query%'])
        : ['%query%'],
      category: 'generic_search',
      extractionHints: ['result', 'answer', 'source'],
      confidence: 0.3 // Low confidence for fallback
    };

    console.log('[Goal Inference] Using fallback goal:', fallbackGoal);
    return fallbackGoal;
  }
}
