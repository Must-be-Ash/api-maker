/**
 * Manual verification script for Variable Detector
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import {
  detectVariables,
  extractVariablesFromGoal,
  validateMapping,
  getVariableName,
} from '@/lib/capture/variable-detector';

console.log('🧪 Testing Variable Detector...\n');

// Test 1: Extract variables from goal
console.log('Test 1: Extract variables from goal');
const goal1 = 'Search for flights from %origin% to %destination% on %departureDate%';
const variables1 = extractVariablesFromGoal(goal1);
console.log('  Goal:', goal1);
console.log('  Extracted variables:', variables1);
console.log('  ✅ PASS:', variables1.length === 3 && variables1.includes('origin') && variables1.includes('destination') && variables1.includes('departureDate') ? 'YES' : 'NO');
console.log();

// Test 2: Map flight search values
console.log('Test 2: Map flight search typed values to variables');
const goal2 = 'Search for flights from %origin% to %destination%';
const typedValues2 = ['Vancouver', 'LAX'];
console.log('  Goal:', goal2);
console.log('  Typed values:', typedValues2);
console.log('  Calling LLM to detect variables...');

detectVariables(goal2, typedValues2).then(mapping2 => {
  console.log('  Mapping result:', mapping2);
  console.log('  ✅ PASS:', mapping2['Vancouver'] === '%origin%' && mapping2['LAX'] === '%destination%' ? 'YES' : 'NO');
  console.log();

  // Test 3: Map product search values
  console.log('Test 3: Map product search typed values to variables');
  const goal3 = 'Find product %productName% with max price %maxPrice%';
  const typedValues3 = ['iPhone 15 Pro', '1000'];
  console.log('  Goal:', goal3);
  console.log('  Typed values:', typedValues3);
  console.log('  Calling LLM to detect variables...');

  return detectVariables(goal3, typedValues3).then(mapping3 => {
    console.log('  Mapping result:', mapping3);
    console.log('  ✅ PASS:', mapping3['iPhone 15 Pro'] === '%productName%' && mapping3['1000'] === '%maxPrice%' ? 'YES' : 'NO');
    console.log();

    // Test 4: Map hotel booking values
    console.log('Test 4: Map hotel booking typed values to variables');
    const goal4 = 'Book hotel in %location% from %checkIn% to %checkOut%';
    const typedValues4 = ['New York', '2025-12-20', '2025-12-25'];
    console.log('  Goal:', goal4);
    console.log('  Typed values:', typedValues4);
    console.log('  Calling LLM to detect variables...');

    return detectVariables(goal4, typedValues4).then(mapping4 => {
      console.log('  Mapping result:', mapping4);
      console.log('  ✅ PASS:', mapping4['New York'] === '%location%' && mapping4['2025-12-20'] === '%checkIn%' && mapping4['2025-12-25'] === '%checkOut%' ? 'YES' : 'NO');
      console.log();

      // Test 5: Validate complete mapping
      console.log('Test 5: Validate complete mapping');
      const goal5 = 'Search from %origin% to %destination%';
      const mapping5 = {
        'Vancouver': '%origin%',
        'LAX': '%destination%',
      };
      const validation5 = validateMapping(goal5, mapping5);
      console.log('  Goal:', goal5);
      console.log('  Mapping:', mapping5);
      console.log('  Validation result:', validation5);
      console.log('  ✅ PASS:', validation5.valid === true && validation5.unmappedVariables.length === 0 ? 'YES' : 'NO');
      console.log();

      // Test 6: Validate incomplete mapping
      console.log('Test 6: Validate incomplete mapping (should fail)');
      const goal6 = 'Search from %origin% to %destination% on %date%';
      const mapping6 = {
        'Vancouver': '%origin%',
        'LAX': '%destination%',
        // Missing %date%
      };
      const validation6 = validateMapping(goal6, mapping6);
      console.log('  Goal:', goal6);
      console.log('  Mapping:', mapping6);
      console.log('  Validation result:', validation6);
      console.log('  ✅ PASS:', validation6.valid === false && validation6.unmappedVariables.includes('date') ? 'YES' : 'NO');
      console.log();

      // Test 7: Get variable name from mapping
      console.log('Test 7: Get variable name from mapping');
      const mapping7 = {
        'Vancouver': '%origin%',
        'LAX': '%destination%',
      };
      const varName1 = getVariableName(mapping7, 'Vancouver');
      const varName2 = getVariableName(mapping7, 'LAX');
      const varName3 = getVariableName(mapping7, 'Unknown');
      console.log('  Mapping:', mapping7);
      console.log('  getVariableName("Vancouver"):', varName1);
      console.log('  getVariableName("LAX"):', varName2);
      console.log('  getVariableName("Unknown"):', varName3);
      console.log('  ✅ PASS:', varName1 === 'origin' && varName2 === 'destination' && varName3 === null ? 'YES' : 'NO');
      console.log();

      // Test 8: Handle empty typed values
      console.log('Test 8: Handle empty typed values');
      const goal8 = 'Search for flights from %origin% to %destination%';
      const typedValues8: string[] = [];
      console.log('  Goal:', goal8);
      console.log('  Typed values:', typedValues8);

      return detectVariables(goal8, typedValues8).then(mapping8 => {
        console.log('  Mapping result:', mapping8);
        console.log('  ✅ PASS:', Object.keys(mapping8).length === 0 ? 'YES' : 'NO');
        console.log();

        // Test 9: Handle goal with no variables
        console.log('Test 9: Handle goal with no variables');
        const goal9 = 'Click the search button';
        const typedValues9 = ['Vancouver', 'LAX'];
        console.log('  Goal:', goal9);
        console.log('  Typed values:', typedValues9);

        return detectVariables(goal9, typedValues9).then(mapping9 => {
          console.log('  Mapping result:', mapping9);
          console.log('  ✅ PASS:', Object.keys(mapping9).length === 0 ? 'YES' : 'NO');
          console.log();

          console.log('✅ All tests completed!');
        });
      });
    });
  });
}).catch(error => {
  console.error('❌ Error during testing:', error);
  process.exit(1);
});
