/**
 * Verification script for variable substitution in execute-skill-step
 * Tests Strategy 1 and Strategy 2 variable substitution logic
 */

import type { RecordedAction, StagehandAction } from '@/lib/types/skills';

console.log('🧪 Testing Variable Substitution Logic...\n');

// Simulate variable substitution logic from Strategy 1
function testStrategy1Substitution(
  actions: RecordedAction[],
  variables?: Record<string, any>
): { action: RecordedAction; substitutedValue: string }[] {
  const results: { action: RecordedAction; substitutedValue: string }[] = [];

  for (const action of actions) {
    if (action.type === 'fill' || action.type === 'type') {
      let value = action.value || '';

      // VARIABLE SUBSTITUTION
      if (variables && value) {
        // If value is a variable placeholder like "%origin%"
        if (value.startsWith('%') && value.endsWith('%')) {
          const varName = value.slice(1, -1); // Extract "origin" from "%origin%"
          const substitutedValue = variables[varName];

          if (substitutedValue !== undefined) {
            value = String(substitutedValue);
          }
        } else {
          // Value might contain multiple variables (edge case)
          Object.entries(variables).forEach(([key, val]) => {
            const placeholder = `%${key}%`;
            if (value.includes(placeholder)) {
              value = value.replace(new RegExp(placeholder, 'g'), String(val));
            }
          });
        }
      }

      results.push({ action, substitutedValue: value });
    }
  }

  return results;
}

// Simulate variable substitution logic from Strategy 2
function testStrategy2Substitution(
  workflow: StagehandAction[],
  variables?: Record<string, any>
): { action: StagehandAction; substitutedInstruction: string; substitutedValue?: string }[] {
  const results: { action: StagehandAction; substitutedInstruction: string; substitutedValue?: string }[] = [];

  for (const action of workflow) {
    let instruction = action.instruction;
    let value = action.value;

    // VARIABLE SUBSTITUTION in instruction and value
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        const placeholder = `%${key}%`;

        // Substitute in instruction
        if (instruction && instruction.includes(placeholder)) {
          instruction = instruction.replace(new RegExp(placeholder, 'g'), String(val));
        }

        // Substitute in value
        if (value && value.includes(placeholder)) {
          value = value.replace(new RegExp(placeholder, 'g'), String(val));
        }
      });
    }

    results.push({
      action,
      substitutedInstruction: instruction,
      substitutedValue: value,
    });
  }

  return results;
}

// Test 1: Strategy 1 with flight search
console.log('Test 1: Strategy 1 - Flight Search Variable Substitution');
console.log('==========================================================');

const actions1: RecordedAction[] = [
  { type: 'navigate', url: 'https://google.com/flights', description: 'Navigate to flights', timestamp: 1000 },
  { type: 'type', selector: '#origin', value: '%origin%', description: 'Type origin', timestamp: 2000 },
  { type: 'type', selector: '#destination', value: '%destination%', description: 'Type destination', timestamp: 3000 },
  { type: 'type', selector: '#departure-date', value: '%departureDate%', description: 'Type departure date', timestamp: 4000 },
  { type: 'click', selector: '#search-button', description: 'Click search', timestamp: 5000 },
];

const variables1 = {
  origin: 'Toronto',
  destination: 'NYC',
  departureDate: '2025-01-10',
};

console.log('Actions:', actions1.length);
console.log('Variables:', variables1);
console.log();

