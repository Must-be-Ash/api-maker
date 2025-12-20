# Dropdown Debug Logging Guide

This guide documents all the debug logging added for dropdown handling to help troubleshoot issues.

## Log Categories

### 1. Recording Phase Logs

**Location**: `/workflows/steps/finish-recording-step.ts`

**When dropdown is detected during recording:**
```
[finishRecordingStep] 🔍 Dropdown detected: {
  type: 'fill',
  selector: '#origin',
  dropdownType: 'autocomplete',
  isInIframe: false,
  confidence: 'high',
  semanticType: 'autocomplete'
}
```

**What to look for:**
- ✅ `dropdownType` should be: `'select'`, `'autocomplete'`, `'custom'`, or `'datepicker'`
- ✅ `confidence` should be `'high'` or `'medium'` (avoid `'low'`)
- ✅ `isInIframe` should be `true` if dropdown is in iframe

---

### 2. Execution Phase - Dropdown Detection

**Location**: `/workflows/steps/execute-skill-step.ts` (executeExactReplay)

**When dropdown metadata is detected:**
```
[executeExactReplay] 🔍 Dropdown metadata detected: {
  dropdownType: 'autocomplete',
  isInIframe: false,
  selector: '#origin',
  value: 'Seattle',
  semanticType: 'autocomplete',
  description: 'Fill origin field'
}
```

**What to look for:**
- ✅ Dropdown metadata is present
- ✅ `dropdownType` matches what was recorded
- ✅ `value` has been substituted with variable

---

### 3. Select Dropdown Handler Logs

**Location**: `handleSelectDropdown()` function

**Successful execution:**
```
[handleSelectDropdown] Selecting "US" from: select#country
[handleSelectDropdown] 🔍 Debug info: {
  selector: 'select#country',
  value: 'US',
  isInIframe: false,
  locatorType: 'locator'
}
[handleSelectDropdown] ✓ Selected: ["US"]
[handleSelectDropdown] 📊 Result: {
  success: true,
  method: 'selectOption',
  selected: ["US"],
  llmCost: 0
}
```

**What to look for:**
- ✅ `method: 'selectOption'` (direct API, no LLM)
- ✅ `llmCost: 0` (no AI needed)
- ✅ `locatorType: 'deepLocator'` if in iframe

**Fallback to observe→act:**
```
[handleSelectDropdown] selectOption failed: Element not found
[handleSelectDropdown] ✓ Selected via observe→act
```

---

### 4. Autocomplete Dropdown Handler Logs (CRITICAL)

**Location**: `handleAutocompleteDropdown()` function

**Successful execution:**
```
[handleAutocomplete] Handling autocomplete for: Seattle
[handleAutocomplete] ✓ Typed "Seattle"
[handleAutocomplete] 🔍 Observing: find the dropdown option containing "Seattle" in the origin autocomplete menu
[handleAutocomplete] 📊 observe() returned: {
  actionsCount: 5,
  timeout: 10000,
  instruction: 'find the dropdown option containing "Seattle"...'
}
[handleAutocomplete] 📋 First action: {
  selector: 'div.suggestion:nth-child(1)',
  description: 'Seattle-Tacoma International Airport',
  method: 'click'
}
[handleAutocomplete] Found 5 suggestions
[handleAutocomplete] 📝 Clicking: Seattle-Tacoma International Airport
[handleAutocomplete] Field value after selection: "Seattle, WA"
[handleAutocomplete] ✓ Autocomplete selection complete
```

**What to look for:**
- ✅ `actionsCount > 0` (NOT 0!)
- ✅ Action has `selector`, `description`, `method`
- ✅ Field value verified after selection
- ❌ Should NOT see: `observe returned no actions` (unless expected)

**Fallback scenario:**
```
[handleAutocomplete] observe returned no actions, trying fallback
[handleAutocomplete] ✓ Fallback succeeded
```

---

### 5. Custom Dropdown Handler Logs

**Location**: `handleCustomDropdown()` function

**Successful execution:**
```
[handleCustomDropdown] Opening dropdown for: Blue
[handleCustomDropdown] 🔍 Debug info: {
  triggerSelector: '#colorDropdown',
  value: 'Blue',
  fieldDescription: 'color',
  useObserve: true
}
[handleCustomDropdown] 📋 Trigger action: {
  selector: 'button.dropdown-trigger',
  description: 'color dropdown button',
  method: 'click'
}
[handleCustomDropdown] ✓ Dropdown opened
[handleCustomDropdown] 📝 Selecting: Blue option
[handleCustomDropdown] ✓ Custom dropdown selection complete
```

**What to look for:**
- ✅ Trigger action found via observe
- ✅ Option found via observe
- ✅ Both steps succeed

---

### 6. Date Picker Handler Logs

**Location**: `handleDatePicker()` function

**Successful direct input:**
```
[handleDatePicker] Selecting date: 2025-12-25
[handleDatePicker] 🔍 Debug info: {
  selector: '#checkIn',
  dateValue: '2025-12-25',
  fieldDescription: 'check-in',
  strategy: 'direct-input-first'
}
[handleDatePicker] 🎯 Trying Strategy 1: Direct text input
[handleDatePicker] ✓ Direct input succeeded: 2025-12-25
```

**Fallback to AI navigation:**
```
[handleDatePicker] Direct input failed, using AI navigation
[handleDatePicker] AI instruction: select the date December 25, 2025 in the check-in date picker
[handleDatePicker] ✓ AI navigation succeeded
```

**What to look for:**
- ✅ Strategy 1 (direct input) tried first
- ✅ Fallback to AI if needed
- ✅ Clear indication of which strategy worked

---

### 7. Integration Logs

**Location**: `executeExactReplay()` after handler calls

