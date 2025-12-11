/**
 * Tests for Variable Detector
 */

import {
  detectVariables,
  extractVariablesFromGoal,
  validateMapping,
  getVariableName,
  VariableMapping,
} from './variable-detector';

describe('Variable Detector', () => {
  test('extracts variables from goal', () => {
    const goal = 'Search for flights from %origin% to %destination% on %departureDate%';
    const variables = extractVariablesFromGoal(goal);

    expect(variables).toEqual(['origin', 'destination', 'departureDate']);
  });

  test('extracts variables from goal with no variables', () => {
    const goal = 'Search for flights from Vancouver to LAX';
    const variables = extractVariablesFromGoal(goal);

    expect(variables).toEqual([]);
  });

  test('maps flight search typed values to variables', async () => {
    const goal = 'Search for flights from %origin% to %destination%';
    const typedValues = ['Vancouver', 'LAX'];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping['Vancouver']).toBe('%origin%');
    expect(mapping['LAX']).toBe('%destination%');
  });

  test('maps product search typed values to variables', async () => {
    const goal = 'Find product %productName% with max price %maxPrice%';
    const typedValues = ['iPhone 15 Pro', '1000'];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping['iPhone 15 Pro']).toBe('%productName%');
    expect(mapping['1000']).toBe('%maxPrice%');
  });

  test('maps hotel booking typed values to variables', async () => {
    const goal = 'Book hotel in %location% from %checkIn% to %checkOut%';
    const typedValues = ['New York', '2025-12-20', '2025-12-25'];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping['New York']).toBe('%location%');
    expect(mapping['2025-12-20']).toBe('%checkIn%');
    expect(mapping['2025-12-25']).toBe('%checkOut%');
  });

  test('handles empty typed values', async () => {
    const goal = 'Search for flights from %origin% to %destination%';
    const typedValues: string[] = [];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping).toEqual({});
  });

  test('handles goal with no variables', async () => {
    const goal = 'Click the search button';
    const typedValues = ['Vancouver', 'LAX'];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping).toEqual({});
  });

  test('validates complete mapping', () => {
    const goal = 'Search from %origin% to %destination%';
    const mapping: VariableMapping = {
      'Vancouver': '%origin%',
      'LAX': '%destination%',
    };

    const validation = validateMapping(goal, mapping);

    expect(validation.valid).toBe(true);
    expect(validation.unmappedVariables).toEqual([]);
  });

  test('validates incomplete mapping', () => {
    const goal = 'Search from %origin% to %destination% on %date%';
    const mapping: VariableMapping = {
      'Vancouver': '%origin%',
      'LAX': '%destination%',
      // Missing %date%
    };

    const validation = validateMapping(goal, mapping);

    expect(validation.valid).toBe(false);
    expect(validation.unmappedVariables).toEqual(['date']);
  });

  test('gets variable name from mapping', () => {
    const mapping: VariableMapping = {
      'Vancouver': '%origin%',
      'LAX': '%destination%',
    };

    expect(getVariableName(mapping, 'Vancouver')).toBe('origin');
    expect(getVariableName(mapping, 'LAX')).toBe('destination');
    expect(getVariableName(mapping, 'Unknown')).toBeNull();
  });

  test('handles complex goal with multiple variable types', async () => {
    const goal = 'Fill contact form with name %name%, email %email%, phone %phone%, and message %message%';
    const typedValues = ['John Doe', 'john@example.com', '555-1234', 'Hello there'];

    const mapping = await detectVariables(goal, typedValues);

    expect(mapping['John Doe']).toBe('%name%');
    expect(mapping['john@example.com']).toBe('%email%');
    expect(mapping['555-1234']).toBe('%phone%');
    expect(mapping['Hello there']).toBe('%message%');
  });
});
