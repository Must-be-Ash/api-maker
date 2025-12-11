/**
 * Tests for Action Grouper
 */

import { groupActions, extractTypedValues, GroupedAction } from './action-grouper';
import type { RecordedAction } from '@/lib/types/skills';

describe('Action Grouper', () => {
  test('groups consecutive keystrokes into single type action', () => {
    // Note: Browser input events give complete field value, not individual chars
    const rawActions: RecordedAction[] = [
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

    const grouped = groupActions(rawActions);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].type).toBe('type');
    expect(grouped[0].value).toBe('Vancouver');
    expect(grouped[0].timestamp).toBe(1000);
    expect(grouped[0].endTimestamp).toBe(1400);
  });

  test('separates typing in different fields', () => {
    const rawActions: RecordedAction[] = [
      { type: 'fill', selector: '#origin', value: 'Y', description: 'Fill origin', timestamp: 1000 },
      { type: 'fill', selector: '#origin', value: 'YV', description: 'Fill origin', timestamp: 1050 },
      { type: 'fill', selector: '#origin', value: 'YVR', description: 'Fill origin', timestamp: 1100 },
      { type: 'fill', selector: '#destination', value: 'L', description: 'Fill destination', timestamp: 2000 },
      { type: 'fill', selector: '#destination', value: 'LA', description: 'Fill destination', timestamp: 2050 },
      { type: 'fill', selector: '#destination', value: 'LAX', description: 'Fill destination', timestamp: 2100 },
    ];

    const grouped = groupActions(rawActions);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].value).toBe('YVR');
    expect(grouped[0].selector).toBe('#origin');
    expect(grouped[1].value).toBe('LAX');
    expect(grouped[1].selector).toBe('#destination');
  });

  test('preserves click actions as standalone', () => {
    const rawActions: RecordedAction[] = [
      { type: 'click', selector: '#search-button', description: 'Click search', timestamp: 1000 },
      { type: 'fill', selector: '#query', value: 't', description: 'Fill query', timestamp: 2000 },
      { type: 'fill', selector: '#query', value: 'te', description: 'Fill query', timestamp: 2050 },
      { type: 'fill', selector: '#query', value: 'tes', description: 'Fill query', timestamp: 2100 },
      { type: 'fill', selector: '#query', value: 'test', description: 'Fill query', timestamp: 2150 },
      { type: 'click', selector: '#submit', description: 'Click submit', timestamp: 3000 },
    ];

    const grouped = groupActions(rawActions);

    expect(grouped).toHaveLength(3);
    expect(grouped[0].type).toBe('click');
    expect(grouped[0].selector).toBe('#search-button');
    expect(grouped[1].type).toBe('type');
    expect(grouped[1].value).toBe('test');
    expect(grouped[2].type).toBe('click');
    expect(grouped[2].selector).toBe('#submit');
  });

  test('preserves navigation actions', () => {
    const rawActions: RecordedAction[] = [
      { type: 'navigate', url: 'https://google.com', description: 'Navigate to Google', timestamp: 1000 },
      { type: 'fill', selector: '#q', value: 'test', description: 'Fill search', timestamp: 2000 },
    ];

    const grouped = groupActions(rawActions);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].type).toBe('navigate');
    expect(grouped[0].url).toBe('https://google.com');
    expect(grouped[1].type).toBe('type');
    expect(grouped[1].value).toBe('test');
  });

  test('extractTypedValues returns all typed values', () => {
    const grouped: GroupedAction[] = [
      { type: 'type', value: 'Vancouver', description: 'Type origin', timestamp: 1000 },
      { type: 'click', selector: '#button', description: 'Click', timestamp: 2000 },
      { type: 'type', value: 'LAX', description: 'Type destination', timestamp: 3000 },
      { type: 'type', value: '2025-12-17', description: 'Type date', timestamp: 4000 },
    ];

    const values = extractTypedValues(grouped);

    expect(values).toEqual(['Vancouver', 'LAX', '2025-12-17']);
  });

  test('handles large time gap as separate actions', () => {
    const rawActions: RecordedAction[] = [
      { type: 'fill', selector: '#field', value: 'a', description: 'Fill', timestamp: 1000 },
      { type: 'fill', selector: '#field', value: 'ab', description: 'Fill', timestamp: 1050 },
      // Large gap (3 seconds)
      { type: 'fill', selector: '#field', value: 'c', description: 'Fill', timestamp: 4100 },
      { type: 'fill', selector: '#field', value: 'cd', description: 'Fill', timestamp: 4150 },
    ];

    const grouped = groupActions(rawActions);

    // Should be 2 separate type actions due to large gap
    expect(grouped).toHaveLength(2);
    expect(grouped[0].value).toBe('ab');
    expect(grouped[1].value).toBe('cd');
  });

  test('handles empty actions array', () => {
    const grouped = groupActions([]);
    expect(grouped).toEqual([]);
  });

  test('handles single action', () => {
    const rawActions: RecordedAction[] = [
      { type: 'click', selector: '#button', description: 'Click', timestamp: 1000 },
    ];

    const grouped = groupActions(rawActions);

    expect(grouped).toHaveLength(1);
    expect(grouped[0].type).toBe('click');
  });
});