**After successful dropdown handling:**
```
[executeExactReplay] ✓ Select dropdown handled successfully: {
  method: 'selectOption',
  selected: ['US']
}
```

```
[executeExactReplay] ✓ Autocomplete dropdown handled successfully
```

```
[executeExactReplay] ✓ Custom dropdown handled successfully
```

```
[executeExactReplay] ✓ Date picker handled successfully
```

---

## Error Patterns

### Fixed Error (Should NOT Appear)

❌ **This error is FIXED:**
```
ERROR: No object generated: response did not match schema.
text: {}
```

If you see this, the fix didn't work - investigate why observe→act pattern isn't being used.

### Expected Warnings

⚠️ **These are acceptable:**
```
[handleAutocomplete] observe returned no actions, trying fallback
[handleSelectDropdown] selectOption failed: Element not found
[handleDatePicker] Direct input failed, using AI navigation
```

These indicate fallback strategies are working.

### Critical Errors

🚨 **These should be rare:**
```
[executeExactReplay] ❌ Autocomplete handler failed: ...
[executeExactReplay] ❌ Select dropdown handler failed: ...
[executeExactReplay] ❌ Custom dropdown handler failed: ...
[executeExactReplay] ❌ Date picker handler failed: ...
```

If these appear, check:
1. Is the website UI different from recording?
2. Is Stagehand initialized correctly?
3. Are there network/timeout issues?
4. Screenshot should be captured - check it

---

## Debugging Workflow

### Step 1: Check Recording Phase

Look for:
```
[finishRecordingStep] 🔍 Dropdown detected: { dropdownType: '...', ... }
```

If missing → Dropdown not detected during recording → Check dropdown-detector.ts logic

### Step 2: Check Execution Detection

Look for:
```
[executeExactReplay] 🔍 Dropdown metadata detected: { ... }
```

If missing → Action doesn't have dropdownType metadata → Skill might be old format

### Step 3: Check Handler Execution

Look for handler-specific logs:
- `[handleSelectDropdown]`
- `[handleAutocomplete]`
- `[handleCustomDropdown]`
- `[handleDatePicker]`

If missing → Handler not being called → Check dropdown type matching logic

### Step 4: Check observe() Results

Look for:
```
[handleAutocomplete] 📊 observe() returned: { actionsCount: N, ... }
```

If `actionsCount: 0` → observe() couldn't find elements → Check instruction wording or page state

### Step 5: Check Action Objects

Look for:
```
[handleAutocomplete] 📋 First action: { selector: '...', description: '...', method: '...' }
```

If action looks wrong → observe() found wrong element → Improve instruction specificity

### Step 6: Check Final Result

Look for:
```
[executeExactReplay] ✓ Autocomplete dropdown handled successfully
```

If present → Success! Handler completed.

If absent → Error occurred → Check error logs and screenshot

---

## Log Verbosity Levels

### Minimal (Production)
- Only success/failure messages
- Error logs with screenshots

### Standard (Default)
- All current logging
- Dropdown detection
- Handler selection
- observe() results
- Success/failure

### Verbose (Debug)
- Add this to handlers for deep debugging:
```typescript
console.log('[DEBUG] Full action:', JSON.stringify(action, null, 2));
console.log('[DEBUG] Full observe results:', JSON.stringify(actions, null, 2));
```

---

## Common Issues and Log Patterns

### Issue: `{}` Error Returns

**Expected Logs:**
```
ERROR: No object generated: response did not match schema.
text: {}
```

**Solution**: Should NOT happen with new code. If it does:
1. Check that observe→act pattern is being used
2. Verify handler is being called
3. Check instruction clarity

### Issue: Dropdown Not Closing

**Expected Logs:**
```
[handleAutocomplete] Field value after selection: "Seattle"
```

**Solution**:
- Field value verification happens automatically
- No need for extra observe() call to check if closed

### Issue: Sequential Dropdowns Fail

**Expected Logs:**
```
[handleAutocomplete] ✓ Autocomplete selection complete  // First field
[handleAutocomplete] Handling autocomplete for: New York  // Second field
```

**Solution**:
- Each field should have its own handler call
- Second should NOT fail due to first dropdown

### Issue: Iframe Dropdown Fails

**Expected Logs:**
```
[handleSelectDropdown] 🔍 Debug info: {
  isInIframe: true,
  locatorType: 'deepLocator'
}
```

**Solution**:
- Check `isInIframe: true` is detected
- Verify `deepLocator` is being used

---

## Performance Monitoring

Track these metrics from logs:

1. **LLM Cost**
   - Select dropdowns: 0 tokens (direct selectOption)
   - Autocomplete: ~10k-15k tokens (observe + act)
   - Custom: ~15k-20k tokens (2x observe + 2x act)
   - Date picker: 0-20k tokens (direct input vs AI)

2. **Execution Time**
   - Select: <1 second
   - Autocomplete: 2-4 seconds
   - Custom: 3-5 seconds
   - Date picker: 1-3 seconds (direct) or 5-10 seconds (AI)

3. **Success Rate**
   - Target: 95%+ with new implementation
   - Strategy 1 should succeed for most skills

---

## Quick Reference

**Check if fix is working:**
```bash
# Search for old error pattern (should NOT appear)
grep "{}" logs.txt

# Count successful autocomplete selections
grep "Autocomplete selection complete" logs.txt | wc -l

# Check observe() results
grep "observe() returned" logs.txt

# Check handler usage
grep "dropdown detected, using handle" logs.txt
```

**Expected counts for a skill with 2 autocomplete fields:**
- `Dropdown metadata detected`: 2
- `handleAutocompleteDropdown`: 2
- `observe() returned`: 2+ (one per dropdown + fallbacks)
- `Autocomplete selection complete`: 2
- `{}` errors: 0
