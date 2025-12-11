/**
 * Manual verification script for Action Grouper
 */

import { groupActions, extractTypedValues } from '@/lib/capture/action-grouper';
import type { RecordedAction } from '@/lib/types/skills';

console.log('🧪 Testing Action Grouper...\n');

// Test 1: Group consecutive keystrokes
// Note: Browser input events give complete field value, not individual chars
console.log('Test 1: Group consecutive keystrokes into single action');
const test1: RecordedAction[] = [
  { type: 'fill', selector: '#origin', value: 'V', description: 'Fill origin', timestamp: 1000 },
  { type: 'fill', selector: '#origin', value: 'Va', description: 'Fill origin', timestamp: 1050 },
  { type: 'fill', selector: '#origin', value: 'Van', description: 'Fill origin', timestamp: 1100 },
  { type: 'fill', selector: '#origin', value: 'Vanc', description: 'Fill origin', timestamp: 1150 },
  { type: 'fill', selector: '#origin', value: 'Vanco', description: 'Fill origin', timestamp: 1200 },
  { type: 'fill', selector: '#origin', value: 'Vancou', description: 'Fill origin', timestamp: 1250 },
  { type: 'fill', selector: '#origin', value: 'Vancouv', description: 'Fill origin', timestamp: 1300 },
  { type: 'fill', selector: '#origin', value: 'Vancouve', description: 'Fill origin', timestamp: 1350 },
  { type: 'fill', selector: '#origin', value: 'Vancouver', description: 'Fill origin', timestamp: 1400 },
];

const result1 = groupActions(test1);
console.log('  Input: 9 keystrokes for "Vancouver"');
console.log('  Output:', result1.length, 'actions');
console.log('  Grouped value:', result1[0]?.value);
console.log('  ✅ PASS:', result1.length === 1 && result1[0]?.value === 'Vancouver' ? 'YES' : 'NO');
console.log();

// Test 2: Separate different fields
console.log('Test 2: Separate typing in different fields');
const test2: RecordedAction[] = [
  { type: 'fill', selector: '#origin', value: 'Y', description: 'Fill origin', timestamp: 1000 },
  { type: 'fill', selector: '#origin', value: 'YV', description: 'Fill origin', timestamp: 1050 },
  { type: 'fill', selector: '#origin', value: 'YVR', description: 'Fill origin', timestamp: 1100 },
  { type: 'fill', selector: '#destination', value: 'L', description: 'Fill destination', timestamp: 2000 },
  { type: 'fill', selector: '#destination', value: 'LA', description: 'Fill destination', timestamp: 2050 },
  { type: 'fill', selector: '#destination', value: 'LAX', description: 'Fill destination', timestamp: 2100 },
];

const result2 = groupActions(test2);
console.log('  Input: 3 chars in #origin, 3 chars in #destination');
console.log('  Output:', result2.length, 'actions');
console.log('  Origin value:', result2[0]?.value);
console.log('  Destination value:', result2[1]?.value);
console.log('  ✅ PASS:', result2.length === 2 && result2[0]?.value === 'YVR' && result2[1]?.value === 'LAX' ? 'YES' : 'NO');
console.log();

// Test 3: Preserve click actions
console.log('Test 3: Preserve click actions as standalone');
const test3: RecordedAction[] = [
  { type: 'click', selector: '#button1', description: 'Click 1', timestamp: 1000 },
  { type: 'fill', selector: '#input', value: 'a', description: 'Fill', timestamp: 2000 },
  { type: 'fill', selector: '#input', value: 'ab', description: 'Fill', timestamp: 2050 },
  { type: 'click', selector: '#button2', description: 'Click 2', timestamp: 3000 },
];

const result3 = groupActions(test3);
console.log('  Input: click, type "ab", click');
console.log('  Output:', result3.length, 'actions');
console.log('  Actions:', result3.map(a => `${a.type}(${a.value || a.selector})`).join(', '));
const pass3 = result3.length === 3 &&
              result3[0]?.type === 'click' &&
              result3[1]?.type === 'type' &&
              result3[1]?.value === 'ab' &&
              result3[2]?.type === 'click';
console.log('  ✅ PASS:', pass3 ? 'YES' : 'NO');
console.log();

// Test 4: Extract typed values utility
console.log('Test 4: Extract typed values utility');
const result4 = extractTypedValues(result2);
console.log('  Extracted values:', result4);
console.log('  ✅ PASS:', result4.length === 2 && result4.includes('YVR') && result4.includes('LAX') ? 'YES' : 'NO');
console.log();

console.log('✅ All tests completed!');
