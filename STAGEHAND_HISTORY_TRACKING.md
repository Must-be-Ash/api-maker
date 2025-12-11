# Stagehand Action History Tracking

**Status**: ✅ Implemented and Active
**Date**: 2025-12-10

---

## What Gets Tracked

Every execution now captures **complete Stagehand action history** - every act, extract, observe, navigate, and agent operation with:

- ✅ **Method type** (act, extract, observe, navigate, agent)
- ✅ **Input parameters** (instructions, schemas, etc.)
- ✅ **Results** (selectors used, data extracted, elements found)
- ✅ **Timestamps** (when each action occurred)

---

## Example: Flight Search Execution

When a skill searches for flights, you'll see step-by-step what the agent did:

```javascript
{
  stagehandHistory: [
    {
      method: "navigate",
      parameters: { url: "https://google.com/travel/flights" },
      result: { success: true },
      timestamp: "2025-12-10T15:09:03.544Z"
    },
    {
      method: "act",
      parameters: {
        instruction: "type 'Flights from Toronto to New York departing 2025-12-20 returning 2025-12-27' into the search bar and press Enter"
      },
      result: {
        elementId: "8-2959",
        description: "The search bar for flights where the user can type their query.",
        method: "type",
        arguments: ["Flights from Toronto to New York departing 2025-12-20 returning 2025-12-27"]
      },
      timestamp: "2025-12-10T15:09:25.462Z"
    },
    {
      method: "observe",
      parameters: { instruction: "Check page state" },
      result: {
        elements: [
          { type: "button", text: "Search" },
          { type: "input", label: "Where from?" }
        ]
      },
      timestamp: "2025-12-10T15:09:26.658Z"
    },
    {
      method: "act",
      parameters: { instruction: "type 'Toronto' into the origin input field" },
      result: {
        elementId: "8-3293",
        description: "The combobox labeled 'Where to?' for entering the origin location.",
        method: "fill",
        arguments: ["Toronto"]
      },
      timestamp: "2025-12-10T15:09:42.733Z"
    },
    {
      method: "act",
      parameters: { instruction: "type 'New York' into the destination input field" },
      result: {
        elementId: "8-3293",
        method: "fill",
        arguments: ["New York"]
      },
      timestamp: "2025-12-10T15:09:46.467Z"
    },
    {
      method: "extract",
      parameters: {
        instruction: "Extract the cheapest round-trip flight details",
        schema: {
          price: { type: "string", description: "Total price with currency symbol" },
          airline: { type: "string", description: "Airline name" },
          // ... full schema
        }
      },
      result: {
        price: "",        // ❌ Empty - extraction failed
        airline: "",
        route: "",
        // ... all fields empty
      },
      timestamp: "2025-12-10T15:10:25.630Z"
    }
  ],

  actionCounts: {
    navigate: 15,
    act: 10,
    observe: 3,
    extract: 2,
    agent: 0
  }
}
```

---

## Console Output During Execution

When a skill runs, you'll see:

```
========== EXECUTION SUMMARY ==========
Execution ID: exec_1765408...
Skill: Flight Search Skill
Variables: { origin: 'Toronto', destination: 'New York' }

--- Strategy Attempts ---
1. exact_replay: ✗ FAILED (7245ms)
   Error: Element not found: //*[@id="c322"]

2. natural_language: ✗ FAILED (12350ms)
   Error: StagehandServerError

3. ai_relearn: ✓ SUCCESS (68500ms)

--- Final Result ---
Success: false
Final Strategy: ai_relearn
Total Time: 88095 ms
Tokens Used: 720

--- Stagehand Action History ---
Total Actions: 30
Action Breakdown:
  navigate: 15
  act: 10
  observe: 3
  extract: 2

First Actions:
  1. [navigate] at 3:09:03 PM
  2. [act] at 3:09:25 PM
     → type 'Flights from Toronto to New York...' into the search bar
  3. [observe] at 3:09:26 PM
  4. [act] at 3:09:42 PM
     → type 'Toronto' into the origin input field
  5. [act] at 3:09:46 PM
     → type 'New York' into the destination input field

  ... (showing first 5 and last 5) ...

Last Actions:
  26. [act] at 3:10:17 PM
     → set departure date to 2025-12-20
  27. [observe] at 3:10:20 PM
  28. [act] at 3:10:23 PM
     → set return date to 2025-12-27
  29. [observe] at 3:10:24 PM
  30. [extract] at 3:10:25 PM
     → Extract the cheapest round-trip flight details

--- Session ---
Session URL: https://www.browserbase.com/sessions/...
Debug URL: https://www.browserbase.com/devtools/...
=======================================
```

---

## Query Examples

### Get Complete Action History

```javascript
db.execution_results.findOne({
  executionId: "exec_1765408..."
}).stagehandHistory
```

