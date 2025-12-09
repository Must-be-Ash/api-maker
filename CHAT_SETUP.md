# Flight Search Chat Interface - Setup Guide

This guide shows you how to create and test a natural language flight search API using the Skills system.

## 🎯 What We're Building

A chat interface where you can ask:
- "How much is the cheapest round trip flight from Vancouver to LAX from December 6th to 14th?"
- "Find me flights from Toronto to Miami departing January 10th, returning January 20th"

The system will:
1. Parse your natural language query using GPT-4
2. Execute the recorded browser automation skill
3. Return flight search results

---

## 📋 Prerequisites

- ✅ Skills system is working (you've already tested basic recording)
- ✅ OpenAI API key is set in `.env.local`
- ✅ Browserbase credentials configured

---

## 🚀 Setup Steps

### Step 1: Record the Flight Search Skill

1. Navigate to: `http://localhost:3000/skills/record`

2. Enter the following:

   **Goal:**
   ```
   Search for round trip flights from %origin% to %destination% departing on %departureDate% and returning on %returnDate% and find the cheapest option
   ```

   **Start URL:**
   ```
   https://www.google.com/travel/flights
   ```

3. Click **"Start Recording"**

4. In the Live View browser window, perform these actions:
   - Type "Vancouver" in the origin field
   - Type "LAX" in the destination field
   - Click on the date selector
   - Select "December 6, 2025" as departure date
   - Select "December 14, 2025" as return date
   - Click "Search" button
   - Wait for results to load (5-10 seconds)
   - Optionally click on a flight option to see details

5. Click **"Finish Recording"**

6. **IMPORTANT**: Copy the Skill ID that appears (format: `skill_1234567890_abc123`)

---

### Step 2: Configure Environment Variable

Open `.env.local` and replace the placeholder:

```bash
# Find this line:
FLIGHT_SEARCH_SKILL_ID=YOUR_SKILL_ID_HERE

# Replace with your actual skill ID:
FLIGHT_SEARCH_SKILL_ID=skill_1234567890_abc123
```

**Restart your dev server** after updating the env variable:
```bash
# Stop the server (Ctrl+C)
pnpm dev
```

---

### Step 3: Test the Chat Interface

1. Navigate to: `http://localhost:3000/chat`

2. Try these example queries:
   - "How much is the cheapest round trip flight from Vancouver to LAX from December 6th to 14th?"
   - "Find flights from Seattle to Portland on December 15th"
   - "What's the price for a round trip from NYC to Boston departing Jan 5, returning Jan 10?"

3. The system will:
   - Parse your query to extract origin, destination, and dates
   - Execute the skill with those parameters
   - Show you the results

---

## 🧪 How It Works

### Architecture

```
User Types Query
    ↓
/api/chat
    ↓
GPT-4 parses natural language
    ↓
Extract: origin, destination, dates
    ↓
Call /api/skills/[skillId]/execute
    ↓
Skill runs (Triple Replay Strategy)
    ↓
Return formatted results
```

### Query Parsing

The chat API uses GPT-4 to extract structured data from natural language:

```
Input: "cheapest flight from Vancouver to LAX December 6 to 14"

Parsed:
{
  origin: "Vancouver",
  destination: "LAX",
  departureDate: "2025-12-06",
  returnDate: "2025-12-14",
  tripType: "roundtrip"
}
```

### Skill Execution

The skill uses the triple replay strategy:
1. **Strategy 1**: Try exact selectors (fastest)
2. **Strategy 2**: Use natural language (AI-resilient)
3. **Strategy 3**: AI agent re-learns the task (ultimate fallback)

---

## 🔍 Debugging

### Check Skill ID

Verify your skill exists:
```bash
curl http://localhost:3000/api/skills/YOUR_SKILL_ID
```

### Test Skill Manually

Execute the skill directly with test data:
```bash
curl -X POST http://localhost:3000/api/skills/YOUR_SKILL_ID/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "Vancouver",
      "destination": "LAX",
      "departureDate": "2025-12-06",
      "returnDate": "2025-12-14"
    }
  }'
```

### View Logs

Watch the terminal where `pnpm dev` is running for:
- `[POST /api/chat]` - Chat API logs
- `[executeSkillStep]` - Skill execution logs
- `[executeExactReplay]` / `[executeNaturalLanguage]` / `[executeAIRelearn]` - Strategy logs

---

## 📊 Expected Results

### Successful Query Response

```
✅ Flight Search Results

🛫 Route: Vancouver → LAX
📅 Dates: 2025-12-06 to 2025-12-14

⚡ Strategy used: ai_relearn
⏱️ Execution time: 45.2s

📝 Completed the search for flights...

🔗 View session recording
```

### Strategy Breakdown

| Strategy | Speed | Success Rate | Use Case |
|----------|-------|--------------|----------|
| Exact Replay | 1-3s | 70% | UI unchanged |
| Natural Language | 5-10s | 20% | Minor UI changes |
| AI Re-learn | 30-60s | 10% | Major UI changes |

---

## 🎨 Customization Ideas

### Add More Skills

You can record additional skills and add them to the chat interface:
- Hotel search
- Restaurant reservations
- Product price comparison
- Stock price lookup

### Enhance the Chat API

Modify `/app/api/chat/route.ts` to:
- Support multiple skills (routing based on query type)
- Add conversation history
- Stream responses in real-time
- Cache recent queries

### Improve the UI

Enhance `/app/chat/page.tsx` with:
- Rich formatting for flight results
- Image previews
- Price comparison charts
- Booking links

---

## 🐛 Common Issues

### Issue: "Skill not found"

**Solution**: Make sure you've:
1. Copied the correct skill ID after recording
2. Updated `FLIGHT_SEARCH_SKILL_ID` in `.env.local`
3. Restarted the dev server

### Issue: All strategies failing

**Solution**: The website structure may have changed significantly. Try:
1. Re-record the skill with updated actions
2. Simplify the demonstration (fewer steps)
3. Check Browserbase session logs for errors

### Issue: Query not parsing correctly

**Solution**: Make your query more explicit:
- ❌ "Vancouver to LAX next week"
- ✅ "Vancouver to LAX departing December 6th, returning December 14th"

---

## 🎉 Success!

You now have a working natural language API for flight searches! This demonstrates the full power of the Skills system:

1. ✅ **Visual demonstration** - You showed what to do, not just told
2. ✅ **Reusable API** - One recording, infinite executions
3. ✅ **LLM integration** - Natural language queries work seamlessly
4. ✅ **AI resilience** - Triple replay strategy handles changes

**Try recording more skills** and build a complete automation API marketplace! 🚀
