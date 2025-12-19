/**
 * Action Grouper
 *
 * Groups low-level recorded actions (keystrokes, clicks) into semantic high-level actions.
 *
 * Example:
 *   Input:  [{ type: 'fill', value: 'V' }, { type: 'fill', value: 'a' }, { type: 'fill', value: 'n' }]
 *   Output: [{ type: 'type', value: 'Vancouver', description: 'Type Vancouver into field' }]
 */

import type { RecordedAction, InteractionType } from '../types/skills';

export interface GroupedAction {
  type: 'type' | 'click' | 'select' | 'navigate' | 'submit' | 'scroll';
  selector?: string;
  description: string;
  value?: string;
  url?: string;
  timestamp: number; // Timestamp of first action in group
  endTimestamp?: number; // Timestamp of last action in group

  // Autocomplete properties (when type action triggers dropdown)
  isAutocomplete?: boolean;
  autocompleteClickedText?: string; // The text that was clicked in dropdown (for reference only, NOT for playback)

  // Semantic value capture properties
  semanticValue?: string | number | boolean | null;
  semanticType?: InteractionType;
  semanticLabel?: string | null;

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
const AUTOCOMPLETE_CLICK_WINDOW_MS = 3000; // 3s window after typing for dropdown click detection
const DATE_PICKER_WINDOW_MS = 5000; // 5s window for date picker interactions (user might browse months)

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

    // Handle click actions - CHECK FOR DATE PICKER PATTERN FIRST
    if (action.type === 'click') {
      // 📅 DATE PICKER DETECTION: Look ahead for date picker interaction
      const datePickerResult = detectDatePickerPattern(rawActions, i);
      if (datePickerResult) {
        console.log('[action-grouper] 📅 Date picker pattern detected:', {
          triggerClick: action.description,
          selectedDate: datePickerResult.dateValue,
          label: datePickerResult.label,
          clicksSkipped: datePickerResult.endIndex - i
        });

        // Create semantic date picker action
        grouped.push({
          type: 'click',
          selector: datePickerResult.finalSelector,
          description: `Select ${datePickerResult.label || 'date'}`,
          timestamp: action.timestamp,
          endTimestamp: datePickerResult.endTimestamp,
          // Set semantic metadata
          semanticType: 'date-picker',
          semanticValue: datePickerResult.dateValue,
          semanticLabel: datePickerResult.label,
        });

        // Skip all intermediate clicks (calendar navigation, day selection, etc.)
        const skippedCount = datePickerResult.endIndex - i - 1; // Exclude the starting click
        i = datePickerResult.endIndex;
        console.log('[action-grouper] ⏭️  Skipped', skippedCount, 'intermediate clicks (excluding start click)');
        continue;
      }

      // Normal click (not part of date picker pattern)
      grouped.push({
        type: 'click',
        selector: action.selector,
        description: action.description || `Click ${action.selector}`,
        timestamp: action.timestamp,
      });
      i++;
      continue;
    }

    // Handle fill/type actions (may need grouping + autocomplete detection)
    if (action.type === 'fill') {
      const fillGroup = groupFillActions(rawActions, i);

      // 🔍 AUTOCOMPLETE DETECTION: Check if next action is a click WITH autocomplete semantic type
      const nextAction = rawActions[fillGroup.nextIndex];
      if (nextAction && nextAction.type === 'click') {
        const timeSinceTyping = nextAction.timestamp - fillGroup.action.timestamp;

        // ✅ FIX: Check if click has autocomplete semantic type (from browser detection)
        const isAutocompleteClick = nextAction.semanticType === 'autocomplete';

        // ✅ STRICT: ONLY detect autocomplete if semantic type AND value are present
        // Time-window alone causes FALSE POSITIVES (e.g., clicking field to continue typing)
        if (isAutocompleteClick && nextAction.semanticValue) {
          console.log('[action-grouper] 🔍 Autocomplete pattern detected:', {
            typedValue: fillGroup.action.value,
            clickedText: nextAction.description,
            clickSemanticType: nextAction.semanticType,
            clickSemanticValue: nextAction.semanticValue,
            timeGap: `${timeSinceTyping}ms`,
            detectionMethod: 'semantic-type' // Always semantic-type now (no time-window fallback)
          });

          // Create autocomplete action with semantic metadata (bypasses legacy handling)
          const autocompleteAction: GroupedAction = {
            ...fillGroup.action,
            // ✅ Use semantic type from click if available, otherwise assume autocomplete
            semanticType: (nextAction.semanticType as InteractionType) || 'autocomplete',
            semanticValue: nextAction.semanticValue || fillGroup.action.value, // Use click's value if available
            semanticLabel: nextAction.semanticLabel || 'location',
            // Keep metadata for debugging
            isAutocomplete: true,
            autocompleteClickedText: nextAction.description,
          };

          // Push the autocomplete action
          grouped.push(autocompleteAction);

          // ✅ CRITICAL: Skip the hardcoded click action - it will be handled dynamically during playback
          i = fillGroup.nextIndex + 1; // Skip both fill group AND the click
          console.log('[action-grouper] ⏭️  Skipped hardcoded dropdown click:', nextAction.description);
          console.log('[action-grouper] ✅ Created autocomplete action with semanticType:', autocompleteAction.semanticType);
          continue;
        }
      }

      // Not autocomplete - normal type action
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
      // ✅ FIX: Preserve semantic metadata from first action (date-picker, number-input, etc.)
      semanticValue: firstAction.semanticValue,
      semanticType: firstAction.semanticType,
      semanticLabel: firstAction.semanticLabel,
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

/**
 * Detects date picker interaction pattern
 *
 * Pattern: Click calendar icon → (optional: navigate months) → Click date cell with semantic value
 *
 * @returns Date picker info if pattern detected, null otherwise
 */
function detectDatePickerPattern(
  actions: RecordedAction[],
  startIndex: number
): { dateValue: string; label: string; finalSelector: string; endTimestamp: number; endIndex: number } | null {
  const startAction = actions[startIndex];
  const startTime = startAction.timestamp;

  // Look ahead for clicks within the date picker window
  let datePickerAction: RecordedAction | null = null;
  let endIndex = startIndex;

  for (let j = startIndex + 1; j < actions.length; j++) {
    const action = actions[j];

    // Stop if we've gone past the date picker window
    if (action.timestamp - startTime > DATE_PICKER_WINDOW_MS) {
      break;
    }

    // Only consider click actions
    if (action.type !== 'click') {
      continue;
    }

    // Check if this click has date picker semantic value
    if (action.semanticType === 'date-picker' && action.semanticValue) {
      datePickerAction = action;
      endIndex = j + 1; // Include this action, then skip
      break;
    }
  }

  // If we found a date picker action, return the pattern
  if (datePickerAction) {
    return {
      dateValue: String(datePickerAction.semanticValue),
      label: datePickerAction.semanticLabel || 'date',
      finalSelector: datePickerAction.selector || startAction.selector || '',
      endTimestamp: datePickerAction.timestamp,
      endIndex: endIndex,
    };
  }

  // Check if the FIRST click itself is a date picker (user clicked directly on date input)
  if (startAction.semanticType === 'date-picker' && startAction.semanticValue) {
    return {
      dateValue: String(startAction.semanticValue),
      label: startAction.semanticLabel || 'date',
      finalSelector: startAction.selector || '',
      endTimestamp: startAction.timestamp,
      endIndex: startIndex + 1,
    };
  }

  return null;
}
