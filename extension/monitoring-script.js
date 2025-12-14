// Dittod Action Recorder - Monitoring Script
// This script captures user actions for skill creation
// Injected into PAGE context by content-script-injector.js

(function() {
  'use strict';

  // Skip if already injected (check for marker)
  if (window._actionRecorderInjected) {
    console.log('[ActionRecorder] Script already injected, skipping');
    return;
  }
  window._actionRecorderInjected = true;

  // Load existing actions from sessionStorage (survives navigation)
  console.log('[ActionRecorder] DEBUG: Checking sessionStorage...');
  console.log('[ActionRecorder] DEBUG: sessionStorage available:', typeof sessionStorage !== 'undefined');

  let existingActions = [];
  try {
    const stored = sessionStorage.getItem('_recordedActions');
    console.log('[ActionRecorder] DEBUG: Raw sessionStorage value:', stored ? stored.substring(0, 100) : 'null');
    existingActions = stored ? JSON.parse(stored) : [];
    console.log('[ActionRecorder] DEBUG: Parsed', existingActions.length, 'actions from storage');
  } catch (e) {
    console.error('[ActionRecorder] ERROR loading from sessionStorage:', e.message);
  }

  window._recordedActions = existingActions;
  console.log('[ActionRecorder] Initialized _recordedActions array with', existingActions.length, 'existing actions');

  // Helper to generate XPath
  function getXPath(element) {
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
        const parentXPath = getXPath(element.parentNode);
        const tagName = element.tagName.toLowerCase();
        return `${parentXPath}/${tagName}[${ix + 1}]`;
      }
      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
        ix++;
      }
    }
    return '';
  }

  // Helper to generate stable selector
  function getStableSelector(element) {
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
  function getDescription(element) {
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
  function captureDropdownValue(element) {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');

    // Strategy 1: Native <select> element
    if (tagName === 'select') {
      const selectEl = element;
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
      const selectEl = selectParent;
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
  function inferDropdownLabel(element) {
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
  function findLabelForElement(element) {
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
  function isDateLike(str) {
    if (!str) return false;
    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(str) || // MM/DD/YYYY or DD/MM/YYYY
           /\d{4}-\d{2}-\d{2}/.test(str) ||                   // ISO format (YYYY-MM-DD)
           /(january|february|march|april|may|june|july|august|september|october|november|december)/i.test(str) ||
           /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(str);
  }

  // Helper to parse month name to number
  function parseMonth(monthStr) {
    if (!monthStr) return 1;
    const monthLower = monthStr.toLowerCase().trim();
    const months = {
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
  function getDatePickerContext(element) {
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
  function constructDate(dayText, context) {
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
  function captureDatePickerValue(element) {
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
      const dateInput = document.querySelector('input[type="date"]');
      if (dateInput && dateInput.value && isDateLike(dateInput.value)) {
        return {
          value: dateInput.value,
          semanticLabel: inferDateIntent(element)
        };
      }

      // Look for hidden input or data attribute with date
      const hiddenInput = picker.querySelector('input[type="hidden"]');
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
  function inferDateIntent(element) {
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
  function captureNumberValue(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');
    const role = element.getAttribute('role');

    // Strategy 1: Native number or range input
    if ((tagName === 'input' && (type === 'number' || type === 'range'))) {
      const inputEl = element;
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
          const valueText = display.value || display.textContent?.trim() || '';
          const value = parseFloat(valueText);

          if (!isNaN(value)) {
            const label = findLabelForElement(container) || inferNumberLabel(element);
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
        const siblingText = sibling.textContent?.trim() || '';
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
  function inferNumberLabel(element) {
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
  function captureAutocompleteValue(element) {
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
  function inferAutocompleteLabel(element) {
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
  function captureToggleValue(element) {
    const type = element.getAttribute('type');
    const role = element.getAttribute('role');
    const tagName = element.tagName.toLowerCase();

    // Strategy 1: Native checkbox input
    if (tagName === 'input' && type === 'checkbox') {
      const inputEl = element;
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
        const checkbox = document.getElementById(forAttr);
        if (checkbox && checkbox.type === 'checkbox') {
          return {
            checked: !checkbox.checked, // Will be toggled after click
            semanticLabel: element.textContent?.trim() || 'toggle'
          };
        }
      }

      // Check for nested checkbox
      const nestedCheckbox = element.querySelector('input[type="checkbox"]');
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
  function inferToggleLabel(element) {
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
    const target = e.target;
    if (!target) return;

    const action = {
      type: 'click',
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

    window._recordedActions.push(action);
    const serialized = JSON.stringify(window._recordedActions);
    sessionStorage.setItem('_recordedActions', serialized);
    console.log('[ActionRecorder] Captured click:', action);
    console.log('[ActionRecorder] DEBUG: Saved', window._recordedActions.length, 'actions to sessionStorage (', serialized.length, 'bytes )');
  }, true);

  // Capture inputs
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (!target) return;

    const action = {
      type: 'fill',
      selector: getStableSelector(target),
      description: `Fill ${getDescription(target)}`,
      value: target.value,
      timestamp: Date.now(),
      // Semantic value capture for text inputs (100% of use cases)
      semanticValue: target.value,
      semanticType: 'text-input',
      semanticLabel: findLabelForElement(target) || getDescription(target),
    };

    window._recordedActions.push(action);
    const serialized = JSON.stringify(window._recordedActions);
    sessionStorage.setItem('_recordedActions', serialized);
    console.log('[ActionRecorder] Captured input:', action);
    console.log('[ActionRecorder] DEBUG: Saved', window._recordedActions.length, 'actions to sessionStorage (', serialized.length, 'bytes )');
  }, true);

  // Capture form submissions
  document.addEventListener('submit', (e) => {
    const target = e.target;
    if (!target) return;

    const action = {
      type: 'click',
      selector: getStableSelector(target),
      description: `Submit form`,
      timestamp: Date.now(),
    };

    window._recordedActions.push(action);
    sessionStorage.setItem('_recordedActions', JSON.stringify(window._recordedActions));
    console.log('[ActionRecorder] Captured submit:', action);
  }, true);

  console.log('[ActionRecorder] Extension event listeners attached successfully');
})();
