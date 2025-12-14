import { RecordedAction } from '../types/skills';
import { connectDB } from '../mongodb';
import { groupActions } from './action-grouper';

/**
 * ActionRecorder captures user actions in a browser session
 * Uses page instrumentation to track clicks, inputs, and navigation
 *
 * Note: Raw actions are captured at keystroke-level during recording,
 * then grouped into semantic actions when recording stops.
 */
export class ActionRecorder {
  private actions: RecordedAction[] = [];
  private page: any; // Use any to support both Playwright and Stagehand Page types
  private recording: boolean = false;
  private recordingId: string;
  private lastUrl: string = '';

  constructor(page: any, recordingId: string) {
    this.page = page;
    this.recordingId = recordingId;
  }

  /**
   * Inject monitoring script into the page to capture user actions
   */
  private async injectMonitoringScript() {
    await this.page.evaluate(() => {
      // Initialize or reset the recorded actions array
      (window as any)._recordedActions = (window as any)._recordedActions || [];

      // Skip if already injected (check for marker)
      if ((window as any)._actionRecorderInjected) {
        console.log('[ActionRecorder] Script already injected, skipping');
        return;
      }
      (window as any)._actionRecorderInjected = true;

      // Helper to generate XPath
      function getXPath(element: Element): string {
        if (element.id) {
          return `//*[@id="${element.id}"]`;
        }
        if (element === document.body) {
          return '/html/body';
        }

        let ix = 0;
        const siblings = element.parentNode?.childNodes || [];
        for (let i = 0; i < siblings.length; i++) {
          const sibling = siblings[i];
          if (sibling === element) {
            const parentXPath = getXPath(element.parentNode as Element);
            const tagName = element.tagName.toLowerCase();
            return `${parentXPath}/${tagName}[${ix + 1}]`;
          }
          if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
            ix++;
          }
        }
        return '';
      }

      // Helper to generate stable selector
      function getStableSelector(element: Element): string {
        // Try ID first
        if (element.id) {
          return `#${element.id}`;
        }

        // Try data-testid
        const testId = element.getAttribute('data-testid');
        if (testId) {
          return `[data-testid="${testId}"]`;
        }

        // Try name
        const name = element.getAttribute('name');
        if (name) {
          return `[name="${name}"]`;
        }

        // Try aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) {
          return `[aria-label="${ariaLabel}"]`;
        }

        // Fallback to XPath
        return getXPath(element);
      }

      // Helper to get element description
      function getDescription(element: Element): string {
        const tagName = element.tagName.toLowerCase();
        const ariaLabel = element.getAttribute('aria-label');
        const placeholder = element.getAttribute('placeholder');
        const text = element.textContent?.trim().substring(0, 50);

        if (ariaLabel) return ariaLabel;
        if (placeholder) return `field with placeholder "${placeholder}"`;
        if (text && text.length > 0) return `"${text}"`;
        return tagName;
      }

      // Helper to capture dropdown semantic value (P1 - 65% of use cases)
      function captureDropdownValue(element: Element): { value: string, label: string, semanticLabel: string } | null {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');

        // Strategy 1: Native <select> element
        if (tagName === 'select') {
          const selectEl = element as HTMLSelectElement;
          const selectedOption = selectEl.options[selectEl.selectedIndex];
          return {
            value: selectEl.value,
            label: selectedOption?.text || selectEl.value,
            semanticLabel: getDescription(element) || 'dropdown'
          };
        }

        // Strategy 2: Check if element is inside a <select>
        const selectParent = element.closest('select');
        if (selectParent) {
          const selectEl = selectParent as HTMLSelectElement;
          const selectedOption = selectEl.options[selectEl.selectedIndex];
          return {
            value: selectEl.value,
            label: selectedOption?.text || selectEl.value,
            semanticLabel: getDescription(selectParent) || 'dropdown'
          };
        }

        // Strategy 3: Custom dropdown option (data-value attribute)
        const dataValue = element.getAttribute('data-value');
        if (dataValue) {
          return {
            value: dataValue,
            label: element.textContent?.trim() || dataValue,
            semanticLabel: inferDropdownLabel(element)
          };
        }

        // Strategy 4: ARIA combobox/option pattern
        if (role === 'option') {
          const value = element.getAttribute('data-value') ||
                       element.getAttribute('value') ||
                       element.textContent?.trim() || '';
          return {
            value: value,
            label: element.textContent?.trim() || value,
            semanticLabel: inferDropdownLabel(element)
          };
        }

        // Strategy 5: Common dropdown class patterns
        const classList = element.className || '';
        const isDropdownItem = classList.includes('dropdown-item') ||
                              classList.includes('select-item') ||
                              classList.includes('menu-item') ||
                              classList.includes('option');

        if (isDropdownItem) {
          const value = element.getAttribute('data-value') ||
                       element.textContent?.trim() || '';
          return {
            value: value,
            label: element.textContent?.trim() || value,
            semanticLabel: inferDropdownLabel(element)
          };
        }

        return null;
      }

      // Helper to infer dropdown label from context
      function inferDropdownLabel(element: Element): string {
        // Look for associated label
        const label = findLabelForElement(element);
        if (label) return label;

        // Check parent container for hints
        const container = element.closest('[class*="select"], [class*="dropdown"], [role="listbox"]');
        if (container) {
          const ariaLabel = container.getAttribute('aria-label');
          if (ariaLabel) return ariaLabel;

          // Look for label element near the container
          const labelEl = container.previousElementSibling;
          if (labelEl && labelEl.tagName.toLowerCase() === 'label') {
            return labelEl.textContent?.trim() || 'dropdown';
          }
        }

        return 'dropdown';
      }

      // Helper to find label for an element
      function findLabelForElement(element: Element): string | null {
        // Check for aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        // Check for associated <label> via 'for' attribute
        const elementId = element.id;
        if (elementId) {
          const label = document.querySelector(`label[for="${elementId}"]`);
          if (label) return label.textContent?.trim() || null;
        }

        // Check for parent <label>
        const parentLabel = element.closest('label');
        if (parentLabel) {
          return parentLabel.textContent?.trim() || null;
        }

        return null;
      }

      // Helper to check if string looks like a date
      function isDateLike(str: string): boolean {
        if (!str) return false;
        return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(str) || // MM/DD/YYYY or DD/MM/YYYY
               /\d{4}-\d{2}-\d{2}/.test(str) ||                   // ISO format (YYYY-MM-DD)
               /(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(str) ||
               /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(str);
      }

      // Helper to parse month name to number
      function parseMonth(monthStr: string): number {
        if (!monthStr) return 1;
        const monthLower = monthStr.toLowerCase().trim();
        const months: Record<string, number> = {
          'january': 1, 'jan': 1,
          'february': 2, 'feb': 2,
          'march': 3, 'mar': 3,
          'april': 4, 'apr': 4,
          'may': 5,
          'june': 6, 'jun': 6,
          'july': 7, 'jul': 7,
          'august': 8, 'aug': 8,
          'september': 9, 'sep': 9,
          'october': 10, 'oct': 10,
          'november': 11, 'nov': 11,
          'december': 12, 'dec': 12
        };
        return months[monthLower] || 1;
      }

      // Helper to get date picker context (month/year shown)
      function getDatePickerContext(element: Element): { month: number, year: number } | null {
        // Find the calendar container
        const picker = element.closest('[class*="datepicker"], [class*="calendar"], [class*="date-picker"], [role="dialog"]');
        if (!picker) return null;

        // Look for month/year display elements
        const monthEl = picker.querySelector('[class*="month"]:not([class*="day"])') ||
                       picker.querySelector('[class*="current-month"]') ||
                       picker.querySelector('[aria-live="polite"]'); // Common in accessible date pickers

        const yearEl = picker.querySelector('[class*="year"]:not([class*="month"])') ||
                      picker.querySelector('[class*="current-year"]');

        let month = 1;
        let year = new Date().getFullYear();

        if (monthEl) {
          const monthText = monthEl.textContent?.trim() || '';
          month = parseMonth(monthText);
        }

        if (yearEl) {
          const yearMatch = yearEl.textContent?.match(/\d{4}/);
          if (yearMatch) {
            year = parseInt(yearMatch[0]);
          }
        }

        // If we couldn't find separate month/year, try combined header
        if (!monthEl && !yearEl) {
          const header = picker.querySelector('[class*="header"]') ||
                        picker.querySelector('[class*="title"]');
          if (header) {
            const headerText = header.textContent?.trim() || '';
            const monthMatch = headerText.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/i);
            const yearMatch = headerText.match(/\d{4}/);

            if (monthMatch) month = parseMonth(monthMatch[0]);
            if (yearMatch) year = parseInt(yearMatch[0]);
          }
        }

        return { month, year };
      }

      // Helper to construct date from day number and context
      function constructDate(dayText: string, context: { month: number, year: number } | null): string {
        const day = parseInt(dayText);
        if (isNaN(day) || day < 1 || day > 31) return '';

        if (!context) {
          // No context, use current month/year
          const now = new Date();
          context = { month: now.getMonth() + 1, year: now.getFullYear() };
        }

        // Format as ISO date (YYYY-MM-DD)
        const month = context.month.toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        return `${context.year}-${month}-${dayStr}`;
      }

      // Helper to capture date picker semantic value (P2 - 45% of use cases)
      function captureDatePickerValue(element: Element): { value: string, semanticLabel: string } | null {
        // Strategy 1: Check if element has date-related aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel && isDateLike(ariaLabel)) {
          // Parse date from aria-label
          const isoMatch = ariaLabel.match(/\d{4}-\d{2}-\d{2}/);
          if (isoMatch) {
            return {
              value: isoMatch[0],
              semanticLabel: inferDateIntent(element)
            };
          }

          // Try parsing other formats
          const dateMatch = ariaLabel.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/); // "December 17, 2025"
          if (dateMatch) {
            const month = parseMonth(dateMatch[1]);
            const day = dateMatch[2].padStart(2, '0');
            const year = dateMatch[3];
            return {
              value: `${year}-${month.toString().padStart(2, '0')}-${day}`,
              semanticLabel: inferDateIntent(element)
            };
          }
        }

