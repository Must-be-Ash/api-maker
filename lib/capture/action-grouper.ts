/**
 * Action Grouper
 *
 * Groups low-level recorded actions (keystrokes, clicks) into semantic high-level actions.
 *
 * Example:
 *   Input:  [{ type: 'fill', value: 'V' }, { type: 'fill', value: 'a' }, { type: 'fill', value: 'n' }]
 *   Output: [{ type: 'type', value: 'Vancouver', description: 'Type Vancouver into field' }]
 */

import type { RecordedAction } from '../types/skills';

export interface GroupedAction {
  type: 'type' | 'click' | 'select' | 'navigate' | 'submit' | 'scroll';
  selector?: string;
  description: string;
  value?: string;
  url?: string;
  timestamp: number; // Timestamp of first action in group
  endTimestamp?: number; // Timestamp of last action in group

  // Scroll-specific properties
  scrollPosition?: {
    x: number;
    y: number;
  };
  scrollTarget?: 'window' | 'element';
  scrollPercent?: number;
}

const TYPING_DEBOUNCE_MS = 500; // 500ms pause indicates typing completion
const MAX_TYPING_GAP_MS = 2000; // 2s gap = definitely separate actions

/**
 * Groups consecutive keystrokes in the same field into a single "type" action
 */
export function groupActions(rawActions: RecordedAction[]): GroupedAction[] {
  if (!rawActions || rawActions.length === 0) {
    return [];
  }

  const grouped: GroupedAction[] = [];
  let i = 0;

  while (i < rawActions.length) {
    const action = rawActions[i];

    // Handle navigation actions (always standalone)
    if (action.type === 'navigate') {
      grouped.push({
        type: 'navigate',
        url: action.url!,
        description: `Navigate to ${action.url}`,
        timestamp: action.timestamp,
      });
      i++;
      continue;
    }

    // Handle submit actions (always standalone)
    if (action.type === 'submit') {
      grouped.push({
        type: 'submit',
        selector: action.selector,
        description: action.description || 'Submit form',
        timestamp: action.timestamp,
      });
      i++;
      continue;
    }

    // Handle click actions (always standalone)
    if (action.type === 'click') {
      grouped.push({
        type: 'click',
        selector: action.selector,
        description: action.description || `Click ${action.selector}`,
        timestamp: action.timestamp,
      });
      i++;
      continue;
    }

    // Handle fill/type actions (may need grouping)
    if (action.type === 'fill') {
      const fillGroup = groupFillActions(rawActions, i);
      grouped.push(fillGroup.action);
      i = fillGroup.nextIndex;
      continue;
    }

    // Handle scroll actions (always standalone, preserve scroll-specific properties)
    if (action.type === 'scroll') {
      grouped.push({
        type: 'scroll',
        description: action.description || `Scroll to ${action.scrollPercent}%`,
        timestamp: action.timestamp,
        scrollPosition: action.scrollPosition,
        scrollTarget: action.scrollTarget,
        scrollPercent: action.scrollPercent,
      });
      i++;
      continue;
    }

    // Fallback: treat as standalone action
    grouped.push({
      type: action.type as any,
      selector: action.selector,
      description: action.description || 'Perform action',
      value: action.value,
      timestamp: action.timestamp,
    });
    i++;
  }

  return grouped;
}

/**
 * Groups consecutive fill actions in the same field into a single type action
 *
 * Note: Browser input events provide the COMPLETE field value each time,
 * not individual characters. So we take the FINAL value, not concatenate.
 */
function groupFillActions(
  actions: RecordedAction[],
  startIndex: number
): { action: GroupedAction; nextIndex: number } {
  const firstAction = actions[startIndex];
  const selector = firstAction.selector;
  let finalValue = firstAction.value || '';
  let lastTimestamp = firstAction.timestamp;
  let i = startIndex + 1;

  // Look ahead for more fill actions in the same field
  while (i < actions.length) {
    const nextAction = actions[i];

    // Stop if different selector
    if (nextAction.selector !== selector) {
      break;
    }

    // Stop if not a fill action
    if (nextAction.type !== 'fill') {
      break;
    }

    // Stop if gap is too large (user paused, likely different action)
    const gap = nextAction.timestamp - lastTimestamp;
    if (gap > MAX_TYPING_GAP_MS) {
      break;
    }

    // Update to the latest value (browser gives us complete field value)
    finalValue = nextAction.value || finalValue;
    lastTimestamp = nextAction.timestamp;
    i++;
  }

  // Check if we actually grouped anything
  const wasGrouped = i > startIndex + 1;

  return {
    action: {
      type: 'type',
      selector: selector,
      description: firstAction.description || `Type "${finalValue}" into ${selector}`,
      value: finalValue,
      timestamp: firstAction.timestamp,
      endTimestamp: wasGrouped ? lastTimestamp : undefined,
    },
    nextIndex: i,
  };
}

/**
 * Detects if typing has completed based on time gap
 */
export function hasTypingCompleted(
  lastKeystrokeTime: number,
  currentTime: number
): boolean {
  return currentTime - lastKeystrokeTime >= TYPING_DEBOUNCE_MS;
}

/**
 * Extracts all typed values from grouped actions
 * Useful for variable detection
 */
export function extractTypedValues(actions: GroupedAction[]): string[] {
  return actions
    .filter(action => action.type === 'type' && action.value)
    .map(action => action.value!)
    .filter(value => value.length > 0);
}

/**
 * Gets field descriptions from grouped actions
 * Useful for understanding what each field represents
 */
export function getFieldDescriptions(actions: GroupedAction[]): Map<string, string> {
  const fieldMap = new Map<string, string>();

  actions.forEach(action => {
    if (action.selector && action.description) {
      fieldMap.set(action.selector, action.description);
    }
  });

  return fieldMap;
}
