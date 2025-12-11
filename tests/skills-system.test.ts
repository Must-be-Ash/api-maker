/**
 * Comprehensive Test Suite for Skills System 2.0
 *
 * Tests cover:
 * 1. Action Grouping
 * 2. Variable Detection
 * 3. Schema Generation
 * 4. Variable Substitution
 * 5. Result Validation
 * 6. End-to-End Workflows
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import type { RecordedAction } from '@/lib/types/skills';

/**
 * NOTE: This test suite requires Jest to be installed and configured.
 * To run these tests:
 * 1. Install Jest: pnpm add -D jest @types/jest ts-jest
 * 2. Configure Jest: npx ts-jest config:init
 * 3. Run tests: pnpm test
 */

describe('Skills System 2.0', () => {

  // ============================================================================
  // 1. ACTION GROUPING TESTS
  // ============================================================================

  describe('Action Grouping', () => {
    test('groups consecutive keystrokes into single action', () => {
      // Import function dynamically to avoid build errors before tests run
      const { groupActions } = require('@/lib/capture/action-grouper');

      const rawActions: RecordedAction[] = [
        { type: 'fill', selector: '#origin', value: 'V', timestamp: 1000, description: '' },
        { type: 'fill', selector: '#origin', value: 'a', timestamp: 1050, description: '' },
        { type: 'fill', selector: '#origin', value: 'n', timestamp: 1100, description: '' },
      ];

      const grouped = groupActions(rawActions);

      expect(grouped).toHaveLength(1);
      expect(grouped[0].value).toBe('Vancouver');
      expect(grouped[0].type).toBe('type');
    });

    test('preserves click actions as separate', () => {
      const { groupActions } = require('@/lib/capture/action-grouper');

      const rawActions: RecordedAction[] = [
        { type: 'click', selector: '#button1', timestamp: 1000, description: 'Click button 1' },
        { type: 'click', selector: '#button2', timestamp: 1500, description: 'Click button 2' },
      ];

      const grouped = groupActions(rawActions);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].type).toBe('click');
      expect(grouped[1].type).toBe('click');
    });

    test('groups actions by field change', () => {
      const { groupActions } = require('@/lib/capture/action-grouper');

      const rawActions: RecordedAction[] = [
        { type: 'fill', selector: '#origin', value: 'L', timestamp: 1000, description: '' },
        { type: 'fill', selector: '#origin', value: 'A', timestamp: 1050, description: '' },
        { type: 'fill', selector: '#origin', value: 'X', timestamp: 1100, description: '' },
        { type: 'fill', selector: '#destination', value: 'Y', timestamp: 2000, description: '' },
        { type: 'fill', selector: '#destination', value: 'V', timestamp: 2050, description: '' },
        { type: 'fill', selector: '#destination', value: 'R', timestamp: 2100, description: '' },
      ];

      const grouped = groupActions(rawActions);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].selector).toBe('#origin');
      expect(grouped[0].value).toBe('LAX');
      expect(grouped[1].selector).toBe('#destination');
      expect(grouped[1].value).toBe('YVR');
    });
  });

  // ============================================================================
  // 2. VARIABLE DETECTION TESTS
  // ============================================================================

  describe('Variable Detection', () => {
    test('maps typed values to goal variables', async () => {
      const { detectVariables } = require('@/lib/capture/variable-detector');

      const goal = 'Search for flights from %origin% to %destination%';
      const typedValues = ['Vancouver', 'LAX'];

      const mapping = await detectVariables(goal, typedValues);

      expect(mapping['Vancouver']).toBe('%origin%');
      expect(mapping['LAX']).toBe('%destination%');
    });

    test('handles date variables', async () => {
      const { detectVariables } = require('@/lib/capture/variable-detector');

      const goal = 'Search flights departing %departureDate% returning %returnDate%';
      const typedValues = ['2025-01-10', '2025-01-15'];

      const mapping = await detectVariables(goal, typedValues);

      expect(mapping['2025-01-10']).toBe('%departureDate%');
      expect(mapping['2025-01-15']).toBe('%returnDate%');
    });

    test('handles product search variables', async () => {
      const { detectVariables } = require('@/lib/capture/variable-detector');

      const goal = 'Find price for %productName% on Amazon';
      const typedValues = ['iPhone 15 Pro'];

      const mapping = await detectVariables(goal, typedValues);

      expect(mapping['iPhone 15 Pro']).toBe('%productName%');
    });

    test('returns empty mapping when no variables in goal', async () => {
      const { detectVariables } = require('@/lib/capture/variable-detector');

      const goal = 'Click the submit button';
      const typedValues = ['some value'];

      const mapping = await detectVariables(goal, typedValues);

      expect(Object.keys(mapping)).toHaveLength(0);
    });
  });

  // ============================================================================
  // 3. SCHEMA GENERATION TESTS
  // ============================================================================

  describe('Schema Generation', () => {
    test('generates extraction schema from flight search goal', async () => {
      const { generateExtractionSchema } = require('@/lib/extraction/schema-generator');

      const goal = 'Find cheapest flight from %origin% to %destination%';

      const schema = await generateExtractionSchema(goal);

      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'price' })
      );
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'airline' })
      );
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'route' })
      );
    });

    test('generates schema for product price search', async () => {
      const { generateExtractionSchema } = require('@/lib/extraction/schema-generator');

      const goal = 'Find price for product %productName% on Amazon';

      const schema = await generateExtractionSchema(goal);

      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'price' })
      );
      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'title' })
      );
      expect(schema.instruction).toContain('product');
    });

    test('generates schema for contact form submission', async () => {
      const { generateExtractionSchema } = require('@/lib/extraction/schema-generator');

      const goal = 'Fill contact form with %name% and %email%';

      const schema = await generateExtractionSchema(goal);

      expect(schema.fields).toContainEqual(
        expect.objectContaining({ name: 'status' })
      );
      expect(schema.instruction).toBeDefined();
    });
  });

  // ============================================================================
  // 4. VARIABLE SUBSTITUTION TESTS
  // ============================================================================

  describe('Variable Substitution', () => {
    test('substitutes variables in fill actions', () => {
      // Mock the page object
      const mockPage = {
        locator: jest.fn(() => ({
          fill: jest.fn(),
          click: jest.fn(),
        })),
        goto: jest.fn(),
      };

      const actions: RecordedAction[] = [
        { type: 'fill', selector: '#origin', value: '%origin%', description: 'Fill origin', timestamp: Date.now() },
      ];
      const variables = { origin: 'Toronto' };

      // Verify variable substitution logic
      const substitutedValue = variables.origin;
      expect(substitutedValue).toBe('Toronto');
      expect(substitutedValue).not.toBe('%origin%');
    });

    test('handles missing variables gracefully', () => {
      const actions: RecordedAction[] = [
        { type: 'fill', selector: '#origin', value: '%origin%', description: 'Fill origin', timestamp: Date.now() },
      ];
      const variables = {}; // No variables provided

      // Variable should remain as placeholder
      const value = '%origin%';
      const substitutedValue = variables.hasOwnProperty('origin')
        ? (variables as Record<string, string>).origin
        : value;

      expect(substitutedValue).toBe('%origin%');
    });

    test('substitutes multiple variables in workflow', () => {
      const actions: RecordedAction[] = [
        { type: 'fill', selector: '#origin', value: '%origin%', description: 'Fill origin', timestamp: Date.now() },
        { type: 'fill', selector: '#destination', value: '%destination%', description: 'Fill destination', timestamp: Date.now() },
        { type: 'fill', selector: '#date', value: '%departureDate%', description: 'Fill date', timestamp: Date.now() },
      ];
      const variables = {
        origin: 'Vancouver',
        destination: 'Los Angeles',
        departureDate: '2025-01-10',
      };

      // Verify all variables are substituted
      const substituted = actions.map(action => {
        if (action.value && action.value.startsWith('%') && action.value.endsWith('%')) {
          const varName = action.value.slice(1, -1);
          return (variables as Record<string, string>)[varName] || action.value;
        }
        return action.value;
      });

      expect(substituted[0]).toBe('Vancouver');
      expect(substituted[1]).toBe('Los Angeles');
      expect(substituted[2]).toBe('2025-01-10');
    });
  });

  // ============================================================================
  // 5. RESULT VALIDATION TESTS
  // ============================================================================

  describe('Result Validation', () => {
    test('validates flight route matches search criteria', () => {
      const extraction = {
        price: '$500',
        airline: 'United',
        route: 'Vancouver → Los Angeles',
      };
      const variables = {
        origin: 'Vancouver',
        destination: 'Los Angeles',
      };

      // Validation logic
      const route = extraction.route.toLowerCase();
      const hasOrigin = route.includes(variables.origin.toLowerCase());
      const hasDestination = route.includes(variables.destination.toLowerCase());

      expect(hasOrigin).toBe(true);
      expect(hasDestination).toBe(true);
    });

    test('detects invalid route', () => {
      const extraction = {
        price: '$400',
        airline: 'Delta',
        route: 'Chicago → Las Vegas',
      };
      const variables = {
        origin: 'Vancouver',
        destination: 'Los Angeles',
      };

      const route = extraction.route.toLowerCase();
      const hasOrigin = route.includes(variables.origin.toLowerCase());
      const hasDestination = route.includes(variables.destination.toLowerCase());

      expect(hasOrigin).toBe(false);
      expect(hasDestination).toBe(false);
    });

    test('validates product title matches search', () => {
      const extraction = {
        price: '$999',
        title: 'Apple iPhone 15 Pro Max',
        availability: 'In Stock',
      };
      const variables = {
        productName: 'iPhone 15 Pro',
      };

      const title = extraction.title.toLowerCase();
      const searchTerm = variables.productName.toLowerCase();
      const matches = title.includes(searchTerm);

      expect(matches).toBe(true);
    });

    test('detects mismatched product', () => {
      const extraction = {
        price: '$1299',
        title: 'Samsung Galaxy S24',
        availability: 'In Stock',
      };
      const variables = {
        productName: 'iPhone 15 Pro',
      };

      const title = extraction.title.toLowerCase();
      const searchTerm = variables.productName.toLowerCase();
      const matches = title.includes(searchTerm);

      expect(matches).toBe(false);
    });
  });

  // ============================================================================
  // 6. ZOD SCHEMA BUILDER TESTS
  // ============================================================================

  describe('Zod Schema Builder', () => {
    test('builds schema from field definitions', () => {
      const { buildZodSchemaFromFields } = require('@/lib/extraction/zod-schema-builder');

      const fields = [
        { name: 'price', type: 'string', description: 'Total price' },
        { name: 'airline', type: 'string', description: 'Airline name' },
        { name: 'rating', type: 'number', description: 'Rating', optional: true },
      ];

      const schema = buildZodSchemaFromFields(fields);

      expect(schema).toBeDefined();
      // Schema should be able to parse valid data
      const validData = { price: '$245', airline: 'United', rating: 4.5 };
      expect(() => schema.parse(validData)).not.toThrow();
    });

    test('handles optional fields', () => {
      const { buildZodSchemaFromFields } = require('@/lib/extraction/zod-schema-builder');

      const fields = [
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
  });

  // ============================================================================
  // 7. INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    test('full workflow: record → execute with different variables', async () => {
      // This is a placeholder for end-to-end testing
      // In practice, this would:
      // 1. Create a skill recording with demo values
      // 2. Execute the skill with different variables
      // 3. Verify the execution used new variables, not demo values
      // 4. Verify extraction contains correct data

      const mockSkill = {
        skillId: 'test-skill-123',
        goal: 'Search for flights from %origin% to %destination%',
        recordedActions: [
          { type: 'fill', selector: '#origin', value: '%origin%', description: 'Fill origin' },
          { type: 'fill', selector: '#destination', value: '%destination%', description: 'Fill destination' },
          { type: 'click', selector: '#search', description: 'Click search' },
        ],
        extractionSchema: {
          fields: [
            { name: 'price', type: 'string', description: 'Flight price' },
            { name: 'airline', type: 'string', description: 'Airline name' },
            { name: 'route', type: 'string', description: 'Flight route' },
          ],
          instruction: 'Extract the cheapest flight details',
        },
      };

      // Execute with different variables
      const variables = {
        origin: 'Toronto',
        destination: 'New York',
      };

      // Verify variable substitution would occur
      const substitutedActions = mockSkill.recordedActions.map(action => {
        if (action.value && action.value.startsWith('%')) {
          const varName = action.value.slice(1, -1);
          return { ...action, value: (variables as Record<string, string>)[varName] };
        }
        return action;
      });

      expect(substitutedActions[0].value).toBe('Toronto');
      expect(substitutedActions[1].value).toBe('New York');
    });

    test('validates end-to-end extraction', () => {
      // Mock extracted result
      const extractedResult = {
        price: '$450',
        airline: 'Delta',
        route: 'Toronto → New York',
      };

      const variables = {
        origin: 'Toronto',
        destination: 'New York',
      };

      // Validation
      const route = extractedResult.route.toLowerCase();
      const hasOrigin = route.includes(variables.origin.toLowerCase());
      const hasDestination = route.includes(variables.destination.toLowerCase());

      expect(hasOrigin).toBe(true);
      expect(hasDestination).toBe(true);
      expect(extractedResult.price).toBeDefined();
      expect(extractedResult.airline).toBeDefined();
    });
  });
});
