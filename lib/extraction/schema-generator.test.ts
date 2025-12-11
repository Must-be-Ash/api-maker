/**
 * Tests for Schema Generator
 */

import {
  generateExtractionSchema,
  validateSchemaCompleteness,
  getSchemaFieldNames,
  hasField,
  ExtractionSchema,
} from './schema-generator';

describe('Schema Generator', () => {
  test('generates schema for flight search goal', async () => {
    const goal = 'Find cheapest flight from %origin% to %destination%';
    const schema = await generateExtractionSchema(goal);

    expect(schema.fields.length).toBeGreaterThan(0);
    expect(schema.instruction).toBeTruthy();
    expect(schema.description).toBeTruthy();

    // Should have price field
    expect(hasField(schema, 'price')).toBe(true);

    // Should have route or origin+destination for validation
    const fieldNames = getSchemaFieldNames(schema);
    const hasValidation =
      fieldNames.includes('route') ||
      (fieldNames.includes('origin') && fieldNames.includes('destination'));
    expect(hasValidation).toBe(true);
  });

  test('generates schema for product price goal', async () => {
    const goal = 'Find price for product %productName% on Amazon';
    const schema = await generateExtractionSchema(goal);

    expect(schema.fields.length).toBeGreaterThan(0);

    // Should have price and title
    expect(hasField(schema, 'price')).toBe(true);
    const hasTitle = hasField(schema, 'title') || hasField(schema, 'productName');
    expect(hasTitle).toBe(true);
  });

  test('generates schema for contact form goal', async () => {
    const goal = 'Fill contact form with name %name%, email %email%, message %message%';
    const schema = await generateExtractionSchema(goal);

    expect(schema.fields.length).toBeGreaterThan(0);

    // Should have status field
    expect(hasField(schema, 'status')).toBe(true);
  });

  test('generates schema for hotel search goal', async () => {
    const goal = 'Search for hotels in %location% from %checkIn% to %checkOut%';
    const schema = await generateExtractionSchema(goal);

    expect(schema.fields.length).toBeGreaterThan(0);

    // Should have price
    expect(hasField(schema, 'price')).toBe(true);
  });

  test('validates schema completeness for flight search', () => {
    const schema: ExtractionSchema = {
      fields: [
        { name: 'price', type: 'string', description: 'Price' },
        { name: 'route', type: 'string', description: 'Route' },
      ],
      instruction: 'Extract flight',
      description: 'Flight data',
    };

    const validation = validateSchemaCompleteness(
      schema,
      'Find flights from %origin% to %destination%'
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toHaveLength(0);
  });

  test('validates schema completeness for product search', () => {
    const schema: ExtractionSchema = {
      fields: [
        { name: 'price', type: 'string', description: 'Price' },
        { name: 'title', type: 'string', description: 'Product title' },
      ],
      instruction: 'Extract product',
      description: 'Product data',
    };

    const validation = validateSchemaCompleteness(
      schema,
      'Find product %productName% on Amazon'
    );

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toHaveLength(0);
  });

  test('detects missing validation fields', () => {
    const schema: ExtractionSchema = {
      fields: [{ name: 'price', type: 'string', description: 'Price' }],
      instruction: 'Extract price',
      description: 'Price data',
    };

    const validation = validateSchemaCompleteness(
      schema,
      'Find flights from %origin% to %destination%'
    );

    expect(validation.valid).toBe(false);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });

  test('gets field names from schema', () => {
    const schema: ExtractionSchema = {
      fields: [
        { name: 'price', type: 'string', description: 'Price' },
        { name: 'airline', type: 'string', description: 'Airline' },
        { name: 'route', type: 'string', description: 'Route' },
      ],
      instruction: 'Extract flight',
      description: 'Flight data',
    };

    const fieldNames = getSchemaFieldNames(schema);

    expect(fieldNames).toEqual(['price', 'airline', 'route']);
  });

  test('checks if schema has field (case insensitive)', () => {
    const schema: ExtractionSchema = {
      fields: [
        { name: 'price', type: 'string', description: 'Price' },
        { name: 'airline', type: 'string', description: 'Airline' },
      ],
      instruction: 'Extract flight',
      description: 'Flight data',
    };

    expect(hasField(schema, 'price')).toBe(true);
    expect(hasField(schema, 'Price')).toBe(true);
    expect(hasField(schema, 'AIRLINE')).toBe(true);
    expect(hasField(schema, 'route')).toBe(false);
  });
});