        // Strategy 2: Check if we're in a date picker and clicked a day cell
        const role = element.getAttribute('role');
        const classList = element.className || '';
        const isCalendarDay = role === 'gridcell' ||
                             classList.includes('calendar-day') ||
                             classList.includes('date-cell') ||
                             classList.includes('day') ||
                             element.tagName.toLowerCase() === 'td';

        if (isCalendarDay) {
          const dayText = element.textContent?.trim() || '';
          const dayNumber = parseInt(dayText);

          if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
            // Get calendar context (month/year)
            const context = getDatePickerContext(element);
            if (context) {
              const dateValue = constructDate(dayText, context);
              if (dateValue) {
                return {
                  value: dateValue,
                  semanticLabel: inferDateIntent(element)
                };
              }
            }
          }
        }

        // Strategy 3: Check for associated input field with type="date"
        const picker = element.closest('[class*="datepicker"], [class*="calendar"], [role="dialog"]');
        if (picker) {
          // Look for input[type="date"] nearby
          const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
          if (dateInput && dateInput.value && isDateLike(dateInput.value)) {
            return {
              value: dateInput.value,
              semanticLabel: inferDateIntent(element)
            };
          }

          // Look for hidden input or data attribute with date
          const hiddenInput = picker.querySelector('input[type="hidden"]') as HTMLInputElement;
          if (hiddenInput && hiddenInput.value && isDateLike(hiddenInput.value)) {
            return {
              value: hiddenInput.value,
              semanticLabel: inferDateIntent(element)
            };
          }
        }

        return null;
      }

      // Helper to infer date intent from context (departure, return, check-in, etc.)
      function inferDateIntent(element: Element): string {
        // Look for associated label
        const label = findLabelForElement(element);
        if (label) {
          const lowerLabel = label.toLowerCase();
          if (lowerLabel.includes('depart') || lowerLabel.includes('leaving')) return 'departure date';
          if (lowerLabel.includes('return') || lowerLabel.includes('arriving')) return 'return date';
          if (lowerLabel.includes('check') && lowerLabel.includes('in')) return 'check-in date';
          if (lowerLabel.includes('check') && lowerLabel.includes('out')) return 'check-out date';
          if (lowerLabel.includes('start')) return 'start date';
          if (lowerLabel.includes('end')) return 'end date';
          if (lowerLabel.includes('birth')) return 'birth date';
        }

        // Check parent container for hints
        const container = element.closest('[class*="datepicker"], [class*="calendar"], [role="dialog"]');
        if (container) {
          const ariaLabel = container.getAttribute('aria-label');
          if (ariaLabel) {
            const lowerLabel = ariaLabel.toLowerCase();
            if (lowerLabel.includes('depart')) return 'departure date';
            if (lowerLabel.includes('return')) return 'return date';
            if (lowerLabel.includes('check-in')) return 'check-in date';
            if (lowerLabel.includes('check-out')) return 'check-out date';
          }

          // Check for nearby text labels
          const prevSibling = container.previousElementSibling;
          if (prevSibling) {
            const text = prevSibling.textContent?.toLowerCase() || '';
            if (text.includes('depart')) return 'departure date';
            if (text.includes('return')) return 'return date';
          }
        }

        return 'date';
      }

      // Helper to capture number/range input semantic value (P2 - 40% of use cases)
      function captureNumberValue(element: Element): { value: number, min?: number, max?: number, semanticLabel: string } | null {
        const tagName = element.tagName.toLowerCase();
        const type = element.getAttribute('type');
        const role = element.getAttribute('role');

        // Strategy 1: Native number or range input
        if ((tagName === 'input' && (type === 'number' || type === 'range'))) {
          const inputEl = element as HTMLInputElement;
          const value = parseFloat(inputEl.value);
          if (isNaN(value)) return null;

          const min = inputEl.min ? parseFloat(inputEl.min) : undefined;
          const max = inputEl.max ? parseFloat(inputEl.max) : undefined;
          const label = findLabelForElement(element) || inferNumberLabel(element);

          return {
            value,
            min,
            max,
            semanticLabel: label
          };
        }

        // Strategy 2: Increment/decrement buttons (common in guest/quantity selectors)
        const buttonText = element.textContent?.trim() || '';
        const isIncrementButton = buttonText === '+' || buttonText === '−' || buttonText === '-' ||
                                 buttonText === '▲' || buttonText === '▼' ||
                                 element.className.includes('increment') ||
                                 element.className.includes('decrement') ||
                                 element.className.includes('plus') ||
                                 element.className.includes('minus');

        if (isIncrementButton) {
          // Find the associated display element (value container)
          const container = element.closest('[class*="counter"], [class*="stepper"], [class*="number-input"], [class*="quantity"]');
          if (container) {
            // Look for the value display
            const display = container.querySelector('[class*="value"], [class*="count"], input[type="number"], [class*="display"]');
            if (display) {
              const valueText = (display as HTMLInputElement).value || display.textContent?.trim() || '';
              const value = parseFloat(valueText);

              if (!isNaN(value)) {
                const label = findLabelForElement(container as Element) || inferNumberLabel(element);
                return {
                  value,
                  semanticLabel: label
                };
              }
            }
          }

          // Alternative: check siblings for value display
          const siblings = Array.from(element.parentElement?.children || []);
          for (const sibling of siblings) {
            if (sibling === element) continue;
            const siblingText = (sibling as HTMLElement).textContent?.trim() || '';
            const siblingValue = parseFloat(siblingText);
            if (!isNaN(siblingValue)) {
              return {
                value: siblingValue,
                semanticLabel: inferNumberLabel(element)
              };
            }
          }
        }

        // Strategy 3: Range slider handle (ARIA slider)
        if (role === 'slider') {
          const valueNow = element.getAttribute('aria-valuenow');
          const valueMin = element.getAttribute('aria-valuemin');
          const valueMax = element.getAttribute('aria-valuemax');
          const ariaLabel = element.getAttribute('aria-label');

          if (valueNow) {
            const value = parseFloat(valueNow);
            if (!isNaN(value)) {
              return {
                value,
                min: valueMin ? parseFloat(valueMin) : undefined,
                max: valueMax ? parseFloat(valueMax) : undefined,
                semanticLabel: ariaLabel || inferNumberLabel(element)
              };
            }
          }
        }

        // Strategy 4: Custom number picker (check for numeric data attributes)
        const dataValue = element.getAttribute('data-value');
        if (dataValue) {
          const value = parseFloat(dataValue);
          if (!isNaN(value)) {
            return {
              value,
              semanticLabel: inferNumberLabel(element)
            };
          }
        }

        return null;
      }

      // Helper to infer number input label from context
      function inferNumberLabel(element: Element): string {
        const label = findLabelForElement(element);
        if (label) {
          const lowerLabel = label.toLowerCase();
          if (lowerLabel.includes('guest') || lowerLabel.includes('people')) return 'guest count';
          if (lowerLabel.includes('adult')) return 'adults';
          if (lowerLabel.includes('child')) return 'children';
          if (lowerLabel.includes('room')) return 'rooms';
          if (lowerLabel.includes('quantity') || lowerLabel.includes('qty')) return 'quantity';
          if (lowerLabel.includes('price')) return 'price';
          if (lowerLabel.includes('weight')) return 'weight';
          if (lowerLabel.includes('age')) return 'age';
          if (lowerLabel.includes('ticket')) return 'tickets';
          if (lowerLabel.includes('passenger')) return 'passengers';
          return label;
        }

        // Check parent container
        const container = element.closest('[class*="counter"], [class*="stepper"], [class*="quantity"], [class*="guest"]');
        if (container) {
          const ariaLabel = container.getAttribute('aria-label');
          if (ariaLabel) return ariaLabel;

          const containerClass = container.className || '';
          if (containerClass.includes('guest')) return 'guest count';
          if (containerClass.includes('quantity')) return 'quantity';
          if (containerClass.includes('ticket')) return 'tickets';
        }

        return 'number';
      }

      // Helper to capture autocomplete/location input semantic value (P2 - 40% of use cases)
      function captureAutocompleteValue(element: Element): { value: string, displayText: string, semanticLabel: string } | null {
        const role = element.getAttribute('role');
        const classList = element.className || '';

        // Strategy 1: ARIA combobox option (common in autocomplete dropdowns)
        if (role === 'option' || role === 'menuitem') {
          const displayText = element.textContent?.trim() || '';
          const dataValue = element.getAttribute('data-value') ||
                           element.getAttribute('data-place-id') ||
                           element.getAttribute('value');

          // Check if parent is an autocomplete/combobox
          const listbox = element.closest('[role="listbox"], [role="menu"], [class*="autocomplete"], [class*="suggestion"]');
          if (listbox) {
            return {
              value: dataValue || displayText,
              displayText: displayText,
              semanticLabel: inferAutocompleteLabel(element)
            };
          }
        }

        // Strategy 2: Check for autocomplete/suggestion class patterns
        const isAutocompleteOption = classList.includes('autocomplete') ||
                                     classList.includes('suggestion') ||
                                     classList.includes('place-result') ||
                                     classList.includes('location-item') ||
                                     classList.includes('address-option') ||
                                     classList.includes('pac-item'); // Google Places Autocomplete

        if (isAutocompleteOption) {
          const displayText = element.textContent?.trim() || '';
          const dataValue = element.getAttribute('data-value') ||
                           element.getAttribute('data-place-id') ||
                           element.getAttribute('data-location');

          return {
            value: dataValue || displayText,
            displayText: displayText,
            semanticLabel: inferAutocompleteLabel(element)
          };
        }

        // Strategy 3: Google Places Autocomplete specific patterns
        if (classList.includes('pac-item')) {
          const displayText = element.textContent?.trim() || '';
          // Google Places uses specific data attributes
          const placeId = element.getAttribute('data-place-id');

          return {
            value: placeId || displayText,
            displayText: displayText,
            semanticLabel: inferAutocompleteLabel(element)
          };
        }

        // Strategy 4: Check if clicking inside a listbox/menu (autocomplete results)
        const autocompleteContainer = element.closest('[class*="autocomplete"], [class*="suggestions"], [class*="dropdown-menu"]');
        if (autocompleteContainer) {
          // This might be an autocomplete option
          const displayText = element.textContent?.trim() || '';
          if (displayText.length > 0) {
            const dataValue = element.getAttribute('data-value') ||
                             element.getAttribute('value');

            return {
              value: dataValue || displayText,
              displayText: displayText,
              semanticLabel: inferAutocompleteLabel(element)
            };
          }
        }

        return null;
      }

      // Helper to infer autocomplete label from context
      function inferAutocompleteLabel(element: Element): string {
        // Look for associated input field label
        const container = element.closest('[class*="autocomplete"], [role="combobox"], [class*="suggestions"]');
        if (container) {
          // Find the associated input
          const input = container.querySelector('input') ||
                       document.querySelector('input[aria-autocomplete]') ||
                       document.querySelector('input[aria-expanded]');

          if (input) {
            const label = findLabelForElement(input);
            if (label) {
              const lowerLabel = label.toLowerCase();
              if (lowerLabel.includes('origin') || lowerLabel.includes('from') || lowerLabel.includes('departure')) return 'origin';
              if (lowerLabel.includes('destination') || lowerLabel.includes('to') || lowerLabel.includes('arrival')) return 'destination';
              if (lowerLabel.includes('address')) return 'address';
              if (lowerLabel.includes('city')) return 'city';
              if (lowerLabel.includes('airport')) return 'airport';
              if (lowerLabel.includes('location')) return 'location';
              if (lowerLabel.includes('zip') || lowerLabel.includes('postal')) return 'zip code';
              if (lowerLabel.includes('state')) return 'state';
              if (lowerLabel.includes('country')) return 'country';
              return label;
            }
          }
        }

        // Check element's own attributes
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        // Check class names for hints
        const classList = element.className || '';
        if (classList.includes('place')) return 'location';
        if (classList.includes('address')) return 'address';
        if (classList.includes('city')) return 'city';
        if (classList.includes('airport')) return 'airport';

        return 'location';
      }

      // Helper to capture checkbox/toggle semantic value (P3 - 35% of use cases)
      function captureToggleValue(element: Element): { checked: boolean, semanticLabel: string } | null {
        const type = element.getAttribute('type');
        const role = element.getAttribute('role');
        const tagName = element.tagName.toLowerCase();

        // Strategy 1: Native checkbox input
        if (tagName === 'input' && type === 'checkbox') {
          const inputEl = element as HTMLInputElement;
          const label = findLabelForElement(element) || inferToggleLabel(element);

          return {
            checked: inputEl.checked,
            semanticLabel: label
          };
        }

        // Strategy 2: ARIA checkbox (custom checkboxes)
        if (role === 'checkbox') {
          const ariaChecked = element.getAttribute('aria-checked');
          const label = element.getAttribute('aria-label') || inferToggleLabel(element);

          return {
            checked: ariaChecked === 'true',
            semanticLabel: label
          };
        }

        // Strategy 3: Toggle switches (often use role="switch")
        if (role === 'switch') {
          const ariaChecked = element.getAttribute('aria-checked');
          const label = element.getAttribute('aria-label') || inferToggleLabel(element);

          return {
            checked: ariaChecked === 'true',
            semanticLabel: label
          };
        }

        // Strategy 4: Check if clicking a label for a checkbox
        if (tagName === 'label') {
          const forAttr = element.getAttribute('for');
          if (forAttr) {
            const checkbox = document.getElementById(forAttr) as HTMLInputElement;
            if (checkbox && checkbox.type === 'checkbox') {
              return {
                checked: !checkbox.checked, // Will be toggled after click
                semanticLabel: element.textContent?.trim() || 'toggle'
              };
            }
          }

          // Check for nested checkbox
          const nestedCheckbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (nestedCheckbox) {
            return {
              checked: !nestedCheckbox.checked, // Will be toggled after click
              semanticLabel: element.textContent?.trim() || 'toggle'
            };
          }
        }

        // Strategy 5: Custom toggle switches (common class patterns)
        const classList = element.className || '';
        const isToggleSwitch = classList.includes('toggle') ||
                              classList.includes('switch') ||
                              classList.includes('checkbox');

        if (isToggleSwitch) {
          // Look for checked state in classes or data attributes
          const isChecked = classList.includes('checked') ||
                           classList.includes('active') ||
                           classList.includes('on') ||
                           element.getAttribute('data-checked') === 'true' ||
                           element.getAttribute('data-state') === 'checked';

          const label = inferToggleLabel(element);
          return {
            checked: isChecked,
            semanticLabel: label
          };
        }

        return null;
      }

      // Helper to infer toggle/checkbox label from context
      function inferToggleLabel(element: Element): string {
        // Try to find associated label
        const label = findLabelForElement(element);
        if (label) {
          const lowerLabel = label.toLowerCase();
          // Common toggle patterns
          if (lowerLabel.includes('direct')) return 'direct flights';
          if (lowerLabel.includes('remote')) return 'remote only';
          if (lowerLabel.includes('available')) return 'show available only';
          if (lowerLabel.includes('filter')) return 'filter';
          if (lowerLabel.includes('notification')) return 'notifications';
          if (lowerLabel.includes('email')) return 'email updates';
          if (lowerLabel.includes('newsletter')) return 'newsletter';
          if (lowerLabel.includes('terms')) return 'terms and conditions';
          if (lowerLabel.includes('privacy')) return 'privacy policy';
          if (lowerLabel.includes('remember')) return 'remember me';
          return label;
        }

        // Check nearby text
        const parent = element.parentElement;
        if (parent) {
          const parentText = parent.textContent?.trim() || '';
          if (parentText.length > 0 && parentText.length < 100) {
            return parentText;
          }
        }

        // Check aria-label
        const ariaLabel = element.getAttribute('aria-label');
        if (ariaLabel) return ariaLabel;

        // Check for text content
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text.length < 100) {
          return text;
        }

        return 'toggle';
      }

      // Capture clicks
      document.addEventListener('click', (e) => {
        const target = e.target as Element;
        if (!target) return;

        const action: any = {
          type: 'click' as const,
          selector: getStableSelector(target),
          description: `Click ${getDescription(target)}`,
          timestamp: Date.now(),
        };

        // Try to capture semantic values from different widget types
        // Use setTimeout to let DOM update after click (important for dynamic widgets)
        setTimeout(() => {
          // Priority 3: Try checkbox/toggle (35% of use cases, check early as it's specific)
          const toggleValue = captureToggleValue(target);
          if (toggleValue) {
            action.semanticValue = toggleValue.checked;
            action.semanticType = 'checkbox';
            action.semanticLabel = toggleValue.semanticLabel;
            console.log('[ActionRecorder] Captured toggle value:', toggleValue);
            return;
          }

          // Priority 2: Try autocomplete (40% of use cases, but most specific)
          const autocompleteValue = captureAutocompleteValue(target);
          if (autocompleteValue) {
            action.semanticValue = autocompleteValue.value;
            action.semanticType = 'autocomplete';
            action.semanticLabel = autocompleteValue.semanticLabel;
            console.log('[ActionRecorder] Captured autocomplete value:', autocompleteValue);
            return;
          }

          // Priority 2: Try date picker (45% of use cases)
          const dateValue = captureDatePickerValue(target);
          if (dateValue) {
            action.semanticValue = dateValue.value;
            action.semanticType = 'date-picker';
            action.semanticLabel = dateValue.semanticLabel;
            console.log('[ActionRecorder] Captured date picker value:', dateValue);
            return;
          }

          // Priority 1: Try dropdown (65% of use cases)
          const dropdownValue = captureDropdownValue(target);
          if (dropdownValue) {
            action.semanticValue = dropdownValue.value;
            action.semanticType = 'dropdown';
            action.semanticLabel = dropdownValue.semanticLabel;
            console.log('[ActionRecorder] Captured dropdown value:', dropdownValue);
            return;
          }

          // Priority 2: Try number input (40% of use cases)
          const numberValue = captureNumberValue(target);
          if (numberValue) {
            action.semanticValue = numberValue.value;
            action.semanticType = 'number-input';
            action.semanticLabel = numberValue.semanticLabel;
            console.log('[ActionRecorder] Captured number value:', numberValue);
            return;
          }
        }, 200); // 200ms delay for DOM updates

        (window as any)._recordedActions.push(action);
        console.log('[ActionRecorder] Captured click:', action);
      }, true);

      // Capture inputs
      document.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        if (!target) return;

        const action: any = {
          type: 'fill' as const,
          selector: getStableSelector(target),
          description: `Fill ${getDescription(target)}`,
          value: target.value,
          timestamp: Date.now(),
          // Semantic value capture for text inputs (100% of use cases)
          semanticValue: target.value,
          semanticType: 'text-input',
          semanticLabel: findLabelForElement(target) || getDescription(target),
        };

        (window as any)._recordedActions.push(action);
        console.log('[ActionRecorder] Captured input:', action);
      }, true);

      // Capture form submissions
      document.addEventListener('submit', (e) => {
        const target = e.target as Element;
        if (!target) return;

        const action = {
          type: 'click' as const,
          selector: getStableSelector(target),
          description: `Submit form`,
          timestamp: Date.now(),
        };

        (window as any)._recordedActions.push(action);
        console.log('[ActionRecorder] Captured submit:', action);
      }, true);

      console.log('[ActionRecorder] Event listeners attached successfully');
    });
  }

  /**
   * Start recording user actions by injecting monitoring script
   */
  async startRecording() {
    this.recording = true;

    console.log('[ActionRecorder] Starting recording');

    // Inject the monitoring script into the current page
    await this.injectMonitoringScript();

    // Initialize last URL for navigation tracking
    this.lastUrl = this.page.url();
    console.log('[ActionRecorder] Initial URL:', this.lastUrl);

    // Poll for captured actions and URL changes
    this.startPolling();

    console.log('[ActionRecorder] Started recording');
  }

  /**
   * Poll the page for captured actions and URL changes
   *
   * KNOWN LIMITATION: This uses setInterval stored on global. It runs within a
   * Workflow step and may not survive worker reclamation during very long recordings
   * (>5-10 minutes). For typical 1-5 minute demos, this works reliably.
   *
   * The Browserbase session uses keepAlive: true to survive disconnections.
   * A heartbeat timestamp is updated on each poll to enable monitoring.
   */
  private startPolling() {
    const pollInterval = setInterval(async () => {
      if (!this.recording) {
        clearInterval(pollInterval);
        return;
      }

      try {
        // Update heartbeat timestamp for monitoring
        await this.updateHeartbeat();

        // Check for URL changes (navigation detection)
        const currentUrl = this.page.url();
        if (currentUrl !== this.lastUrl) {
          console.log('[ActionRecorder] URL changed:', this.lastUrl, '->', currentUrl);

          // Record navigation action
          const action: RecordedAction = {
            type: 'navigate',
            selector: '',
            description: `Navigate to ${currentUrl}`,
            url: currentUrl,
            timestamp: Date.now(),
          };

          this.actions.push(action);
          await this.saveActions();

          // Update last URL
          this.lastUrl = currentUrl;

          // Re-inject monitoring script on the new page
          try {
            console.log('[ActionRecorder] Re-injecting script after navigation');
            await this.injectMonitoringScript();
          } catch (error) {
            console.log('[ActionRecorder] Error re-injecting script:', error);
          }
        }

        // Retrieve actions captured in the page
        const pageActions = await this.page.evaluate(() => {
          const actions = (window as any)._recordedActions || [];
          (window as any)._recordedActions = [];
          return actions;
        });

        if (pageActions && pageActions.length > 0) {
          console.log('[ActionRecorder] Retrieved', pageActions.length, 'actions from page');
          this.actions.push(...pageActions);
          await this.saveActions();
        }
      } catch (error) {
        // Page might be navigating or transitioning, ignore errors
        console.log('[ActionRecorder] Error polling:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Store interval for cleanup
    (global as any).recordingIntervals = (global as any).recordingIntervals || {};
    (global as any).recordingIntervals[this.recordingId] = pollInterval;
  }

  /**
   * Update heartbeat timestamp in MongoDB
   *
   * This allows external monitoring to detect if recording has stopped unexpectedly.
   * If lastHeartbeat is >5 seconds old, the recording may have stalled.
   */
  private async updateHeartbeat() {
    try {
      const db = await connectDB();
      await db.collection('recording_sessions').updateOne(
        { recordingId: this.recordingId },
        {
          $set: {
            lastHeartbeat: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      // Don't throw - heartbeat is non-critical
      console.error('[ActionRecorder] Error updating heartbeat:', error);
    }
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    this.recording = false;

    // Clear interval
    if ((global as any).recordingIntervals?.[this.recordingId]) {
      clearInterval((global as any).recordingIntervals[this.recordingId]);
      delete (global as any).recordingIntervals[this.recordingId];
    }

    // 🔧 FIX: Do a final retrieval of actions from browser before grouping
    // This is critical for Vercel/serverless where setInterval may have stopped
    try {
      console.log('[ActionRecorder] Performing final action retrieval from browser...');
      const pageActions = await this.page.evaluate(() => {
        const actions = (window as any)._recordedActions || [];
        (window as any)._recordedActions = []; // Clear after retrieval
        return actions;
      });

      if (pageActions && pageActions.length > 0) {
        console.log('[ActionRecorder] Retrieved', pageActions.length, 'actions from final retrieval');
        this.actions.push(...pageActions);
        // Save immediately in case grouping fails
        await this.saveActions();
      } else {
        console.log('[ActionRecorder] No additional actions found in browser');
      }
    } catch (error) {
      console.error('[ActionRecorder] Error during final action retrieval:', error);
      // Continue anyway - work with whatever actions we have
    }

    // Group raw actions into semantic actions before saving
    console.log('[ActionRecorder] Grouping', this.actions.length, 'raw actions...');
    const groupedActions = groupActions(this.actions);
    console.log('[ActionRecorder] Grouped into', groupedActions.length, 'semantic actions');

    // Replace raw actions with grouped actions
    this.actions = groupedActions as RecordedAction[];

    // Final save with grouped actions
    await this.saveActions();
  }

  /**
   * Get all recorded actions
   */
  getActions(): RecordedAction[] {
    return this.actions;
  }

  /**
   * Save actions to MongoDB
   */
  private async saveActions() {
    try {
      const db = await connectDB();
      await db.collection('recording_sessions').updateOne(
        { recordingId: this.recordingId },
        {
          $set: {
            recordedActions: this.actions,
            updatedAt: new Date().toISOString()
          }
        }
      );
    } catch (error) {
      console.error('[ActionRecorder] Error saving actions:', error);
    }
  }

  /**
   * Manually add an action (for testing or special cases)
   */
  async addAction(action: RecordedAction) {
    this.actions.push(action);
    await this.saveActions();
  }
}
