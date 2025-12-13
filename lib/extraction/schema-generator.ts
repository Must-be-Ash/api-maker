/**
 * Schema Generator
 *
 * Uses LLM to generate Zod extraction schema from user's goal.
 *
 * Example:
 *   Goal: "Find cheapest flight from %origin% to %destination%"
 *   Output: Schema with fields for price, airline, departure/arrival times, duration, etc.
 */

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  description: string;
  optional?: boolean;
}

export interface ExtractionSchema {
  fields: SchemaField[];
  instruction: string;
  description: string;
}

/**
 * Context information passed to schema generator for more accurate schema design.
 * Includes page metadata, user actions, and semantic values captured during recording.
 */
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

/**
 * Goal category classification for schema template selection
 */
export type GoalCategory =
  | "generic_search"
  | "job_search"
  | "weather_lookup"
  | "flight_search"
  | "product_search"
  | "hotel_search"
  | "stock_lookup"
  | "contact_form"
  | "custom";

/**
 * Detects the goal category based on keywords and patterns in the goal string.
 * Used to select appropriate schema templates for variable-based goals.
 *
 * @param goal - The skill goal string (e.g., "Get weather for %city%")
 * @param startUrl - Optional starting URL for domain-based detection
 * @returns GoalCategory classification
 */
function detectGoalCategory(goal: string, startUrl?: string): GoalCategory {
  const lowerGoal = goal.toLowerCase();
  const domain = startUrl ? new URL(startUrl).hostname.replace('www.', '') : '';

  // Pattern matching for common categories (order matters - most specific first)

  // Weather lookup
  if (lowerGoal.includes('weather') || lowerGoal.includes('temperature') || lowerGoal.includes('forecast')) {
    return 'weather_lookup';
  }

  // Flight search
  if (lowerGoal.includes('flight') || lowerGoal.includes('airline') || domain.includes('google.com/travel/flights')) {
    return 'flight_search';
  }

  // Job search
  if (lowerGoal.includes('job') || lowerGoal.includes('position') ||
      lowerGoal.includes('career') || domain.includes('linkedin.com') ||
      domain.includes('indeed.com')) {
    return 'job_search';
  }

  // Product/price search
  if (lowerGoal.includes('product') || lowerGoal.includes('price') ||
      lowerGoal.includes('buy') || lowerGoal.includes('shop') ||
      domain.includes('amazon.com') || domain.includes('ebay.com')) {
    return 'product_search';
  }

  // Hotel search
  if (lowerGoal.includes('hotel') || lowerGoal.includes('accommodation') ||
      lowerGoal.includes('booking') || domain.includes('booking.com') ||
      domain.includes('hotels.com')) {
    return 'hotel_search';
  }

  // Stock lookup
  if (lowerGoal.includes('stock') || lowerGoal.includes('ticker') ||
      lowerGoal.includes('share price') || domain.includes('finance.yahoo.com') ||
      domain.includes('bloomberg.com')) {
    return 'stock_lookup';
  }

  // Contact form
  if (lowerGoal.includes('contact') || lowerGoal.includes('submit form') ||
      lowerGoal.includes('send message') || lowerGoal.includes('inquiry')) {
    return 'contact_form';
  }

  // Generic search (must be after more specific categories)
  if (lowerGoal.includes('search') || lowerGoal.includes('find') ||
      lowerGoal.includes('look up') || lowerGoal.includes('query') ||
      domain.includes('google.com')) {
    return 'generic_search';
  }

  // Default to custom if no pattern matches
  return 'custom';
}

/**
 * Generates a generic schema from a category template for variable-based goals.
 * Uses pre-defined templates instead of AI to ensure consistent, reusable schemas.
 *
 * @param category - The detected goal category
 * @param goal - The original goal string (for logging)
 * @param variables - List of variables found in the goal (e.g., ["%city%", "%query%"])
 * @returns Pre-defined extraction schema for the category
 */
