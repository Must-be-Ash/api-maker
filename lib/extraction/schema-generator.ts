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
 * Generates extraction schema from goal using LLM
 */
export async function generateExtractionSchema(
  goal: string
): Promise<ExtractionSchema> {
  const prompt = `You are an expert at designing data extraction schemas for web automation.

**User's Goal**: ${goal}

Based on this goal, determine what data should be extracted from the web page after the task is completed.

**Guidelines**:

1. **Flight Search Goals**: Extract price, airline, route, departure/arrival times, duration, number of stops, booking URL
2. **Product Price Goals**: Extract price, product title, availability, rating, seller, product URL
3. **Contact Form Goals**: Extract submission status, confirmation message, timestamp
4. **Hotel Search Goals**: Extract price per night, total price, hotel name, rating, amenities, booking URL
5. **Job Search Goals**: Extract job titles, company names, locations, salary ranges, application URLs, posted dates
6. **Stock Price Goals**: Extract current price, price change (dollar and percentage), market cap, volume
7. **Weather Goals**: Extract temperature (high/low), precipitation probability, conditions, wind speed

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

Now generate the extraction schema for the given goal.`;

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
    console.error('[Schema Generator] Error generating schema:', error);

    // Fallback: return a generic schema
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
