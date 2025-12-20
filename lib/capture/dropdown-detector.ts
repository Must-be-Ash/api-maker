/**
 * Dropdown Type Detector
 *
 * Detects the type of dropdown element for proper handling during skill execution
 *
 * Types:
 * - 'select': Traditional HTML <select> elements
 * - 'autocomplete': Input fields with autocomplete/suggestion dropdowns
 * - 'custom': Custom dropdown widgets (non-<select> dropdowns)
 * - 'datepicker': Date picker calendar widgets
 */

export type DropdownType = 'select' | 'autocomplete' | 'custom' | 'datepicker';

export interface DropdownDetectionResult {
  dropdownType: DropdownType | null;
  isInIframe: boolean;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Detect dropdown type from element and selector information
 *
 * @param element - The DOM element or element info
 * @param selector - The CSS/XPath selector for the element
 * @param semanticType - Optional semantic type from action recording
 * @returns Detection result with dropdown type and iframe status
 */
export function detectDropdownType(
  element: any,
  selector: string,
  semanticType?: string
): DropdownDetectionResult {
  let dropdownType: DropdownType | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Detect if selector contains iframe
  const isInIframe = selector.includes('>>') || selector.includes('//iframe') || selector.includes('iframe');

  // Priority 1: Check semantic type from recording (highest confidence)
  if (semanticType) {
    if (semanticType === 'autocomplete') {
      dropdownType = 'autocomplete';
      confidence = 'high';
    } else if (semanticType === 'date-picker' || semanticType === 'datepicker') {
      dropdownType = 'datepicker';
      confidence = 'high';
    } else if (semanticType === 'select') {
      dropdownType = 'select';
      confidence = 'high';
    }

    if (dropdownType) {
      return { dropdownType, isInIframe, confidence };
    }
  }

  // Priority 2: Check element tag name
  if (element) {
    const tagName = element.tagName?.toUpperCase();

    if (tagName === 'SELECT') {
      return {
        dropdownType: 'select',
        isInIframe,
        confidence: 'high'
      };
    }

    if (tagName === 'INPUT') {
      const type = element.type?.toLowerCase();
      const role = element.role?.toLowerCase();
      const ariaAutocomplete = element.getAttribute?.('aria-autocomplete');
      const ariaHaspopup = element.getAttribute?.('aria-haspopup');

      // Date picker detection
      if (type === 'date' || type === 'datetime-local' || type === 'month' || type === 'week') {
        return {
          dropdownType: 'datepicker',
          isInIframe,
          confidence: 'high'
        };
      }

      // Autocomplete detection
      if (
        ariaAutocomplete === 'list' ||
        ariaAutocomplete === 'both' ||
        role === 'combobox' ||
        ariaHaspopup === 'listbox'
      ) {
        return {
          dropdownType: 'autocomplete',
          isInIframe,
          confidence: 'high'
        };
      }

      // Generic text input might be autocomplete (lower confidence)
      if (type === 'text' || type === 'search') {
        confidence = 'medium';
        // Don't auto-assign, let other checks determine
      }
    }

    // Check ARIA roles for custom dropdowns
    const role = element.role?.toLowerCase() || element.getAttribute?.('role')?.toLowerCase();
    const ariaHaspopup = element.getAttribute?.('aria-haspopup');

    if (role === 'listbox' || role === 'menu' || ariaHaspopup === 'menu' || ariaHaspopup === 'listbox') {
      return {
        dropdownType: 'custom',
        isInIframe,
        confidence: 'high'
      };
    }

    // Check for date picker indicators in class names
    const className = element.className || element.getAttribute?.('class') || '';
    const classNameStr = typeof className === 'string' ? className : className.toString();

    if (
      classNameStr.includes('date-picker') ||
      classNameStr.includes('datepicker') ||
      classNameStr.includes('calendar') ||
      classNameStr.includes('date-input')
    ) {
      return {
        dropdownType: 'datepicker',
        isInIframe,
        confidence: 'medium'
      };
    }

    // Check for autocomplete indicators in class names
    if (
      classNameStr.includes('autocomplete') ||
      classNameStr.includes('auto-complete') ||
      classNameStr.includes('typeahead') ||
      classNameStr.includes('suggestions')
    ) {
      return {
        dropdownType: 'autocomplete',
        isInIframe,
        confidence: 'medium'
      };
    }

    // Check for custom dropdown indicators
    if (
      classNameStr.includes('dropdown') ||
      classNameStr.includes('select') ||
      classNameStr.includes('picker')
    ) {
      return {
        dropdownType: 'custom',
        isInIframe,
        confidence: 'low'
      };
    }
  }

  // Priority 3: Check selector patterns if element not available
  if (!element && selector) {
    // Check for select in selector
    if (selector.includes('select[') || selector.includes('select#') || selector.includes('select.') || /^select$/i.test(selector)) {
      return {
        dropdownType: 'select',
        isInIframe,
        confidence: 'medium'
      };
    }

    // Check for date picker patterns
    if (
      /date[-_]?picker/i.test(selector) ||
      /calendar/i.test(selector) ||
      /input\[type=["']?date/i.test(selector)
    ) {
      return {
        dropdownType: 'datepicker',
        isInIframe,
        confidence: 'medium'
      };
    }

    // Check for autocomplete patterns
    if (
      /autocomplete/i.test(selector) ||
      /typeahead/i.test(selector) ||
      /suggestions?/i.test(selector)
    ) {
      return {
        dropdownType: 'autocomplete',
        isInIframe,
        confidence: 'medium'
      };
    }

    // Check for dropdown/combobox patterns
    if (
      /dropdown/i.test(selector) ||
      /combobox/i.test(selector) ||
      /\[role=["']?listbox/i.test(selector)
    ) {
      return {
        dropdownType: 'custom',
        isInIframe,
        confidence: 'low'
      };
    }
  }

  // No dropdown detected
  return {
    dropdownType: null,
    isInIframe,
    confidence: 'low'
  };
}

/**
 * Simplified detection for execution phase when element might not be available
 *
 * @param selector - The CSS/XPath selector
 * @param semanticType - Semantic type from recording
 * @returns Dropdown type or null
 */
export function detectDropdownTypeFromMetadata(
  selector: string,
  semanticType?: string
): DropdownType | null {
  const result = detectDropdownType(null, selector, semanticType);
  return result.dropdownType;
}