function generateGenericSchemaForCategory(
  category: GoalCategory,
  goal: string,
  variables: string[]
): ExtractionSchema {
  // Import templates
  const { SCHEMA_TEMPLATES } = require('./schema-templates');

  // Get template for category
  const template = SCHEMA_TEMPLATES[category];

  if (!template) {
    console.warn('[Schema Generator] No template found for category:', category);
    // Fallback to custom template
    return SCHEMA_TEMPLATES['custom'];
  }

  console.log('[Schema Generator] Using template for category:', category, {
    fields: template.fields.map((f: any) => f.name),
    variables
  });

  // Return the template as-is (templates are already generic)
  return template;
}

const SchemaGenerationResponseSchema = z.object({
  fields: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['string', 'number', 'boolean', 'date', 'array', 'object']),
      description: z.string(),
      optional: z.boolean().optional(),
    })
  ),
  instruction: z.string(),
  description: z.string(),
});

/**
 * Generates extraction schema from goal using LLM.
 *
 * @param goal - User's goal describing what they want to accomplish
 * @param context - Optional context about the page, actions, and values for better schema accuracy
 * @returns Extraction schema with fields, instruction, and description
 */
export async function generateExtractionSchema(
  goal: string,
  context?: SchemaGenerationContext
): Promise<ExtractionSchema> {
  // NEW: Detect variables in goal for better schema generation
  const variables = goal.match(/%(\w+)%/g) || [];
  const hasVariables = variables.length > 0;

  console.log('[Schema Generator] Analysis:', {
    goal,
    hasVariables,
    variables,
    contextProvided: !!context
  });

  // ✅ NEW: If goal has variables, use category-based template instead of AI
  if (hasVariables) {
    const category = detectGoalCategory(goal, context?.startUrl);
    console.log('[Schema Generator] Variable-based goal detected, using template:', {
      category,
      variables
    });

    return generateGenericSchemaForCategory(category, goal, variables);
  }

  // ✅ EXISTING: If no variables, use context-aware AI generation (backward compatible)
  // Extract domain for better context
  const domain = context?.finalUrl
    ? new URL(context.finalUrl).hostname.replace('www.', '')
    : 'unknown';

  // Build context section if context is provided
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

  // NEW: Add special guidance when variables are detected
  const variableGuidance = hasVariables ? `
⚠️ **IMPORTANT: This goal contains VARIABLES (${variables.join(', ')})**
This means the goal is GENERIC and will be used with DIFFERENT values at execution time.

**YOU MUST**:
1. Create a GENERIC schema that works for ANY value of the variables
2. IGNORE the specific demo value you see in the context
3. Focus on the TYPE of task (search, weather, jobs, etc.), not the specific example
4. Use generic field names like "result", "answer", "title", "source", "url"
5. DO NOT create demo-specific fields (e.g., don't use "apple_stock_price" or "tokyo_weather")

Example: If the goal is "Get weather for %city%" and the demo shows Tokyo weather,
do NOT create a Tokyo-specific schema. Create a generic weather schema that works for ANY city.
` : '';

  const prompt = `You are an expert at designing data extraction schemas for web automation.

**User's Goal**: ${goal}
${variableGuidance}
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

1. **Generic Search/Query Goals** (e.g., "%query%", "search for %term%"): Extract the main answer/result text, source, title, and URL
2. **Flight Search Goals**: Extract price, airline, route, departure/arrival times, duration, number of stops, booking URL
3. **Product Price Goals**: Extract price, product title, availability, rating, seller, product URL
4. **Contact Form Goals**: Extract submission status, confirmation message, timestamp
5. **Hotel Search Goals**: Extract price per night, total price, hotel name, rating, amenities, booking URL
6. **Job Search Goals**: Extract job titles, company names, locations, salary ranges, application URLs, posted dates
7. **Stock Price Goals**: Extract current price, price change (dollar and percentage), market cap, volume
8. **Weather Goals**: Extract temperature (high/low), precipitation probability, conditions, wind speed

**Field Types**:
- Use "string" for text, URLs, dates in ISO format
- Use "number" for prices, ratings, quantities
- Use "boolean" for yes/no flags (available, in stock)
- Use "array" for lists of items
- Use "object" for nested data

**Important**:
- Include fields to VALIDATE the result matches the search criteria
  - For flights: Include "route" or "origin" + "destination" fields
  - For products: Include "title" or "productName" field
  - For locations: Include "location" or "address" field
- Mark fields as optional if they might not always be present
- Create clear, specific field descriptions
- The instruction should be a single sentence describing what to extract

**Example 1**:
Goal: "Find cheapest flight from %origin% to %destination%"
Output:
{
  "fields": [
    {
      "name": "price",
      "type": "string",
      "description": "Total price with currency symbol (e.g., '$245')"
    },
    {
      "name": "airline",
      "type": "string",
      "description": "Airline name for the flight"
    },
    {
      "name": "route",
      "type": "string",
      "description": "Route in format 'Origin → Destination' for validation"
    },
    {
      "name": "departureTime",
      "type": "string",
      "description": "Departure time",
      "optional": true
    },
    {
      "name": "arrivalTime",
      "type": "string",
      "description": "Arrival time",
      "optional": true
    },
    {
      "name": "duration",
      "type": "string",
      "description": "Flight duration",
      "optional": true
    },
    {
      "name": "stops",
      "type": "string",
      "description": "Number of stops (e.g., 'Nonstop', '1 stop')",
      "optional": true
    }
  ],
  "instruction": "Extract the cheapest flight details including price, airline, route, and flight times",
  "description": "Extracts flight search results with price and details"
}

**Example 2**:
Goal: "Find price for product %productName% on Amazon"
Output:
{
  "fields": [
    {
      "name": "price",
      "type": "string",
      "description": "Current price with currency symbol"
    },
    {
      "name": "title",
      "type": "string",
      "description": "Product title for validation"
    },
    {
      "name": "availability",
      "type": "string",
      "description": "Stock availability status"
    },
    {
      "name": "rating",
      "type": "string",
      "description": "Average customer rating",
      "optional": true
    }
  ],
  "instruction": "Extract product price, title, and availability status",
  "description": "Extracts product information from Amazon"
}

**Example 3**:
Goal: "Fill contact form with name %name%, email %email%, message %message%"
Output:
{
  "fields": [
    {
      "name": "status",
      "type": "string",
      "description": "Submission status (e.g., 'success', 'submitted')"
    },
    {
      "name": "confirmationMessage",
      "type": "string",
      "description": "Confirmation message displayed after submission",
      "optional": true
    }
  ],
  "instruction": "Extract form submission status and confirmation message",
  "description": "Extracts contact form submission result"
}

**Example 4**:
Goal: "%query%"
Output:
{
  "fields": [
    {
      "name": "result",
      "type": "string",
      "description": "Main answer or result text extracted from the page"
    },
    {
      "name": "source",
      "type": "string",
      "description": "Source or title of where the result came from",
      "optional": true
    },
    {
      "name": "url",
      "type": "string",
      "description": "URL of the page with the result",
      "optional": true
    }
  ],
  "instruction": "Extract relevant data based on the goal",
  "description": "Generic extraction for search or query results"
}

**Example 5**:
Goal: "search for %searchTerm%"
Output:
{
  "fields": [
    {
      "name": "result",
      "type": "string",
      "description": "Top search result or main answer"
    },
    {
      "name": "title",
      "type": "string",
      "description": "Title of the result",
      "optional": true
    },
    {
      "name": "snippet",
      "type": "string",
      "description": "Text snippet or description from the result",
      "optional": true
    }
  ],
  "instruction": "Extract search results based on the query",
  "description": "Extracts main search result and relevant details"
}

**Example 6 (Context-Aware)**:
Goal: "%query%"
Context:
- Final URL: https://www.ticketmaster.com/kendrick-lamar-tickets/artist/1172496
- Page Title: "Kendrick Lamar Tickets - Tour Dates 2025 | Ticketmaster"
- Headings: ["Upcoming Events", "Filter by Date", "Venues"]
- Contains prices: YES ✓
- Contains dates: YES ✓
- Contains lists: YES ✓
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
- Contains prices: NO
- Contains dates: YES ✓
- Contains lists: YES ✓
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

  try {
    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: SchemaGenerationResponseSchema,
      prompt,
      temperature: 0.2, // Low temperature for consistent schema generation
    });

    console.log('[Schema Generator] Generated schema:', result.object);

    return {
      fields: result.object.fields,
      instruction: result.object.instruction,
      description: result.object.description,
    };
  } catch (error) {
    console.error('[Schema Generator] First attempt failed:', error);

    // Retry with more explicit prompt
    try {
      console.log('[Schema Generator] Retrying with explicit prompt...');

      const retryPrompt = `CRITICAL: You MUST return a valid JSON schema. Do NOT return an empty object.

Goal: ${goal}

Generate a data extraction schema with these REQUIRED fields:
- "fields": An array with at least one field object
- "instruction": A string describing what to extract
- "description": A string describing the schema

For generic goals like "%query%" or "%searchTerm%", use this template:
{
  "fields": [
    {
      "name": "result",
      "type": "string",
      "description": "Main answer or result text from the page"
    }
  ],
  "instruction": "Extract relevant data based on the goal",
  "description": "Generic extraction for search or query results"
}

Now generate the schema:`;

      const retryResult = await generateObject({
        model: openai('gpt-4o'),
        schema: SchemaGenerationResponseSchema,
        prompt: retryPrompt,
        temperature: 0.1, // Even lower temperature for retry
      });

      console.log('[Schema Generator] Retry succeeded:', retryResult.object);

      return {
        fields: retryResult.object.fields,
        instruction: retryResult.object.instruction,
        description: retryResult.object.description,
      };
    } catch (retryError) {
      console.error('[Schema Generator] Retry also failed:', retryError);

      // Final fallback: return a generic schema
      return {
        fields: [
          {
            name: 'result',
            type: 'string',
            description: 'Extracted result from the page',
          },
        ],
        instruction: 'Extract relevant data based on the goal',
        description: 'Generic extraction schema',
      };
    }
  }
}

/**
 * Validates that a schema has required validation fields based on goal type
 */
export function validateSchemaCompleteness(
  schema: ExtractionSchema,
  goal: string
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const fieldNames = schema.fields.map(f => f.name.toLowerCase());

  // Check for flight search validation fields
  if (goal.toLowerCase().includes('flight')) {
    const hasRoute = fieldNames.includes('route');
    const hasOriginDest = fieldNames.includes('origin') && fieldNames.includes('destination');

    if (!hasRoute && !hasOriginDest) {
      warnings.push('Flight search schema should include "route" or "origin"+"destination" for validation');
    }
  }

  // Check for product search validation fields
  if (goal.toLowerCase().includes('product') || goal.toLowerCase().includes('amazon')) {
    const hasTitle = fieldNames.some(name => name.includes('title') || name.includes('name'));

    if (!hasTitle) {
      warnings.push('Product search schema should include "title" or "productName" for validation');
    }
  }

  // Check for location-based searches
  if (goal.toLowerCase().includes('hotel') || goal.toLowerCase().includes('location')) {
    const hasLocation = fieldNames.some(name =>
      name.includes('location') || name.includes('address') || name.includes('hotel')
    );

    if (!hasLocation) {
      warnings.push('Location search schema should include location or address field for validation');
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Gets field names from schema
 */
export function getSchemaFieldNames(schema: ExtractionSchema): string[] {
  return schema.fields.map(f => f.name);
}

/**
 * Checks if schema includes a specific field
 */
export function hasField(schema: ExtractionSchema, fieldName: string): boolean {
  return schema.fields.some(f => f.name.toLowerCase() === fieldName.toLowerCase());
}
