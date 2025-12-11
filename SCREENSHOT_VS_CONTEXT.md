
  2. Would Screenshots Help Strategy 3?

  Short answer: YES, but with important caveats.

  Current Strategy 3 (Agent Mode)

  File: /workflows/steps/execute-skill-step.ts → executeAIRelearn()

  How it currently works:
  async function executeAIRelearn(
    stagehand: any,
    goal: string,
    variables: Record<string, any>,
    startUrl: string
  ) {
    // Substitute variables in goal text
    let expandedGoal = goal;
    Object.entries(variables).forEach(([key, val]) => {
      expandedGoal = expandedGoal.replace(`%${key}%`, String(val));
    });

    // Navigate to start
    await stagehand.page.goto(startUrl);

    // Let agent navigate based on goal
    await stagehand.agent(expandedGoal);
  }

  What the agent sees: The current page DOM (accessibility tree) + the goal text

  What the agent does NOT see: What the user did during recording

  ---
  Proposed Enhancement: Recording Screenshots

  Benefits:

  ✅ Visual context from recording
  - Agent sees what the user was looking at when they clicked
  - Helps with ambiguous UI (multiple buttons that look similar)
  - Shows successful path through the site

  ✅ Better error recovery
  - If agent gets stuck, can compare current screenshot to recorded ones
  - "At this step during recording, the page looked like this..."

  ✅ UI redesign handling
  - If site layout changed, screenshots show old vs. new
  - Agent can find equivalent elements in new design

  How to implement:

  // During recording (in action-recorder.ts):
  async function captureActionWithScreenshot(action: RecordedAction, page: Page) {
    const screenshot = await page.screenshot({
      type: 'png',
      encoding: 'base64',
      fullPage: false // Just viewport
    });

    return {
      ...action,
      screenshot, // Base64 encoded image
      viewportSize: await page.viewportSize()
    };
  }

  // Store screenshots in MongoDB with actions
  {
    recordedActions: [
      {
        type: 'click',
        description: 'Click departure date',
        screenshot: 'iVBORw0KGgoAAAANSUhEUgAA...',
        timestamp: 1234567890
      }
    ]
  }

  During Strategy 3 execution:

  async function executeAIRelearn(
    stagehand: any,
    goal: string,
    variables: Record<string, any>,
    startUrl: string,
    recordedActions: RecordedAction[] // NEW: Pass recorded actions with screenshots
  ) {
    // Build context from recorded screenshots
    const recordingContext = buildRecordingContext(recordedActions);

    const enhancedGoal = `
  Goal: ${expandedGoal}

  Recording Context (what the user did):
  ${recordingContext}

  Instructions:
  - Try to follow a similar path as shown in the recording
  - If the UI looks different, find equivalent elements
  - The screenshots show the successful path from the recording
    `;

    await stagehand.agent(enhancedGoal);
  }

  function buildRecordingContext(actions: RecordedAction[]): string {
    return actions
      .filter(a => a.screenshot)
      .map((action, i) => `
  Step ${i + 1}: ${action.description}
  [Screenshot shows: ${action.description}]
  Timestamp: ${action.timestamp}
      `)
      .join('\n');
  }

  ---
  Challenges with Screenshots

  ❌ Storage cost
  - Screenshots are large (50-200KB each)
  - 20 actions = 1-4MB per skill
  - Multiply by thousands of skills = expensive storage

  ❌ LLM context limits
  - GPT-4o supports vision, but context is limited
  - Can't pass 50 screenshots in one prompt
  - Would need to selectively choose which screenshots to include

  ❌ Privacy concerns
  - Screenshots might contain sensitive user data
  - Need to redact/blur personal information
  - Legal/compliance issues

  ❌ Performance
  - Uploading/encoding screenshots slows down recording
  - Vision API calls are slower and more expensive than text-only

  ---
  Better Alternative: Selective Screenshot Strategy

  Instead of capturing ALL screenshots, capture key decision points:

  function shouldCaptureScreenshot(action: RecordedAction): boolean {
    // Only capture screenshots for ambiguous/complex interactions
    return (
      action.semanticType === 'date-picker' ||
      action.semanticType === 'dropdown' ||
      action.description.includes('select') ||
      action.description.includes('choose') ||
      // Capture first action on each unique URL
      isFirstActionOnPage(action)
    );
  }

  Optimized storage:
  - ~5 screenshots per skill instead of 20+
  - Store as compressed JPEGs (10-30KB each)
  - 150KB total per skill (reasonable)

  ---
  Hybrid Approach (Recommended)

  Use screenshots ONLY when Strategy 3 is stuck:

  async function executeAIRelearnWithScreenshotFallback(
    stagehand: any,
    goal: string,
    variables: Record<string, any>,
    startUrl: string,
    recordedActions: RecordedAction[]
  ) {
    // First attempt: Text-only (cheaper)
    try {
      await stagehand.agent(expandedGoal, { maxIterations: 10 });
    } catch (error) {
      // If agent gets stuck, provide screenshot context
      console.log('[Strategy 3] Agent stuck, providing screenshot context...');

      const currentStep = determineCurrentStep(stagehand.history);
      const relevantScreenshot = findRelevantScreenshot(recordedActions, currentStep);

      if (relevantScreenshot) {
        const enhancedPrompt = `
  ${expandedGoal}

  You seem to be stuck. Here's what the page looked like at this step during the successful 
  recording:
  [Provide screenshot as vision input]

  Current page may look different due to UI updates. Find equivalent elements.
        `;

        await stagehand.agent(enhancedPrompt, {
          visionInput: relevantScreenshot.screenshot
        });
      }
    }
  }

  ---
  Recommendation

  1. For now: Don't implement screenshots. Focus on semantic value capture (the plan I wrote above)
  which will make Strategy 2 work better.
  2. Phase 2 (future): Add selective screenshot capture for:
    - First action on each page
    - Date picker interactions
    - Dropdown selections
    - Any action marked as "high ambiguity"
  3. Phase 3 (advanced): Use screenshots as fallback context in Strategy 3 when agent gets stuck

  Why this priority?
  - Semantic value capture (dates, dropdowns) has higher ROI
    - Makes Strategy 2 work (faster, cheaper than Strategy 3)
    - Works for 90% of cases
    - No storage/privacy concerns
  - Screenshots are nice-to-have
    - Only helps the 2% of cases that reach Strategy 3
    - Only helps when agent is truly stuck (rare)
    - High storage/privacy cost
