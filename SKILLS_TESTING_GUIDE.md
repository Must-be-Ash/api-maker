# Skills System - Testing Guide

## 🚀 Quick Start (5 Minutes)

**Your First Test - Copy These Exact Values:**

1. Navigate to: `http://localhost:3000/skills/record`

2. Fill in the form:
   - **Goal**: `Search for flights from Vancouver to LAX`
   - **Start URL**: `https://www.google.com/travel/flights`

3. Click **"Start Recording"** → Copy the Live View URL

4. Open Live View → Perform the search manually in the browser

5. Click **"Finish Recording"** → Wait for validation

6. View your skill at: `http://localhost:3000/skills`

---

## Prerequisites

### 1. Environment Variables
Make sure these are set in `.env.local`:

```bash
# Required for Skills System
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
MONGODB_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key

# Optional - for skill pricing
SKILL_CREATION_PRICE=1.99
SKILL_EXECUTION_PRICE=0.01
```

### 2. Start the Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## Testing Flow

### Option 1: UI Testing (Recommended for First Test)

#### Step 1: Navigate to Recording Page
```
http://localhost:3000/skills/record
```

You should see a 3-step interface:
1. **Step 1**: Start Recording
2. **Step 2**: Demonstrate Task
3. **Step 3**: Finish & Save

#### Step 2: Start Recording

1. Enter a **Goal**: `Search for flights from Vancouver to LAX`
2. Enter a **Start URL**: `https://www.google.com/travel/flights`
3. Click **"Start Recording"**

> **Note**: For your first test, use specific values. Later, try variables like `Search for flights from %origin% to %destination%` for reusable skills.

**Expected Response**:
```json
{
  "recordingId": "rec_1234567890_abc123",
  "sessionId": "sess_xyz789",
  "liveViewUrl": "https://www.browserbase.com/sessions/...",
  "status": "recording"
}
```

The Live View URL will open a real browser where you can demonstrate the task.

#### Step 3: Demonstrate Task in Live View

1. Click the **"Open Live View"** button
2. A new tab will open with Browserbase Live View
3. **Perform the task manually** in the browser:
   - Click elements
   - Fill in forms
   - Navigate between pages
4. All your actions are being recorded in real-time!

**What's Being Captured**:
- Clicks (with CSS selectors)
- Text inputs (with values)
- Navigation (with URLs)
- Each action gets a natural language description

#### Step 4: Finish Recording

1. Close the Live View tab
2. Back on the recording page, click **"Finish Recording"**
3. The system will:
   - Stop the recorder
   - Convert actions to Stagehand workflow
   - Validate by replaying the workflow
   - Save the skill to MongoDB

**Expected Response**:
```json
{
  "skillId": "skill_1234567890_abc123",
  "name": "Skill: Search for flights from Vancouver to LAX",
  "recordedActions": [...], // Your captured actions
  "stagehandWorkflow": [...], // Converted to Stagehand format
  "testResult": {
    "success": true
  },
  "metrics": {
    "totalTokens": 1234,
    "duration": 5000,
    "operations": 5
  }
}
```

#### Step 5: View Your Skill

Navigate to:
```
http://localhost:3000/skills
```

You should see your newly created skill in the gallery!

#### Step 6: Test Skill Execution

Click on your skill to see the details page:
```
http://localhost:3000/skills/[skillId]
```

Click **"Execute Skill"** to test the triple replay strategy.

**Expected**: The skill should execute using one of the three strategies:
1. ✅ **Exact Replay** (fastest, no AI)
2. ✅ **Natural Language** (AI-resilient)
3. ✅ **AI Re-learn** (ultimate fallback)

---

### Option 2: API Testing (For Developers)

#### Test 1: Start Recording

```bash
curl -X POST http://localhost:3000/api/skills/start-recording \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Search for flights from Vancouver to LAX",
    "startUrl": "https://www.google.com/travel/flights"
  }'
```

**Save the `recordingId` and `liveViewUrl` from the response.**

#### Test 2: Open Live View

Open the `liveViewUrl` in your browser and perform the task manually.

#### Test 3: Finish Recording

```bash
curl -X POST http://localhost:3000/api/skills/finish-recording \
  -H "Content-Type: application/json" \
  -d '{
    "recordingId": "rec_1234567890_abc123",
    "sessionId": "sess_xyz789"
  }'
```

**Save the `skillId` from the response.**

#### Test 4: Get Skill Details

```bash
curl http://localhost:3000/api/skills/skill_1234567890_abc123
```

#### Test 5: Execute Skill

```bash
curl -X POST http://localhost:3000/api/skills/skill_1234567890_abc123/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "NYC",
      "destination": "LAX"
    }
  }'
```

---

## Testing Scenarios

### Scenario 1: Flight Search (Your First Test)
**Goal**: `Search for flights from Vancouver to LAX`
**URL**: `https://www.google.com/travel/flights`

**Actions to Demonstrate**:
1. Click on origin field
2. Type "Vancouver"
3. Click on destination field
4. Type "LAX"
5. Click "Search" or "Explore"
6. (Optional) Click on a flight to see details

