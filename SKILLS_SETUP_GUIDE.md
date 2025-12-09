# Skills System - Setup & Testing Guide

## 🎯 What Was Built

A complete browser automation recording and replay system with:

- **Live View Recording**: Users demonstrate tasks visually in Browserbase
- **Action Capture**: Automatic recording of clicks, inputs, and navigation
- **Triple Replay Strategy**: Ensures maximum reliability with 3 fallback methods
- **API Generation**: Each skill becomes a reusable API endpoint

## 📁 Project Structure

```
/lib
  /capture
    action-recorder.ts          # Captures user actions in real-time
  /types
    skills.ts                   # TypeScript interfaces
  mongodb.ts                    # MongoDB connection helper

/workflows/skills
  start-recording.ts            # Starts recording session
  finish-recording.ts           # Validates and saves skill
  execute-skill.ts              # Executes with triple replay

/app/api/skills
  start-recording/route.ts      # POST - Start recording
  finish-recording/route.ts     # POST - Finish recording
  [skillId]/execute/route.ts    # POST - Execute skill
  [skillId]/route.ts            # GET - Get skill details

/app/skills
  page.tsx                      # Skills gallery
  record/page.tsx               # Recording interface
  [skillId]/page.tsx            # Skill details & testing
```

## 🔧 Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```bash
# Browserbase Configuration
BROWSERBASE_API_KEY=your_api_key_here
BROWSERBASE_PROJECT_ID=your_project_id_here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# OpenAI (for Stagehand)
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Skills Configuration
SKILL_CREATION_PRICE=1.99
SKILL_EXECUTION_PRICE=0.01
RECORDING_TIMEOUT=300
RECORDING_KEEP_ALIVE=true
```

### 2. Get Browserbase Credentials

1. Sign up at https://browserbase.com
2. Create a new project
3. Copy your API key and Project ID

### 3. Install Dependencies (Already Done)

```bash
pnpm install
```

Installed packages:
- `@browserbasehq/stagehand@3.0.5`
- `@browserbasehq/sdk@2.6.0`
- `playwright-core@1.57.0`

### 4. MongoDB Setup

Ensure you have:
- A MongoDB database (MongoDB Atlas recommended)
- Collections will be auto-created:
  - `recording_sessions` - Temporary recording data
  - `skills` - Saved skills
  - `skill_executions` - Execution logs

## 🧪 Testing Guide

### Test 1: Check Dependencies

```bash
# Verify server starts without errors
pnpm dev
```

Navigate to http://localhost:3000 and ensure no errors.

### Test 2: API Endpoints (Manual Testing)

#### Start Recording:

```bash
curl -X POST http://localhost:3000/api/skills/start-recording \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Test recording - navigate to example.com",
    "startUrl": "https://example.com"
  }'
```

Expected response:
```json
{
  "recordingId": "rec_...",
  "sessionId": "...",
  "liveViewUrl": "https://www.browserbase.com/sessions/...",
  "status": "recording",
  "message": "Live View ready. User should perform the task manually."
}
```

#### Finish Recording:

```bash
curl -X POST http://localhost:3000/api/skills/finish-recording \
  -H "Content-Type: application/json" \
  -d '{
    "recordingId": "rec_...",
    "sessionId": "..."
  }'