### Find All Actions of a Specific Type

```javascript
db.execution_results.aggregate([
  { $match: { skillId: "skill_xxx" } },
  { $unwind: "$stagehandHistory" },
  { $match: { "stagehandHistory.method": "extract" } },
  { $project: {
      timestamp: "$stagehandHistory.timestamp",
      instruction: "$stagehandHistory.parameters.instruction",
      result: "$stagehandHistory.result"
  }}
])
```

### Find Failed Actions

```javascript
db.execution_results.aggregate([
  { $unwind: "$stagehandHistory" },
  { $match: {
      $or: [
        { "stagehandHistory.result.error": { $exists: true } },
        { "stagehandHistory.result": null }
      ]
  }},
  { $project: {
      executionId: 1,
      method: "$stagehandHistory.method",
      instruction: "$stagehandHistory.parameters.instruction",
      error: "$stagehandHistory.result.error"
  }}
])
```

### Analyze Agent Behavior Patterns

```javascript
// Find all "observe" calls to see what agent was checking
db.execution_results.aggregate([
  { $unwind: "$stagehandHistory" },
  { $match: { "stagehandHistory.method": "observe" } },
  { $project: {
      skillId: 1,
      timestamp: "$stagehandHistory.timestamp",
      instruction: "$stagehandHistory.parameters.instruction",
      elementsFound: { $size: { $ifNull: ["$stagehandHistory.result.elements", []] } }
  }},
  { $sort: { timestamp: 1 } }
])
```

### Compare Successful vs Failed Extractions

```javascript
db.execution_results.aggregate([
  { $unwind: "$stagehandHistory" },
  { $match: { "stagehandHistory.method": "extract" } },
  {
    $project: {
      executionId: 1,
      instruction: "$stagehandHistory.parameters.instruction",
      hasData: {
        $cond: {
          if: { $ne: ["$stagehandHistory.result.price", ""] },
          then: true,
          else: false
        }
      },
      result: "$stagehandHistory.result"
    }
  },
  {
    $group: {
      _id: "$hasData",
      count: { $sum: 1 },
      examples: { $push: "$$ROOT" }
    }
  }
])
```

### Find Skills That Use Too Many Actions

```javascript
db.execution_results.find({
  "actionCounts.act": { $gt: 20 }  // More than 20 act() calls
}).sort({ "actionCounts.act": -1 })
```

---

## What You Can Learn From History

### 1. **Debugging Failed Executions**

See **exactly where** the agent got stuck:

```javascript
// Last action before failure
const lastAction = result.stagehandHistory[result.stagehandHistory.length - 1];

if (lastAction.method === 'act' && !lastAction.result.success) {
  console.log('Agent failed at:', lastAction.parameters.instruction);
  console.log('Tried selector:', lastAction.result.selector);
}
```

### 2. **Understanding Agent Decisions**

See **what the agent saw** before making decisions:

```javascript
// Find observe calls before extract
const observeBeforeExtract = result.stagehandHistory
  .filter((entry, i, arr) => {
    return entry.method === 'observe' &&
           arr[i + 1]?.method === 'extract';
  });

// What did the agent see before extracting?
observeBeforeExtract.forEach(obs => {
  console.log('Agent observed:', obs.result.elements.length, 'elements');
  console.log('Then extracted:', obs.result);
});
```

### 3. **Identifying Performance Bottlenecks**

Find **slow operations**:

```javascript
const timings = result.stagehandHistory.map((entry, i, arr) => {
  if (i === 0) return null;

  const prevTime = new Date(arr[i - 1].timestamp).getTime();
  const currTime = new Date(entry.timestamp).getTime();
  const duration = currTime - prevTime;

  return {
    action: entry.method,
    instruction: entry.parameters.instruction,
    duration
  };
}).filter(Boolean).sort((a, b) => b.duration - a.duration);

console.log('Slowest actions:', timings.slice(0, 5));
```

### 4. **Tracking Variable Substitution**

See **where variables were used**:

```javascript
result.stagehandHistory.forEach(entry => {
  if (entry.parameters?.instruction?.includes('Toronto')) {
    console.log('Used "origin" variable at:', entry.timestamp);
    console.log('Action:', entry.parameters.instruction);
  }
});
```

### 5. **Comparing Strategy Efficiency**

```javascript
db.execution_results.aggregate([
  {
    $project: {
      strategy: "$finalStrategy",
      actionCount: { $size: "$stagehandHistory" },
      success: 1
    }
  },
  {
    $group: {
      _id: "$strategy",
      avgActions: { $avg: "$actionCount" },
      successRate: { $avg: { $cond: ["$success", 1, 0] } }
    }
  }
])

// Result:
// exact_replay: 12 actions avg, 75% success
// natural_language: 18 actions avg, 55% success
// ai_relearn: 30 actions avg, 45% success
```

