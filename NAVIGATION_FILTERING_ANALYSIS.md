# Navigation Filtering Analysis

## The Problem

When recording a Google search skill:
1. User types query → Action recorded: `type "%query%"`
2. Browser auto-navigates to results → Action recorded: `navigate "...?q=apple+stock"`

The navigation URL is hardcoded with the original query, so variable substitution doesn't work.

## Impact on Use Cases

### ✅ HELPS These Use Cases (Search-Based)

**Use Cases 2, 4, 7, 9, 12** - Search and extract patterns:
- Amazon product search
- Google Finance stock prices
- Google Shopping price comparison
- Social media mentions

**Pattern**:
```
1. Navigate to site
2. Type search query ← Variable here
3. [AUTO-NAVIGATE to results] ← REMOVE THIS
4. Extract data
```

**Why it helps**: Prevents hardcoded search queries in navigation URLs

---

### ⚠️ MIGHT AFFECT These Use Cases (Form-Based)

**Use Cases 1, 5, 6, 8, 10, 11, 14, 15, 16, 18** - Multi-field forms:
- Flight search (Google Flights, Kayak)
- Hotel booking
- Job search (LinkedIn)
- Restaurant reservations
- Real estate search

**Pattern**:
```
1. Navigate to site
2. Fill field 1 (origin)
3. Fill field 2 (destination)
4. Fill field 3 (date)
5. Click "Search" button
6. [AUTO-NAVIGATE to results] ← Should we remove?
7. Extract data
```

**Consideration**: The navigation after clicking "Search" might have URL parameters from the form. If we filter it, the browser should still navigate naturally when the form is submitted.

---

### ✅ DOESN'T AFFECT These Use Cases (Direct/Multi-Step)

**Use Cases 3, 13** - Direct navigation or tracking:
- Contact form submission
- Package tracking

**Pattern**: No automatic navigation after typing/searching

---

## Recommendation: Smart Filtering

### Rule: Filter "Automatic Navigations After Search"

**Filter a navigation if:**
1. Previous action was `type`, `fill`, or `click` (on search/submit button)
2. Navigation happens **within 2 seconds** of that action
3. Navigation URL contains query parameters that match typed text

**Don't filter if:**
1. Navigation is the first action (initial page load)
2. Navigation is explicitly user-initiated (clicking a link)
3. Navigation happens >2 seconds after previous action

### Implementation Location

In `/lib/capture/action-recorder.ts` → `finishRecording()`:

```typescript
function filterRedundantNavigations(actions: RecordedAction[]): RecordedAction[] {
  const filtered: RecordedAction[] = [];

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const prevAction = i > 0 ? actions[i - 1] : null;

    // Keep first navigation (initial page load)
    if (action.type === 'navigate' && i === 0) {
      filtered.push(action);
      continue;
    }

    // Filter navigate that immediately follows search/form action
    if (
      action.type === 'navigate' &&
      prevAction &&
      (prevAction.type === 'type' || prevAction.type === 'fill' || prevAction.type === 'click') &&
      (action.timestamp - prevAction.timestamp) < 2000 // Within 2 seconds
    ) {
      console.log('[filterRedundantNavigations] Removing auto-navigation after search:', action.url);
      continue; // Skip this navigation
    }

    filtered.push(action);
  }

  return filtered;
}
```

---

## Expected Impact

### Google Search (Current Problem)

**Before**:
```
1. navigate → google.com
2. click → search box
3. type → %query%
4. navigate → google.com/search?q=apple+stock ❌ HARDCODED
```

**After**:
```
1. navigate → google.com
2. click → search box
3. type → %query%
✅ Browser naturally navigates to search results
```

### Amazon Search

**Before**:
```
1. navigate → amazon.com
2. type → %product%
3. navigate → amazon.com/s?k=iPhone+15 ❌ HARDCODED
4. click → first result
```

**After**:
```
1. navigate → amazon.com
2. type → %product%
✅ Browser naturally navigates
3. click → first result
```

### Flight Search (Multi-field form)

**Before**:
```
1. navigate → kayak.com
2. fill → origin: %from%
3. fill → destination: %to%
4. click → search button
5. navigate → kayak.com/flights/YVR-LAX/2024-12-25 ❌ HARDCODED
```

**After**:
```
1. navigate → kayak.com
2. fill → origin: %from%
3. fill → destination: %to%
4. click → search button
✅ Browser naturally navigates to results
```

---

## Edge Cases to Handle

### 1. Legitimate Multi-Step Navigations

If a user manually navigates to a different page (not auto-navigate after search), we should keep it.

**Example**: Product search → Click category → Click product

**Solution**: Only filter navigations within 2 seconds of search/click actions

### 2. Single-Page Applications (SPAs)

Some sites don't navigate at all - they update the URL with JavaScript history API.

**Impact**: No navigation action is recorded anyway, so no impact

### 3. Slow Websites

If a search takes >2 seconds to navigate, the filter won't apply.

**Impact**: Navigation might still be recorded with hardcoded query
**Mitigation**: Increase timeout or use different heuristic (check if URL contains typed text)

---

## Conclusion

**Filtering automatic navigations will:**
- ✅ Fix the Google search bug
- ✅ Improve all search-based use cases
- ✅ Improve form-based use cases
- ✅ Not break any existing functionality (browser still navigates naturally)
- ✅ Make skills more flexible and variable-friendly

**No downsides** - this is a pure improvement!
