# Improved Flight Search Goal

## Current Goal (Your Recording):
```
Search for round trip flights from %origin% to %destination% departing on %departureDate% and returning on %returnDate%, then find the cheapest option
```

## Problem:
- Agent finds flights but doesn't extract complete details
- Might not be selecting the CHEAPEST option
- Missing flight numbers, times, and exact pricing

---

## Recommended Improved Goal:

### Version 1: More Explicit
```
Search for round trip flights from %origin% to %destination% departing on %departureDate% and returning on %returnDate% on Google Flights. Sort results by price (cheapest first). Click on the CHEAPEST round trip option. Extract the TOTAL PRICE including currency symbol, BOTH airline names, BOTH flight numbers, departure times, and arrival times.
```

### Version 2: Step-by-Step
```
1. On Google Flights, search for round trip flights from %origin% to %destination% departing on %departureDate% returning on %returnDate%
2. Wait for results to load
3. Click "Sort by price" or find the cheapest option (lowest total price)
4. Click on that flight to see full details
5. Extract: total price with currency (e.g., CA$402), airline names for both segments, flight numbers, departure/arrival times
```

---

## How to Update Without Re-recording

You have 2 options:

### Option A: Update the Skill Goal in MongoDB

You can manually update the goal in your MongoDB database:

```javascript
db.skills.updateOne(
  { skillId: "skill_1765315026786_lcr498kum" },
  {
    $set: {
      goal: "Search for round trip flights from %origin% to %destination% departing on %departureDate% and returning on %returnDate% on Google Flights. Sort results by price (cheapest first). Click on the CHEAPEST round trip option. Extract the TOTAL PRICE including currency symbol, BOTH airline names, BOTH flight numbers, departure times, and arrival times."
    }
  }
)
```

### Option B: Re-record with Better Goal

Only do this if Option A doesn't work well.

1. Go to `/skills/record`
2. Use the improved goal (Version 1 or 2 above)
3. During demonstration:
   - **Make sure you're looking at prices sorted by cheapest**
   - **Click on the cheapest option**
   - **Look at the full flight details page**
4. Finish recording

---

## Testing the Current Skill First

Before re-recording, let's test if the issue is just currency:

Try asking:
```
"How much is the cheapest round trip flight from Vancouver to LAX from December 17th to 24th in Canadian dollars?"
```

Or try a different route:
```
"How much is the cheapest round trip flight from Toronto to New York from January 10th to 15th?"
```

This will tell us if:
- The extraction is consistently incomplete
- It's just a currency conversion issue
- It's selecting the wrong flights

---

## My Recommendation

### **DON'T re-record yet!**

Instead:

1. ✅ **Test with different queries** (different cities/dates)
2. ✅ **Check if prices are consistent** (maybe $471 IS correct for those dates now?)
3. ✅ **Accept that extraction might be incomplete** for complex sites like Google Flights

### Why Not Re-record?

- Your current skill **DOES work** (stays on Google Flights ✅)
- It **DOES find flights** (successfully searches ✅)
- It **DOES extract pricing** (found $471 ✅)
- Re-recording won't fix extraction completeness

The issue is **AI agent behavior**, not your recording.

---

## Real-World Assessment

For a production API:

**What's Working** ✅:
- Stays on correct website
- Executes the search
- Finds flights
- Returns pricing

**What's Missing** ⚠️:
- Complete extraction (flight numbers, exact times)
- Might not always select absolute cheapest
- Currency might be inconsistent

**Is This Good Enough?**

Depends on your use case:

| Use Case | Good Enough? |
|----------|--------------|
| "Quick price check" | ✅ Yes - $471 is useful info |
| "Compare prices" | ✅ Yes - can compare multiple queries |
| "Book this exact flight" | ❌ No - need flight numbers |
| "Get detailed itinerary" | ❌ No - need times/gates/etc |

---

## Next Steps

1. **Try 2-3 more queries** with different cities/dates
2. **See if results are consistent**
3. **Decide if current quality is good enough**

If you need more complete extraction:
- Consider using a **simpler flight site** (Kayak has more stable HTML)
- Or accept that **Google Flights needs manual review** after API gives you the price

**Don't re-record unless you've tested thoroughly and confirmed it's the recording that's the problem, not the AI agent's extraction capabilities.**

---

**Bottom line**: Your skill works! It just needs refinement, not re-recording. Test it more first! 🚀
