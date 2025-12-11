/**
 * Manual verification script for Schema Generator
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import {
  generateExtractionSchema,
  validateSchemaCompleteness,
  getSchemaFieldNames,
  hasField,
} from '@/lib/extraction/schema-generator';

console.log('🧪 Testing Schema Generator...\n');

async function runTests() {
  // Test 1: Flight search schema
  console.log('Test 1: Generate schema for flight search goal');
  const goal1 = 'Find cheapest round trip flight from %origin% to %destination% departing %departureDate% returning %returnDate%';
  console.log('  Goal:', goal1);
  console.log('  Generating schema...');

  const schema1 = await generateExtractionSchema(goal1);
  console.log('  Generated schema:');
  console.log('    Description:', schema1.description);
  console.log('    Instruction:', schema1.instruction);
  console.log('    Fields:');
  schema1.fields.forEach(field => {
    console.log(`      - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
  });

  const hasPrice1 = hasField(schema1, 'price');
  const hasValidation1 = hasField(schema1, 'route') || (hasField(schema1, 'origin') && hasField(schema1, 'destination'));
  console.log('  Has price field:', hasPrice1);
  console.log('  Has validation field (route or origin+destination):', hasValidation1);
  console.log('  ✅ PASS:', hasPrice1 && hasValidation1 ? 'YES' : 'NO');
  console.log();

  // Test 2: Product search schema
  console.log('Test 2: Generate schema for product search goal');
  const goal2 = 'Find price for product %productName% on Amazon';
  console.log('  Goal:', goal2);
  console.log('  Generating schema...');

  const schema2 = await generateExtractionSchema(goal2);
  console.log('  Generated schema:');
  console.log('    Description:', schema2.description);
  console.log('    Instruction:', schema2.instruction);
  console.log('    Fields:');
  schema2.fields.forEach(field => {
    console.log(`      - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
  });

  const hasPrice2 = hasField(schema2, 'price');
  const hasTitle2 = hasField(schema2, 'title') || hasField(schema2, 'productName');
  console.log('  Has price field:', hasPrice2);
  console.log('  Has title/productName field:', hasTitle2);
  console.log('  ✅ PASS:', hasPrice2 && hasTitle2 ? 'YES' : 'NO');
  console.log();

  // Test 3: Contact form schema
  console.log('Test 3: Generate schema for contact form goal');
  const goal3 = 'Fill contact form with name %name%, email %email%, message %message%';
  console.log('  Goal:', goal3);
  console.log('  Generating schema...');

  const schema3 = await generateExtractionSchema(goal3);
  console.log('  Generated schema:');
  console.log('    Description:', schema3.description);
  console.log('    Instruction:', schema3.instruction);
  console.log('    Fields:');
  schema3.fields.forEach(field => {
    console.log(`      - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
  });

  const hasStatus3 = hasField(schema3, 'status') || hasField(schema3, 'confirmationMessage');
  console.log('  Has status/confirmation field:', hasStatus3);
  console.log('  ✅ PASS:', hasStatus3 ? 'YES' : 'NO');
  console.log();

  // Test 4: Hotel search schema
  console.log('Test 4: Generate schema for hotel search goal');
  const goal4 = 'Search for hotels in %location% from %checkIn% to %checkOut%';
  console.log('  Goal:', goal4);
  console.log('  Generating schema...');

  const schema4 = await generateExtractionSchema(goal4);
  console.log('  Generated schema:');
  console.log('    Description:', schema4.description);
  console.log('    Instruction:', schema4.instruction);
  console.log('    Fields:');
  schema4.fields.forEach(field => {
    console.log(`      - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
  });

  const hasPrice4 = hasField(schema4, 'price') || hasField(schema4, 'pricePerNight') || hasField(schema4, 'totalPrice');
  const hasLocation4 = hasField(schema4, 'location') || hasField(schema4, 'hotelName') || hasField(schema4, 'name');
  console.log('  Has price field (price/pricePerNight/totalPrice):', hasPrice4);
  console.log('  Has location/name field:', hasLocation4);
  console.log('  ✅ PASS:', hasPrice4 && hasLocation4 ? 'YES' : 'NO');
  console.log();

  // Test 5: Validate schema completeness
  console.log('Test 5: Validate schema completeness for flight search');
  const validation1 = validateSchemaCompleteness(schema1, goal1);
  console.log('  Validation result:', validation1);
  console.log('  ✅ PASS:', validation1.valid || validation1.warnings.length === 0 ? 'YES' : 'NO');
  console.log();

  // Test 6: Get field names utility
  console.log('Test 6: Get field names utility');
  const fieldNames1 = getSchemaFieldNames(schema1);
  console.log('  Schema field names:', fieldNames1);
  console.log('  ✅ PASS:', fieldNames1.length > 0 ? 'YES' : 'NO');
  console.log();

  // Test 7: Job search schema
  console.log('Test 7: Generate schema for job search goal');
  const goal7 = 'Find job listings for %jobTitle% in %location%';
  console.log('  Goal:', goal7);
  console.log('  Generating schema...');

  const schema7 = await generateExtractionSchema(goal7);
  console.log('  Generated schema:');
  console.log('    Description:', schema7.description);
  console.log('    Instruction:', schema7.instruction);
  console.log('    Fields:');
  schema7.fields.forEach(field => {
    console.log(`      - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}: ${field.description}`);
  });

  const hasJobTitle7 = hasField(schema7, 'jobTitle') || hasField(schema7, 'title') || hasField(schema7, 'position');
  const hasCompany7 = hasField(schema7, 'company') || hasField(schema7, 'companyName');
  console.log('  Has job title field:', hasJobTitle7);
  console.log('  Has company field:', hasCompany7);
  console.log('  ✅ PASS:', hasJobTitle7 ? 'YES' : 'NO');
  console.log();

  console.log('✅ All Schema Generator tests completed!');
  console.log('\n📝 Summary:');
  console.log('  - Schema Generator uses GPT-4o to infer extraction fields from goal');
  console.log('  - Generates appropriate fields for different use cases (flights, products, forms, etc.)');
  console.log('  - Includes validation fields to verify results match search criteria');
  console.log('  - Provides utility functions for schema inspection and validation');
}

runTests().catch(error => {
  console.error('❌ Error during testing:', error);
  process.exit(1);
});
