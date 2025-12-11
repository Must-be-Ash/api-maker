/**
 * Zod Schema Builder
 *
 * Converts stored schema field definitions to Zod schemas for runtime validation.
 *
 * Example:
 *   Input: [{ name: 'price', type: 'string', description: 'Total price' }]
 *   Output: z.object({ price: z.string().describe('Total price') })
 */

import { z } from 'zod';
import type { SchemaField } from './schema-generator';

/**
 * Builds a Zod schema from field definitions
 */
export function buildZodSchemaFromFields(fields: SchemaField[]): z.ZodObject<any> {
  if (!fields || fields.length === 0) {
    // Return a generic object schema if no fields provided
    return z.object({
      result: z.string().describe('Extracted result'),
    });
  }

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
        // Dates are stored as ISO strings
        zodType = z.string().describe(field.description);
        break;

      case 'array':
        // Arrays of strings by default
        zodType = z.array(z.string()).describe(field.description);
        break;

      case 'object':
        // Generic object - use unknown for any value type
        zodType = z.record(z.string(), z.unknown()).describe(field.description);
        break;

      default:
        // Default to string for unknown types
        zodType = z.string().describe(field.description);
    }

    // Make field optional if specified
    if (field.optional) {
      zodType = zodType.optional();
    }

    schemaShape[field.name] = zodType;
  });

  return z.object(schemaShape);
}

/**
 * Validates data against a Zod schema and returns typed result
 */
export function validateExtractedData<T>(
  schema: z.ZodObject<any>,
  data: unknown
): { success: boolean; data?: T; errors?: z.ZodError } {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData as T,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error,
      };
    }
    throw error;
  }
}

/**
 * Gets a safe parse result (doesn't throw)
 */
export function safeParseExtractedData<T>(
  schema: z.ZodObject<any>,
  data: unknown
): z.ZodSafeParseResult<T> {
  return schema.safeParse(data) as z.ZodSafeParseResult<T>;
}

/**
 * Creates a Zod schema for common extraction patterns
 */
export const commonSchemas = {
  /**
   * Flight search result schema
   */
  flightSearch: z.object({
    price: z.string().describe('Total price with currency symbol'),
    airline: z.string().describe('Airline name'),
    route: z.string().describe('Route in format "Origin → Destination"'),
    departureTime: z.string().optional().describe('Departure time'),
    arrivalTime: z.string().optional().describe('Arrival time'),
    duration: z.string().optional().describe('Flight duration'),
    stops: z.string().optional().describe('Number of stops'),
  }),

  /**
   * Product price schema
   */
  productPrice: z.object({
    price: z.string().describe('Current price with currency symbol'),
    title: z.string().describe('Product title'),
    availability: z.string().describe('Stock availability status'),
    rating: z.string().optional().describe('Average customer rating'),
  }),

  /**
   * Contact form submission schema
   */
  contactForm: z.object({
    status: z.string().describe('Submission status'),
    confirmationMessage: z.string().optional().describe('Confirmation message'),
  }),

  /**
   * Hotel search result schema
   */
  hotelSearch: z.object({
    pricePerNight: z.string().describe('Price per night'),
    totalPrice: z.string().optional().describe('Total price for stay'),
    hotelName: z.string().describe('Hotel name'),
    rating: z.number().optional().describe('Hotel rating'),
    location: z.string().describe('Hotel location'),
  }),
};

/**
 * Infers the appropriate common schema based on goal keywords
 */
export function inferCommonSchema(goal: string): z.ZodObject<any> | null {
  const goalLower = goal.toLowerCase();

  if (goalLower.includes('flight')) {
    return commonSchemas.flightSearch;
  } else if (goalLower.includes('product') || goalLower.includes('price') || goalLower.includes('amazon')) {
    return commonSchemas.productPrice;
  } else if (goalLower.includes('contact') || goalLower.includes('form')) {
    return commonSchemas.contactForm;
  } else if (goalLower.includes('hotel')) {
    return commonSchemas.hotelSearch;
  }

  return null;
}