---

## Real-World Use Cases

### Use Case 1: Why Did Extraction Fail?

**Question**: "Why didn't my flight search extract any data?"

**Query**:
```javascript
const result = db.execution_results.findOne({
  executionId: "exec_xxx",
  "validation.valid": false
});

// Look at extract action
const extractAction = result.stagehandHistory.find(e => e.method === 'extract');

console.log('Extract instruction:', extractAction.parameters.instruction);
console.log('Result:', extractAction.result);

// Check what happened before extraction
const prevActions = result.stagehandHistory.slice(
  Math.max(0, result.stagehandHistory.indexOf(extractAction) - 3),
  result.stagehandHistory.indexOf(extractAction)
);

console.log('Actions before extract:', prevActions);
```

**Answer**: "The agent didn't set the return date, so the search never ran, so there were no results to extract."

---

### Use Case 2: Which Selectors Keep Failing?

**Question**: "Why does Strategy 1 always fail for flight searches?"

**Query**:
```javascript
db.execution_results.aggregate([
  { $match: { skillId: "skill_flight_search" } },
  { $unwind: "$stagehandHistory" },
  { $match: {
      "stagehandHistory.method": "act",
      "stagehandHistory.result.error": { $exists: true }
  }},
  {
    $group: {
      _id: "$stagehandHistory.result.selector",
      failureCount: { $sum: 1 },
      instructions: { $addToSet: "$stagehandHistory.parameters.instruction" }
    }
  },
  { $sort: { failureCount: -1 } }
])
```

**Answer**: "Selector `//*[@id='c322']` fails 100% of the time because it's dynamically generated."

---

### Use Case 3: How Long Does Each Step Take?

**Question**: "What's slowing down my skill execution?"

```javascript
const result = db.execution_results.findOne({ executionId: "exec_xxx" });

const durations = result.stagehandHistory.map((entry, i, arr) => {
  if (i === 0) return null;

  return {
    step: i,
    action: entry.method,
    instruction: entry.parameters.instruction?.substring(0, 50),
    durationMs: new Date(entry.timestamp) - new Date(arr[i-1].timestamp)
  };
}).filter(Boolean);

// Find slowest
const slowest = durations.sort((a,b) => b.durationMs - a.durationMs).slice(0, 5);
console.table(slowest);
```

**Answer**: "The 'observe' call after clicking search takes 8 seconds - the page is loading slowly."

---

## Viewing History in Tools

### MongoDB Compass

1. Query: `{ skillId: "your_skill_id" }`
2. Expand `stagehandHistory` array
3. Click through each entry to see parameters and results

### Query Script

```bash
MONGODB_URI="..." npx tsx scripts/query-execution-results.ts
```

Shows formatted history in console with:
- Total actions
- Action breakdown (act: 10, extract: 2, etc.)
- First 5 and last 5 actions with details
- Tip for querying full details in MongoDB

---

## Data Structure Reference

```typescript
interface StagehandHistoryEntry {
  method: 'act' | 'extract' | 'observe' | 'navigate' | 'agent';

  parameters: {
    instruction?: string;      // For act, observe
    url?: string;              // For navigate
    schema?: any;              // For extract
    systemPrompt?: string;     // For agent
    [key: string]: any;
  };

  result: {
    // For 'act':
    elementId?: string;
    selector?: string;
    method?: string;           // 'click', 'fill', 'type'
    arguments?: any[];

    // For 'extract':
    [fieldName: string]: any;  // Extracted data fields

    // For 'observe':
    elements?: Array<{
      type: string;
      text?: string;
      label?: string;
      [key: string]: any;
    }>;

    // For errors:
    error?: {
      message: string;
      code?: string;
    };

    [key: string]: any;
  };

  timestamp: string;  // ISO 8601: "2025-12-10T15:09:25.462Z"
}
```

---

## Performance Considerations

**Storage Impact**: Each execution adds ~5-50KB depending on action count
- Simple skills: ~10 actions = ~5KB
- Complex skills: ~50 actions = ~30KB
- Agent-based: ~100+ actions = ~50KB+

**Query Performance**: Index on `executionId` and `skillId` recommended:

```javascript
db.execution_results.createIndex({ executionId: 1 });
db.execution_results.createIndex({ skillId: 1, createdAt: -1 });
db.execution_results.createIndex({ "stagehandHistory.method": 1 });
```

---

## Next Steps

1. **Execute your new skill** and check the history
2. **Query the history** to see what the agent did
3. **Analyze failures** by looking at the last few actions
4. **Optimize skills** by identifying slow or redundant actions
5. **Build better prompts** based on what observe() returns

**Complete visibility into every action the agent takes** - no more guessing! 🎯
