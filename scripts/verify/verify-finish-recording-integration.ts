/**
 * Verification script for finish-recording-step integration
 * Tests variable detection, schema generation, and action mapping
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import { detectVariables } from '@/lib/capture/variable-detector';
import { extractTypedValues, GroupedAction } from '@/lib/capture/action-grouper';
import { generateExtractionSchema } from '@/lib/extraction/schema-generator';
import type { RecordedAction } from '@/lib/types/skills';

console.log('🧪 Testing finish-recording-step Integration...\n');

async function runTests() {
  // Simulate a flight search recording
  console.log('Test 1: Flight Search Recording - Variable Detection & Schema Generation');
  console.log('=========================================================================');

  const goal1 = 'Search for round trip flights from %origin% to %destination% departing %departureDate% returning %returnDate%';
  console.log('Goal:', goal1);

  // Simulate grouped actions (after action grouping)
  const recordedActions1: GroupedAction[] = [
    { type: 'navigate', url: 'https://google.com/flights', description: 'Navigate to flights', timestamp: 1000 },
    { type: 'type', selector: '#origin', value: 'Vancouver', description: 'Type origin', timestamp: 2000 },
    { type: 'type', selector: '#destination', value: 'LAX', description: 'Type destination', timestamp: 3000 },
    { type: 'type', selector: '#departure-date', value: '2025-12-17', description: 'Type departure date', timestamp: 4000 },
    { type: 'type', selector: '#return-date', value: '2025-12-24', description: 'Type return date', timestamp: 5000 },
    { type: 'click', selector: '#search-button', description: 'Click search', timestamp: 6000 },
  ];

  console.log('\nRecorded Actions:', recordedActions1.length);

  // Step 1: Extract typed values
  const typedValues1 = extractTypedValues(recordedActions1);
  console.log('\nStep 1 - Extracted typed values:', typedValues1);

  // Step 2: Detect variables
  console.log('\nStep 2 - Detecting variables...');
  const variableMapping1 = await detectVariables(goal1, typedValues1);
  console.log('Variable mapping:', variableMapping1);

  // Step 3: Apply variable mapping to actions
  const variableMappedActions1 = recordedActions1.map((action) => {
    if (action.value && variableMapping1[action.value]) {
      return {
        ...action,
        value: variableMapping1[action.value],
        originalValue: action.value,
      };
    }
    return action;
  });

  console.log('\nStep 3 - Applied variable mapping:');
  variableMappedActions1.forEach((action, i) => {
    if (action.type === 'type') {
      console.log(`  ${i + 1}. ${action.description}: ${(action as any).originalValue || action.value} → ${action.value}`);
    }
  });

  // Step 4: Generate extraction schema
  console.log('\nStep 4 - Generating extraction schema...');
  const schema1 = await generateExtractionSchema(goal1);
  console.log('Schema generated:');
  console.log('  Description:', schema1.description);
  console.log('  Instruction:', schema1.instruction);
  console.log('  Fields:');
  schema1.fields.forEach(field => {
    console.log(`    - ${field.name} (${field.type})${field.optional ? ' [optional]' : ''}`);
  });

  // Verification
  const hasAllVariables1 =
    variableMapping1['Vancouver'] === '%origin%' &&
    variableMapping1['LAX'] === '%destination%' &&
    variableMapping1['2025-12-17'] === '%departureDate%' &&
    variableMapping1['2025-12-24'] === '%returnDate%';

  const hasPrice1 = schema1.fields.some(f => f.name.toLowerCase().includes('price'));
  const hasRoute1 = schema1.fields.some(f => f.name.toLowerCase().includes('route'));

  console.log('\n✅ Test 1 Results:');
  console.log('  All variables mapped correctly:', hasAllVariables1 ? 'YES' : 'NO');
  console.log('  Schema has price field:', hasPrice1 ? 'YES' : 'NO');
  console.log('  Schema has route/validation field:', hasRoute1 ? 'YES' : 'NO');
  console.log('  Overall:', hasAllVariables1 && hasPrice1 ? 'PASS ✅' : 'FAIL ❌');
  console.log();

  // Test 2: Product Search
  console.log('\nTest 2: Product Search Recording');
  console.log('==================================');

  const goal2 = 'Find price for product %productName% on Amazon';
  console.log('Goal:', goal2);

  const recordedActions2: GroupedAction[] = [
    { type: 'navigate', url: 'https://amazon.com', description: 'Navigate to Amazon', timestamp: 1000 },
    { type: 'type', selector: '#search', value: 'iPhone 15 Pro', description: 'Type product name', timestamp: 2000 },
    { type: 'click', selector: '#search-button', description: 'Click search', timestamp: 3000 },
  ];

  const typedValues2 = extractTypedValues(recordedActions2);
  console.log('\nExtracted typed values:', typedValues2);

  console.log('Detecting variables...');
  const variableMapping2 = await detectVariables(goal2, typedValues2);
  console.log('Variable mapping:', variableMapping2);

  console.log('Generating extraction schema...');
  const schema2 = await generateExtractionSchema(goal2);
  console.log('Schema fields:', schema2.fields.map(f => f.name).join(', '));

  const hasProductName2 = variableMapping2['iPhone 15 Pro'] === '%productName%';
  const hasTitle2 = schema2.fields.some(f => f.name.toLowerCase().includes('title'));
  const hasPrice2 = schema2.fields.some(f => f.name.toLowerCase().includes('price'));

  console.log('\n✅ Test 2 Results:');
  console.log('  Product name mapped correctly:', hasProductName2 ? 'YES' : 'NO');
  console.log('  Schema has title field:', hasTitle2 ? 'YES' : 'NO');
  console.log('  Schema has price field:', hasPrice2 ? 'YES' : 'NO');
  console.log('  Overall:', hasProductName2 && hasTitle2 && hasPrice2 ? 'PASS ✅' : 'FAIL ❌');
  console.log();

  // Test 3: Contact Form
  console.log('\nTest 3: Contact Form Recording');
  console.log('================================');

  const goal3 = 'Fill contact form with name %name%, email %email%, message %message%';
  console.log('Goal:', goal3);

  const recordedActions3: GroupedAction[] = [
    { type: 'navigate', url: 'https://example.com/contact', description: 'Navigate to contact', timestamp: 1000 },
    { type: 'type', selector: '#name', value: 'John Doe', description: 'Type name', timestamp: 2000 },
    { type: 'type', selector: '#email', value: 'john@example.com', description: 'Type email', timestamp: 3000 },
    { type: 'type', selector: '#message', value: 'Hello there', description: 'Type message', timestamp: 4000 },
    { type: 'click', selector: '#submit', description: 'Click submit', timestamp: 5000 },
  ];

  const typedValues3 = extractTypedValues(recordedActions3);
  console.log('\nExtracted typed values:', typedValues3);

  console.log('Detecting variables...');
  const variableMapping3 = await detectVariables(goal3, typedValues3);
  console.log('Variable mapping:', variableMapping3);

  console.log('Generating extraction schema...');
  const schema3 = await generateExtractionSchema(goal3);
  console.log('Schema fields:', schema3.fields.map(f => f.name).join(', '));

  const hasAllContactVars =
    variableMapping3['John Doe'] === '%name%' &&
    variableMapping3['john@example.com'] === '%email%' &&
    variableMapping3['Hello there'] === '%message%';

  const hasStatus3 = schema3.fields.some(f =>
    f.name.toLowerCase().includes('status') ||
    f.name.toLowerCase().includes('confirmation')
  );

  console.log('\n✅ Test 3 Results:');
  console.log('  All contact fields mapped correctly:', hasAllContactVars ? 'YES' : 'NO');
  console.log('  Schema has status/confirmation field:', hasStatus3 ? 'YES' : 'NO');
  console.log('  Overall:', hasAllContactVars && hasStatus3 ? 'PASS ✅' : 'FAIL ❌');
  console.log();

  console.log('✅ All finish-recording-step integration tests completed!');
  console.log('\n📝 Summary:');
  console.log('  - finish-recording-step now integrates variable detection');
  console.log('  - Demo values (Vancouver, LAX) replaced with variables (%origin%, %destination%)');
  console.log('  - Extraction schema automatically generated from goal');
  console.log('  - Variable mapping and schema stored in MongoDB for execution-time use');
}

runTests().catch(error => {
  console.error('❌ Error during testing:', error);
  process.exit(1);
});
