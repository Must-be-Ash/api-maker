User surfs the web, agent records and repeats - Automation Generator
Skills System - Browser Automation Recording & Replay

have a user do something on the web and it gets recorded and the agent can repeat the same task. You'll control the browser to perform the task, then click "Finish Recording" to generate the skill. You say what you want done, record yourself do it and that produces an API.

## Overall Objective & Goal

have a user do something on the web and it gets recorded and the agent can repeat the same task. You'll control the browser to 
perform the task, then click "Finish Recording" to generate the skill. You say what you want done, record yourself do it and that 
produces an API.

Build a **browser-use style "Skills" system** where users **demonstrate** what they want once, and get a reusable API endpoint that can be called repeatedly with different inputs.

**Core Value Proposition:**
- User describes what they want to automate
- User demonstrates the task visually (shows, doesn't just tell)
- System captures the demonstration and converts it to a reusable API
- API can be called repeatedly to perform the same task automatically

  The workflow:
  1. Describe what you want ("Extract product prices from Amazon")
  2. Mode: "Record yourself"
  3. You manually navigate, click, extract
  4. Click "Finish Recording"
  5. → API endpoint generated with input/output schemas
  6. Call the API repeatedly with different inputs
  
**Think of it as:** Zapier/n8n style workflow recording, but for browser automation - "Record yourself doing it once, get an API that does it forever."

---

## Implementation Method: Live View Recording + Stagehand Hybrid Replay

After comprehensive research, we've identified the **optimal approach: Live View Recording + Stagehand Hybrid Replay with Triple Replay Strategy**.

### Why This Hybrid Approach?

✅ **"Show don't tell"** - Users demonstrate visually (like browser-use)  
✅ **Triple replay strategy** - Exact selectors → Natural language → AI re-learn  
✅ **Best of both worlds** - Fast replay + AI resilience  
✅ **No CDP complexity** - Uses Playwright events (simpler)  
✅ **Works with existing stack** - Workflow + x402 + Browserbase  
✅ **Maximum reliability** - Three fallback strategies ensure success

---

## How It Works

### Recording Flow

1. **User describes goal** → "Extract product prices from Amazon"
2. **Live View opens** → Browserbase session with Live View URL
3. **User demonstrates manually** → Navigate, click, fill forms, extract data
4. **Playwright captures actions** → Monitors clicks, inputs, navigation via event listeners
5. **Convert to hybrid workflow** → Store BOTH exact selectors AND natural language instructions
6. **Validate** → Replay once to verify it works
7. **Save skill** → Store in MongoDB with hybrid format

### Execution Flow (Triple Replay Strategy)

When a skill is executed, the system tries three strategies in order until one succeeds:

**Strategy 1: Exact Selector Replay** ⚡ (Fastest - No LLM)
- Uses exact selectors from user demonstration
- Instant execution (1-3 seconds)
- Zero LLM costs
- Works when UI hasn't changed

**Strategy 2: Natural Language** 🧠 (AI-Resilient)
- Uses Stagehand's natural language instructions
- AI re-infers selectors if they've changed
- Slower (5-10 seconds) but handles UI changes
- Falls back if Strategy 1 fails

**Strategy 3: AI Re-learn** 🔄 (Ultimate Fallback)
- Uses Stagehand Agent mode
- AI re-learns the entire workflow from scratch
- Slowest but most reliable
- Only used if Strategies 1 & 2 fail

---

## Architecture Overview

### Recording Phase

```
User Describes Goal
    ↓
Create Browserbase Session with Live View
    ↓
User Demonstrates in Live View (manual control)
    ↓
Playwright Captures Actions (event listeners)
    ↓
Convert to Hybrid Workflow (exact + natural language)
    ↓
Validate by Replaying Once
    ↓
Save Skill to MongoDB
```

### Execution Phase

```
API Call with x402 Payment
    ↓
Load Skill from MongoDB
    ↓
Try Strategy 1: Exact Replay
    ↓ (if fails)
Try Strategy 2: Natural Language
    ↓ (if fails)
Try Strategy 3: AI Re-learn
    ↓
Return Result + Metadata
```

---

## Key Technical Decisions

### 1. Recording Method: Browserbase Live View
- User gets a Live View URL to control the browser manually
- No need for complex CDP monitoring
- Simple Playwright event listeners capture actions
- Visual feedback for users

### 2. Storage Format: Hybrid
- **Recorded Actions**: Exact user demonstration (selectors, values, URLs)
- **Stagehand Workflow**: Converted natural language instructions
- **History**: Validation run from Stagehand
- Both formats stored for maximum flexibility

### 3. Replay Strategy: Triple Fallback
- **90% of executions** use Strategy 1 (instant, free)
- **8% use Strategy 2** (slower, but works)
- **2% use Strategy 3** (slowest, but always works)
- Ensures maximum reliability and cost efficiency

### 4. Integration Points
- **Browserbase**: Session management, Live View, remote control
- **Stagehand**: Natural language browser automation, AI resilience
- **Workflow Framework**: Our existing workflow system for execution
- **x402**: Payment gating for skill creation ($1.99) and execution ($0.01)
- **MongoDB**: Skill storage and execution analytics

---

## Implementation Approach

### Phase 1: Core Recording Infrastructure
- Action capture system using Playwright events
- Start/finish recording workflows
- Hybrid workflow conversion

### Phase 2: Triple Replay Execution
- Exact selector replay (Strategy 1)
- Natural language replay (Strategy 2)
- AI re-learn fallback (Strategy 3)

### Phase 3: API Endpoints
- `/api/skills/start-recording` - Begin recording session
- `/api/skills/finish-recording` - Complete and save skill
- `/api/skills/[skillId]/execute` - Execute skill with triple replay

### Phase 4: UI Implementation
- Recording interface (describe → demonstrate → validate)
- Skills gallery (browse created skills)
- Skill details & testing page

---

## Success Criteria

✅ Users can demonstrate a task visually and get a working API  
✅ Skills execute reliably using triple replay strategy  
✅ Fast execution (Strategy 1) for 90% of cases  
✅ AI resilience (Strategy 2 & 3) handles UI changes  
✅ x402 payment integration working  
✅ MongoDB storage and analytics operational

---

## Why This Method Wins

| Feature | Pure AI | Pure CDP | Hybrid (Our Approach) |
|---------|---------|----------|----------------------|
| User demonstrates | ❌ No | ✅ Yes | ✅ Yes |
| Visual feedback | ❌ No | ✅ Yes | ✅ Yes |
| Fast replay | 🟡 Caching | ✅ Yes | ✅ Yes (Strategy 1) |
| AI resilience | ✅ Yes | ❌ No | ✅ Yes (Strategy 2 & 3) |
| UI changes handled | ✅ Yes | ❌ No | ✅ Yes (auto-fallback) |
| Accuracy | 🟡 Medium | ✅ High | ✅ Very High |
| Complexity | 🟢 Low | 🔴 High | 🟡 Medium |

---

## Next Steps

See `SKILLS_IMPLEMENTATION_PLAN.md` for detailed step-by-step implementation tasks, code examples, database schemas, and testing plans.

**Ready to build?** Start with Phase 1: Core Recording Infrastructure! 🚀
