/**
 * Tests for Zod Schema Builder
 */

import { z } from 'zod';
import {
  buildZodSchemaFromFields,
  validateExtractedData,
  safeParseExtractedData,
  commonSchemas,
  inferCommonSchema,
} from './zod-schema-builder';
import type { SchemaField } from './schema-generator';

describe('Zod Schema Builder', () => {
  test('builds schema from field definitions', () => {
    const fields: SchemaField[] = [
      { name: 'price', type: 'string', description: 'Total price' },
      { name: 'airline', type: 'string', description: 'Airline name' },
      { name: 'rating', type: 'number', description: 'Rating', optional: true },
    ];

    const schema = buildZodSchemaFromFields(fields);

    // Schema should be a Zod object
    expect(schema).toBeInstanceOf(z.ZodObject);

    // Should parse valid data
    const validData = {
      price: '$245',
      airline: 'United',
      rating: 4.5,
    };

    expect(() => schema.parse(validData)).not.toThrow();
  });

  test('handles all field types', () => {
    const fields: SchemaField[] = [
      { name: 'stringField', type: 'string', description: 'A string' },
      { name: 'numberField', type: 'number', description: 'A number' },
      { name: 'booleanField', type: 'boolean', description: 'A boolean' },
      { name: 'dateField', type: 'date', description: 'A date' },
      { name: 'arrayField', type: 'array', description: 'An array' },
      { name: 'objectField', type: 'object', description: 'An object' },
    ];

    const schema = buildZodSchemaFromFields(fields);

    const validData = {
      stringField: 'test',
      numberField: 42,
      booleanField: true,
      dateField: '2025-12-17',
      arrayField: ['item1', 'item2'],
      objectField: { key: 'value' },
    };

    expect(() => schema.parse(validData)).not.toThrow();
  });

  test('handles optional fields', () => {
    const fields: SchemaField[] = [
      { name: 'required', type: 'string', description: 'Required field' },
      { name: 'optional', type: 'string', description: 'Optional field', optional: true },
    ];

    const schema = buildZodSchemaFromFields(fields);

    // Should work with just required field
    const dataWithoutOptional = { required: 'value' };
    expect(() => schema.parse(dataWithoutOptional)).not.toThrow();

    // Should work with both
    const dataWithOptional = { required: 'value', optional: 'optional value' };
    expect(() => schema.parse(dataWithOptional)).not.toThrow();
  });

  test('validates data successfully', () => {
    const fields: SchemaField[] = [
      { name: 'price', type: 'string', description: 'Price' },
    ];

    const schema = buildZodSchemaFromFields(fields);
    const data = { price: '$100' };

    const result = validateExtractedData(schema, data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.errors).toBeUndefined();
  });

  test('returns errors for invalid data', () => {
    const fields: SchemaField[] = [
      { name: 'price', type: 'number', description: 'Price' },
    ];

    const schema = buildZodSchemaFromFields(fields);
    const invalidData = { price: 'not a number' };

    const result = validateExtractedData(schema, invalidData);

    expect(result.success).toBe(false);
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
  });

  test('safe parse does not throw', () => {
    const fields: SchemaField[] = [
      { name: 'count', type: 'number', description: 'Count' },
    ];

    const schema = buildZodSchemaFromFields(fields);
    const invalidData = { count: 'invalid' };

    const result = safeParseExtractedData(schema, invalidData);

    expect(result.success).toBe(false);
    expect(() => safeParseExtractedData(schema, invalidData)).not.toThrow();
  });

  test('provides common flight search schema', () => {
    const data = {
      price: '$500',
      airline: 'Delta',
      route: 'YVR → LAX',
      departureTime: '10:00 AM',
    };

    expect(() => commonSchemas.flightSearch.parse(data)).not.toThrow();
  });

  test('provides common product price schema', () => {
    const data = {
      price: '$99.99',
      title: 'iPhone 15 Pro',
      availability: 'In Stock',
    };

    expect(() => commonSchemas.productPrice.parse(data)).not.toThrow();
  });

  test('infers flight schema from goal', () => {
    const goal = 'Find cheapest flight from %origin% to %destination%';
    const schema = inferCommonSchema(goal);

    expect(schema).toBe(commonSchemas.flightSearch);
  });

  test('infers product schema from goal', () => {
    const goal = 'Find price for product %productName% on Amazon';
    const schema = inferCommonSchema(goal);

    expect(schema).toBe(commonSchemas.productPrice);
  });

  test('returns null for unrecognized goal', () => {
    const goal = 'Do some random task';
    const schema = inferCommonSchema(goal);

    expect(schema).toBeNull();
  });

  test('handles empty fields array', () => {
    const schema = buildZodSchemaFromFields([]);

    // Should return generic schema with 'result' field
    const data = { result: 'some data' };
    expect(() => schema.parse(data)).not.toThrow();
  });
});
