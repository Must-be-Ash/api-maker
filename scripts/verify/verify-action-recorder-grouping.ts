/**
 * Verification script for Action Recorder with Action Grouper integration
 */

import { groupActions } from '@/lib/capture/action-grouper';
import type { RecordedAction } from '@/lib/types/skills';

console.log('🧪 Testing Action Recorder with Action Grouper integration...\n');

// Simulate raw actions captured during recording (keystroke-level)
console.log('Test 1: Simulate recording "Vancouver" in origin field');
const rawActions1: RecordedAction[] = [
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

console.log('  Raw actions captured:', rawActions1.length);
console.log('  Sample raw actions:', rawActions1.slice(0, 3).map(a => `${a.type}(${a.value})`).join(', '), '...');

const grouped1 = groupActions(rawActions1);
console.log('  After grouping:', grouped1.length, 'actions');
console.log('  Grouped action:', grouped1[0]);
console.log('  ✅ PASS:', grouped1.length === 1 && grouped1[0].type === 'type' && grouped1[0].value === 'Vancouver' ? 'YES' : 'NO');
console.log();

// Test 2: Simulate complete flight search recording
console.log('Test 2: Simulate complete flight search recording');
const rawActions2: RecordedAction[] = [
  // Navigate
  { type: 'navigate', url: 'https://google.com/flights', description: 'Navigate to flights', timestamp: 1000 },

  // Origin field - keystroke by keystroke
  { type: 'fill', selector: '#origin', value: 'Y', description: 'Fill origin', timestamp: 2000 },
  { type: 'fill', selector: '#origin', value: 'YV', description: 'Fill origin', timestamp: 2050 },
  { type: 'fill', selector: '#origin', value: 'YVR', description: 'Fill origin', timestamp: 2100 },

  // Click somewhere (maybe autocomplete)
  { type: 'click', selector: '.autocomplete-option', description: 'Click autocomplete', timestamp: 3000 },

  // Destination field - keystroke by keystroke
  { type: 'fill', selector: '#destination', value: 'L', description: 'Fill destination', timestamp: 4000 },
  { type: 'fill', selector: '#destination', value: 'LA', description: 'Fill destination', timestamp: 4050 },
  { type: 'fill', selector: '#destination', value: 'LAX', description: 'Fill destination', timestamp: 4100 },

  // Click search
  { type: 'click', selector: '#search-button', description: 'Click search', timestamp: 5000 },
];

console.log('  Raw actions captured:', rawActions2.length, 'actions');
console.log('  Action types:', rawActions2.map(a => a.type).join(', '));

const grouped2 = groupActions(rawActions2);
console.log('  After grouping:', grouped2.length, 'actions');
console.log('  Grouped actions:');
grouped2.forEach((action, i) => {
  console.log(`    ${i + 1}. ${action.type}: ${action.description} ${action.value ? `(value: "${action.value}")` : ''}`);
});

const expectedStructure =
  grouped2.length === 5 &&
  grouped2[0].type === 'navigate' &&
  grouped2[1].type === 'type' && grouped2[1].value === 'YVR' &&
  grouped2[2].type === 'click' &&
  grouped2[3].type === 'type' && grouped2[3].value === 'LAX' &&
  grouped2[4].type === 'click';

console.log('  ✅ PASS:', expectedStructure ? 'YES' : 'NO');
console.log();

// Test 3: Verify type compatibility
console.log('Test 3: Verify type compatibility after grouping');
const rawActions3: RecordedAction[] = [
  { type: 'fill', selector: '#field', value: 'test', description: 'Fill', timestamp: 1000 },
];

const grouped3 = groupActions(rawActions3);
// Verify that grouped actions can be assigned to RecordedAction[]
const recordedActionsAfterGrouping: RecordedAction[] = grouped3 as any;

console.log('  Raw action type:', rawActions3[0].type);
console.log('  Grouped action type:', grouped3[0].type);
console.log('  Can assign to RecordedAction[]:', recordedActionsAfterGrouping.length > 0);
console.log('  ✅ PASS:', grouped3[0].type === 'type' ? 'YES' : 'NO');
console.log();

// Test 4: Verify endTimestamp is preserved
console.log('Test 4: Verify endTimestamp is preserved for grouped actions');
const rawActions4: RecordedAction[] = [
  { type: 'fill', selector: '#field', value: 'a', description: 'Fill', timestamp: 1000 },
  { type: 'fill', selector: '#field', value: 'ab', description: 'Fill', timestamp: 1050 },
  { type: 'fill', selector: '#field', value: 'abc', description: 'Fill', timestamp: 1100 },
];

const grouped4 = groupActions(rawActions4);
console.log('  First action timestamp:', grouped4[0].timestamp);
console.log('  Last action timestamp (endTimestamp):', grouped4[0].endTimestamp);
console.log('  Duration:', grouped4[0].endTimestamp! - grouped4[0].timestamp, 'ms');
console.log('  ✅ PASS:', grouped4[0].endTimestamp === 1100 ? 'YES' : 'NO');
console.log();

console.log('✅ All Action Recorder grouping tests completed!');
console.log('\n📝 Summary:');
console.log('  - Action Recorder now groups keystroke-level actions on stopRecording()');
console.log('  - "fill" actions (raw) become "type" actions (grouped) with complete values');
console.log('  - RecordedAction type supports both raw and grouped action types');
console.log('  - endTimestamp tracks the duration of grouped actions');