**Expected**: Skill should replay all actions with exact selectors (Strategy 1).

---

### Scenario 2: Reusable Flight Search (Second Test)
**Goal**: `Search for flights from %origin% to %destination%`
**URL**: `https://www.google.com/travel/flights`

**Actions to Demonstrate** (with example values):
1. Enter "Vancouver" in origin
2. Enter "LAX" in destination
3. Click search

**Execute with different cities**:
```json
{
  "variables": {
    "origin": "Toronto",
    "destination": "New York"
  }
}
```

**Expected**: Variable substitution works, skill is reusable.

---

### Scenario 3: Simple Form Fill
**Goal**: `Fill out contact form with name and email`
**URL**: `https://www.example.com/contact` (or any contact form)

**Actions to Demonstrate**:
1. Click "Name" field
2. Type "John Doe"
3. Click "Email" field
4. Type "john@example.com"
5. Click "Submit"

**Expected**: Simple workflow, exact selectors work reliably.

---

### Scenario 4: E-commerce Search
**Goal**: `Search for %product% on Amazon and view first result`
**URL**: `https://www.amazon.com`

**Actions to Demonstrate**:
1. Click search box
2. Type "laptop" (example)
3. Click search button
4. Click first result

**Expected**: Dynamic content requires natural language fallback (Strategy 2).

---

## Monitoring & Debugging

### 1. Check MongoDB

```bash
# View all skills
mongosh "your_mongodb_uri"
use your_database_name
db.skills.find().pretty()

# View all recording sessions
db.recording_sessions.find().pretty()

# View skill executions
db.skill_executions.find().pretty()
```

### 2. Check Logs

In your terminal running `pnpm dev`, watch for:

```
[startRecording] Starting recording workflow
[startRecordingStep] Browserbase session created: sess_...
[ActionRecorder] Action captured: click #search-button
[finishRecordingStep] Workflow validation successful
[executeSkillStep] Strategy 1 succeeded (Exact Replay)
```

### 3. Check Browserbase Dashboard

Visit: `https://www.browserbase.com/dashboard`

You should see:
- Session recordings
- Live View URLs
- Browser logs

---

## Troubleshooting

### Issue: "Live View URL not opening"
**Solution**: Check your Browserbase API key and project ID

### Issue: "Recording not capturing actions"
**Solution**:
- Make sure you're clicking in the Live View browser
- Check that ActionRecorder initialized successfully
- Look for `[ActionRecorder] Started recording` in logs

### Issue: "Skill execution fails"
**Solution**:
- Check if the website changed (selectors may be invalid)
- Try re-recording the skill
- Check Strategy 2 and 3 logs to see which fallback worked

### Issue: "MongoDB connection error"
**Solution**:
- Verify `MONGODB_URI` is correct
- Ensure MongoDB is running
- Check network/firewall settings

---

## Advanced Testing

### Test Variable Substitution (Second Test)

After your first skill works, try a reusable skill:

**Record with placeholders**:
```
Goal: "Search for flights from %origin% to %destination%"
Start URL: "https://www.google.com/travel/flights"
```

**Demonstrate with example values**:
- Enter "Vancouver" in origin field
- Enter "LAX" in destination field

**Execute with different variables**:
```bash
curl -X POST http://localhost:3000/api/skills/[skillId]/execute \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "origin": "Toronto",
      "destination": "Miami"
    }
  }'
```

The system will replace `%origin%` → "Toronto" and `%destination%` → "Miami" during execution!

### Test Triple Replay Strategy

1. Record a skill on a website
2. Modify the website (change CSS classes)
3. Execute the skill → Should fall back to Strategy 2 (Natural Language)
4. Completely change the website structure
5. Execute again → Should fall back to Strategy 3 (AI Re-learn)

---

## Expected Behavior

### ✅ Successful Flow
```
Start Recording
    ↓
Create Browserbase Session
    ↓
Open Live View
    ↓
Demonstrate Task (manual)
    ↓
Actions Captured (automatic)
    ↓
Finish Recording
    ↓
Validate Workflow (replay)
    ↓
Save Skill to MongoDB
    ↓
Execute Skill (triple replay)
    ↓
Success! 🎉
```

### Performance Expectations
- **Recording Start**: 2-5 seconds
- **Action Capture**: Real-time (< 100ms)
- **Workflow Validation**: 5-10 seconds
- **Skill Execution**:
  - Strategy 1 (Exact): 1-3 seconds
  - Strategy 2 (NL): 5-10 seconds
  - Strategy 3 (AI): 15-30 seconds

---

## Next Steps

Once you've confirmed the basic flow works:

1. **Create Multiple Skills**: Test different websites
2. **Test API Marketplace**: Create skills for sale
3. **Test Execution Logs**: Monitor performance metrics
4. **Test Error Handling**: Intentionally break workflows
5. **Test Scalability**: Execute multiple skills concurrently

---

**Happy Testing! 🚀**

For issues or questions, check the logs and MongoDB collections for detailed information.