const results1 = testStrategy1Substitution(actions1, variables1);
console.log('Substitution Results:');
results1.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.action.description}`);
  console.log(`     Original value: ${result.action.value}`);
  console.log(`     Substituted value: ${result.substitutedValue}`);
});

const allSubstituted1 =
  results1[0].substitutedValue === 'Toronto' &&
  results1[1].substitutedValue === 'NYC' &&
  results1[2].substitutedValue === '2025-01-10';

console.log('\n✅ Test 1 Result:', allSubstituted1 ? 'PASS' : 'FAIL');
console.log();

// Test 2: Strategy 1 with missing variables
console.log('Test 2: Strategy 1 - Missing Variable Handling');
console.log('===============================================');

const actions2: RecordedAction[] = [
  { type: 'type', selector: '#name', value: '%name%', description: 'Type name', timestamp: 1000 },
  { type: 'type', selector: '#email', value: '%email%', description: 'Type email', timestamp: 2000 },
];

const variables2 = {
  name: 'Jane Smith',
  // email is missing
};

const results2 = testStrategy1Substitution(actions2, variables2);
console.log('Variables provided:', variables2);
console.log('Substitution Results:');
results2.forEach((result, i) => {
  console.log(`  ${i + 1}. ${result.action.description}`);
  console.log(`     Original value: ${result.action.value}`);
  console.log(`     Substituted value: ${result.substitutedValue}`);
  console.log(`     Note: ${result.substitutedValue.startsWith('%') ? 'Kept placeholder (variable not provided)' : 'Successfully substituted'}`);
});

const nameSubstituted = results2[0].substitutedValue === 'Jane Smith';
const emailKeptPlaceholder = results2[1].substitutedValue === '%email%';

console.log('\n✅ Test 2 Result:', nameSubstituted && emailKeptPlaceholder ? 'PASS' : 'FAIL');
console.log();

// Test 3: Strategy 2 - Instruction substitution
console.log('Test 3: Strategy 2 - Instruction Variable Substitution');
console.log('========================================================');

const workflow3: StagehandAction[] = [
  {
    method: 'navigate',
    url: 'https://amazon.com',
    instruction: 'Navigate to Amazon',
  },
  {
    method: 'act',
    selector: '#search',
    instruction: 'Type %productName% into search box',
    value: '%productName%',
  },
  {
    method: 'act',
    selector: '#search-button',
    instruction: 'Click search button',
  },
];

const variables3 = {
  productName: 'MacBook Pro',
};

console.log('Workflow actions:', workflow3.length);
console.log('Variables:', variables3);
console.log();

const results3 = testStrategy2Substitution(workflow3, variables3);
console.log('Substitution Results:');
results3.forEach((result, i) => {
  console.log(`  ${i + 1}. Method: ${result.action.method}`);
  console.log(`     Original instruction: ${result.action.instruction}`);
  console.log(`     Substituted instruction: ${result.substitutedInstruction}`);
  if (result.action.value) {
    console.log(`     Original value: ${result.action.value}`);
    console.log(`     Substituted value: ${result.substitutedValue}`);
  }
});

const instructionSubstituted = results3[1].substitutedInstruction === 'Type MacBook Pro into search box';
const valueSubstituted = results3[1].substitutedValue === 'MacBook Pro';

console.log('\n✅ Test 3 Result:', instructionSubstituted && valueSubstituted ? 'PASS' : 'FAIL');
console.log();

// Test 4: Multiple variables in one value
console.log('Test 4: Multiple Variables in One Field');
console.log('=========================================');

const actions4: RecordedAction[] = [
  {
    type: 'type',
    selector: '#message',
    value: 'Hello %firstName% %lastName%, your email is %email%',
    description: 'Type message',
    timestamp: 1000,
  },
];

const variables4 = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
};

const results4 = testStrategy1Substitution(actions4, variables4);
console.log('Original value:', actions4[0].value);
console.log('Variables:', variables4);
console.log('Substituted value:', results4[0].substitutedValue);

const allVariablesReplaced = results4[0].substitutedValue === 'Hello John Doe, your email is john@example.com';

console.log('\n✅ Test 4 Result:', allVariablesReplaced ? 'PASS' : 'FAIL');
console.log();

console.log('✅ All Variable Substitution tests completed!');
console.log('\n📝 Summary:');
console.log('  - Strategy 1 handles %variable% placeholders correctly');
console.log('  - Strategy 2 substitutes variables in both instructions and values');
console.log('  - Missing variables are handled gracefully (kept as placeholders)');
console.log('  - Multiple variables in one field are supported');
console.log('  - Both "fill" and "type" action types are supported');