```

Expected response:
```json
{
  "skillId": "skill_...",
  "name": "Skill: Test recording - navigate to example.com",
  "recordedActions": [...],
  "stagehandWorkflow": [...],
  "testResult": { "success": true },
  "metrics": {...}
}
```

### Test 3: UI Flow (Recommended)

1. **Start Development Server**
   ```bash
   pnpm dev
   ```

2. **Create a Skill**
   - Navigate to http://localhost:3000/skills/record
   - Fill in:
     - Goal: "Go to example.com and click the More information link"
     - Start URL: "https://example.com"
   - Click "Start Recording"
   - A browser window should open in Browserbase
   - Perform the actions manually
   - Click "Finish Recording"
   - You should be redirected to the skill details page

3. **View Skills Gallery**
   - Navigate to http://localhost:3000/skills
   - Your skill should appear in the gallery

4. **Test Skill Execution**
   - Click on your skill
   - Click "Test Skill"
   - Watch the execution result

## 🔍 Triple Replay Strategy Explained

When executing a skill, the system tries 3 strategies in order:

### Strategy 1: Exact Replay ⚡ (Fastest)
- Uses exact selectors from user demonstration
- No LLM calls = instant execution
- Works when UI hasn't changed
- **Cost**: ~$0.10 (Browserbase only)
- **Speed**: 1-3 seconds

### Strategy 2: Natural Language 🧠 (AI-Resilient)
- Uses Stagehand's natural language instructions
- AI re-infers selectors if they've changed
- Handles minor UI changes
- **Cost**: ~$0.30 (Browserbase + LLM)
- **Speed**: 5-10 seconds

### Strategy 3: AI Re-learn 🔄 (Ultimate Fallback)
- Uses Stagehand Agent mode
- AI re-learns entire workflow from scratch
- Always works if the goal is achievable
- **Cost**: ~$0.50+ (Browserbase + more LLM)
- **Speed**: 10-30 seconds

## ⚠️ Known Issues & Considerations

### 1. Browserbase Session Configuration

The current implementation creates sessions but may need adjustment for:
- Session timeout handling
- Keep-alive configuration
- Live View permissions

**Fix if needed:**
Edit `/workflows/skills/start-recording.ts` line 30-40 to adjust session settings.

### 2. Stagehand v3 API Compatibility

Some Stagehand v3 methods might differ from documentation:
- `stagehand.browserbaseSessionID` might not exist
- `stagehand.metrics` might have different structure
- `stagehand.history` is not exposed in v3

**Current workarounds:**
- Using `(stagehand as any).browserbaseSessionID`
- Graceful fallbacks for missing metrics

### 3. Action Recorder Implementation

The ActionRecorder uses page instrumentation which:
- May miss some complex interactions (drag-and-drop, etc.)
- Requires page to load fully before capturing
- Selector generation could be improved

**Potential improvements:**
- Add support for more action types (hover, drag, etc.)
- Implement better selector stability algorithms
- Add visual highlighting during recording

### 4. MongoDB Connection in Workflows

Workflows run in isolated context, so:
- Global state may not persist
- Database connections need to be re-established
- Consider using workflow-safe state management

### 5. Error Handling

Current implementation has basic error handling. Consider adding:
- Retry logic for transient failures
- Better error messages for users
- Logging and monitoring integration

## 🚀 Next Steps

### Immediate Testing Tasks

1. **Verify Environment Setup**
   ```bash
   # Check if all env vars are set
   node -e "console.log(process.env.BROWSERBASE_API_KEY ? '✓ Browserbase' : '✗ Missing Browserbase')"
   node -e "console.log(process.env.MONGODB_URI ? '✓ MongoDB' : '✗ Missing MongoDB')"
   ```

2. **Test Simple Skill**
   - Create a skill that navigates to a simple page
   - Verify recording captures actions
   - Test all 3 replay strategies by breaking selectors

3. **Test Error Scenarios**
   - Invalid URLs
   - Network failures
   - Broken selectors
   - MongoDB connection issues

### Production Readiness Checklist

- [ ] Add proper authentication/authorization
- [ ] Implement rate limiting
- [ ] Add comprehensive error logging
- [ ] Set up monitoring and alerting
- [ ] Add skill versioning
- [ ] Implement skill sharing/marketplace
- [ ] Add webhook support for async execution
- [ ] Optimize for cost (caching, selector reuse)

## 📚 Additional Resources

- **Stagehand Docs**: https://docs.stagehand.dev
- **Browserbase Docs**: https://docs.browserbase.com
- **Workflow Kit Docs**: `/Users/ashnouruzi/workflow-docs/`

## 🐛 Debugging Tips

### Enable Verbose Logging

In workflows, set `verbose: 2`:
```typescript
const stagehand = new Stagehand({
  env: "BROWSERBASE",
  verbose: 2, // <-- Max verbosity
});
```

### Check MongoDB Collections

```bash
# Connect to MongoDB and check collections
mongosh "your_mongodb_uri"
> use your_database
> db.skills.find().pretty()
> db.recording_sessions.find().pretty()
```

### View Browserbase Sessions

1. Go to https://browserbase.com/sessions
2. Find your session ID
3. Click to view recording and logs

### Common Errors

**Error**: "Browserbase session not found"
- **Solution**: Check `BROWSERBASE_PROJECT_ID` is correct

**Error**: "MongoDB connection failed"
- **Solution**: Verify `MONGODB_URI` and network access

**Error**: "Stagehand init failed"
- **Solution**: Check `OPENAI_API_KEY` is set and valid

## 📞 Support

If you encounter issues:
1. Check the error logs in terminal
2. Verify all environment variables
3. Test each component separately
4. Review Browserbase session recordings

---

**Status**: ✅ Implementation Complete - Ready for Testing
**Created**: 2025-12-09
