/**
 * Manual verification script for Zod Schema Builder
 */

import {
  buildZodSchemaFromFields,
  validateExtractedData,
  commonSchemas,
  inferCommonSchema,
} from '@/lib/extraction/zod-schema-builder';
import type { SchemaField } from '@/lib/extraction/schema-generator';

console.log('🧪 Testing Zod Schema Builder...\n');

// Test 1: Build schema from field definitions
console.log('Test 1: Build Zod Schema from Field Definitions');
console.log('=================================================');

const fields1: SchemaField[] = [
  { name: 'price', type: 'string', description: 'Total price with currency symbol' },
  { name: 'airline', type: 'string', description: 'Airline name' },
  { name: 'route', type: 'string', description: 'Route in format "Origin → Destination"' },
  { name: 'duration', type: 'string', description: 'Flight duration', optional: true },
];

console.log('Field definitions:');
fields1.forEach(field => {
  console.log(`  - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
});

const schema1 = buildZodSchemaFromFields(fields1);
console.log('\nBuilt Zod schema successfully');

// Test with valid data
const validData1 = {
  price: '$500',
  airline: 'United',
  route: 'YVR → LAX',
  duration: '5h 30m',
};

console.log('\nTesting with valid data:', validData1);
const result1 = validateExtractedData(schema1, validData1);
console.log('Validation result:', result1.success ? 'SUCCESS' : 'FAILED');
console.log('✅ PASS:', result1.success ? 'YES' : 'NO');
console.log();

// Test 2: Handle optional fields
console.log('Test 2: Handle Optional Fields');
console.log('================================');

const dataWithoutOptional = {
  price: '$500',
  airline: 'United',
  route: 'YVR → LAX',
  // duration is optional and missing
};

console.log('Data without optional field:', dataWithoutOptional);
const result2 = validateExtractedData(schema1, dataWithoutOptional);
console.log('Validation result:', result2.success ? 'SUCCESS' : 'FAILED');
console.log('✅ PASS:', result2.success ? 'YES' : 'NO');
console.log();

// Test 3: Reject invalid data
console.log('Test 3: Reject Invalid Data');
console.log('=============================');

const invalidData = {
  price: 123, // Should be string, not number
  airline: 'United',
  route: 'YVR → LAX',
};

console.log('Invalid data (price is number instead of string):', invalidData);
const result3 = validateExtractedData(schema1, invalidData);
console.log('Validation result:', result3.success ? 'SUCCESS' : 'FAILED');
if (!result3.success && result3.errors) {
  console.log('Errors detected:', result3.errors.issues?.length || 0, 'error(s)');
}
console.log('✅ PASS:', !result3.success ? 'YES' : 'NO');
console.log();

// Test 4: Handle all field types
console.log('Test 4: Handle All Field Types');
console.log('================================');

const fields4: SchemaField[] = [
  { name: 'stringField', type: 'string', description: 'A string' },
  { name: 'numberField', type: 'number', description: 'A number' },
  { name: 'booleanField', type: 'boolean', description: 'A boolean' },
  { name: 'dateField', type: 'date', description: 'A date (ISO string)' },
  { name: 'arrayField', type: 'array', description: 'An array' },
  { name: 'objectField', type: 'object', description: 'An object' },
];

console.log('Testing all field types:');
fields4.forEach(field => console.log(`  - ${field.name}: ${field.type}`));

const schema4 = buildZodSchemaFromFields(fields4);
const data4 = {
  stringField: 'test string',
  numberField: 42,
  booleanField: true,
  dateField: '2025-12-17T10:00:00Z',
  arrayField: ['item1', 'item2', 'item3'],
  objectField: { key1: 'value1', key2: 'value2' },
};

console.log('\nValidating data with all types...');
const result4 = validateExtractedData(schema4, data4);
console.log('Validation result:', result4.success ? 'SUCCESS' : 'FAILED');
console.log('✅ PASS:', result4.success ? 'YES' : 'NO');
console.log();

// Test 5: Common Schemas
console.log('Test 5: Common Schemas');
console.log('=======================');

console.log('\nFlight Search Schema:');
const flightData = {
  price: '$500',
  airline: 'Delta',
  route: 'YVR → LAX',
  departureTime: '10:00 AM',
  arrivalTime: '3:30 PM',
  duration: '5h 30m',
  stops: 'Nonstop',
};

const flightResult = validateExtractedData(commonSchemas.flightSearch, flightData);
console.log('  Valid flight data:', flightResult.success ? 'YES' : 'NO');

console.log('\nProduct Price Schema:');
const productData = {
  price: '$999.99',
  title: 'MacBook Pro',
  availability: 'In Stock',
  rating: '4.8 out of 5 stars',
};

const productResult = validateExtractedData(commonSchemas.productPrice, productData);
console.log('  Valid product data:', productResult.success ? 'YES' : 'NO');

console.log('\nContact Form Schema:');
const contactData = {
  status: 'success',
  confirmationMessage: 'Your message has been sent successfully',
};

const contactResult = validateExtractedData(commonSchemas.contactForm, contactData);
console.log('  Valid contact form data:', contactResult.success ? 'YES' : 'NO');

console.log('\n✅ Test 5 Result:', flightResult.success && productResult.success && contactResult.success ? 'PASS' : 'FAIL');
console.log();

// Test 6: Infer schema from goal
console.log('Test 6: Infer Common Schema from Goal');
console.log('=======================================');

const goals = [
  'Find cheapest flight from %origin% to %destination%',
  'Find price for product %productName% on Amazon',
  'Fill contact form with name %name% and email %email%',
  'Search for hotels in %location%',
  'Do some random task',
];

console.log('Testing schema inference:');
goals.forEach(goal => {
  const inferred = inferCommonSchema(goal);
  console.log(`  "${goal.substring(0, 50)}..."`);
  console.log(`    Inferred: ${inferred ? 'Common schema found' : 'No common schema (null)'}`);
});

const flightInferred = inferCommonSchema(goals[0]) === commonSchemas.flightSearch;
const productInferred = inferCommonSchema(goals[1]) === commonSchemas.productPrice;
const contactInferred = inferCommonSchema(goals[2]) === commonSchemas.contactForm;
const hotelInferred = inferCommonSchema(goals[3]) === commonSchemas.hotelSearch;
const unknownNull = inferCommonSchema(goals[4]) === null;

console.log('\n✅ Test 6 Result:', flightInferred && productInferred && contactInferred && hotelInferred && unknownNull ? 'PASS' : 'FAIL');
console.log();

// Test 7: Empty fields array
console.log('Test 7: Handle Empty Fields Array');
console.log('===================================');

const emptySchema = buildZodSchemaFromFields([]);
const genericData = { result: 'some extracted data' };

console.log('Empty fields array should create generic schema');
const result7 = validateExtractedData(emptySchema, genericData);
console.log('Generic data validated:', result7.success ? 'YES' : 'NO');
console.log('✅ Test 7 Result:', result7.success ? 'PASS' : 'FAIL');
console.log();

console.log('✅ All Zod Schema Builder tests completed!');
console.log('\n📝 Summary:');
console.log('  - Converts field definitions to Zod schemas');
console.log('  - Handles all field types (string, number, boolean, date, array, object)');
console.log('  - Supports optional fields');
console.log('  - Validates data and returns typed results');
console.log('  - Provides common schemas for frequent use cases');
console.log('  - Can infer appropriate schema from goal keywords');
console.log('  - Gracefully handles empty field arrays');
