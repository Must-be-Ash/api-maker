import type {
  FinishRecordingInput,
  FinishRecordingOutput,
  RecordedAction,
  StagehandAction,
  SkillMetrics,
} from "@/lib/types/skills";

/**
 * Finish Recording Step
 *
 * Stops the action recorder, converts recorded actions to Stagehand workflow,
 * validates the workflow, and saves the skill to MongoDB.
 */
export async function finishRecordingStep(input: FinishRecordingInput): Promise<FinishRecordingOutput> {
  "use step";

  console.log('[finishRecordingStep] Finishing recording', input);

  // Stop action recorder if it exists
  const activeRecorder = (global as any).activeRecorders?.[input.recordingId];
  if (activeRecorder) {
    await activeRecorder.recorder.stopRecording();
    console.log('[finishRecordingStep] Stopped action recorder');

    // Close the Stagehand session
    try {
      await activeRecorder.stagehand.close();
    } catch (error) {
      console.log('[finishRecordingStep] Error closing Stagehand session:', error);
    }

    // Clean up global reference
    delete (global as any).activeRecorders[input.recordingId];
  }

  // Dynamically import MongoDB helper
  const { connectDB } = await import("@/lib/mongodb");

  // Load recording session from MongoDB
  const db = await connectDB();
  const recording = await db.collection('recording_sessions').findOne({
    recordingId: input.recordingId,
  });

  if (!recording) {
    throw new Error(`Recording ${input.recordingId} not found`);
  }

  console.log('[finishRecordingStep] Loaded recording session:', {
    recordingId: input.recordingId,
    actionsCount: recording.recordedActions?.length || 0,
  });

  // Convert recorded actions to Stagehand workflow
  const stagehandWorkflow = convertToStagehand(recording.recordedActions || []);

  console.log('[finishRecordingStep] Converted to Stagehand workflow:', {
    workflowSteps: stagehandWorkflow.length,
  });

  // Validate workflow by replaying it
  let testResult: { success: boolean; error?: string } = { success: false };
  let history: any[] = [];
  let metrics: SkillMetrics = {
    totalTokens: 0,
    duration: 0,
    operations: recording.recordedActions?.length || 0,
  };

  try {
    // Dynamically import Stagehand for validation
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      verbose: 1,
      modelName: "gpt-4o", // Use OpenAI GPT-4o for AI operations
    });

    await stagehand.init();
    const page = stagehand.context.pages()[0];

    console.log('[finishRecordingStep] Validating workflow by replaying');

    const startTime = Date.now();

    await replayWorkflow(stagehand, page, stagehandWorkflow);

    const duration = Date.now() - startTime;

    // Get metrics if available
    const stagehandMetrics = await stagehand.metrics;
    metrics = {
      totalTokens: (stagehandMetrics?.totalPromptTokens || 0) + (stagehandMetrics?.totalCompletionTokens || 0),
      duration,
      operations: stagehandWorkflow.length,
    };

    testResult = { success: true };
    console.log('[finishRecordingStep] Workflow validation successful');

    await stagehand.close();
  } catch (error) {
    console.error('[finishRecordingStep] Workflow validation failed:', error);
    testResult = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  // Generate skill ID
  const skillId = `skill_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  // Save skill to MongoDB
  await db.collection('skills').insertOne({
    skillId,
    name: `Skill: ${recording.goal.substring(0, 50)}`,
    goal: recording.goal,
    startUrl: recording.startUrl,

    // HYBRID STORAGE
    recordedActions: recording.recordedActions || [],
    stagehandWorkflow,
    history,

    replayStrategy: 'hybrid',
    successfulRun: testResult.success,
    metrics,

    sessionId: input.sessionId,
    recordingSessionUrl: recording.liveViewUrl,

    price: parseFloat(process.env.SKILL_EXECUTION_PRICE || '0.01'),

    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('[finishRecordingStep] Skill saved to database:', skillId);

  // Mark recording as finished
  await db.collection('recording_sessions').updateOne(
    { recordingId: input.recordingId },
    { $set: { status: 'finished', updatedAt: new Date().toISOString() } }
  );

  return {
    skillId,
    name: `Skill: ${recording.goal.substring(0, 50)}`,
    recordedActions: recording.recordedActions || [],
    stagehandWorkflow,
    testResult,
    metrics,
  };
}

/**
 * Convert recorded actions to Stagehand workflow format
 */
function convertToStagehand(actions: RecordedAction[]): StagehandAction[] {
  return actions.map(action => {
    if (action.type === 'navigate') {
      return {
        method: 'navigate',
        url: action.url!,
        instruction: `Navigate to ${action.url}`,
      };
    } else if (action.type === 'click') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: action.description,
      };
    } else if (action.type === 'fill') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: `${action.description} with value "${action.value}"`,
        value: action.value,
      };
    } else {
      return {
        method: 'act',
        selector: action.selector,
        instruction: action.description,
      };
    }
  });
}

/**
 * Replay workflow to validate it works
 */
async function replayWorkflow(stagehand: any, page: any, workflow: StagehandAction[]) {
  for (const action of workflow) {
    console.log('[replayWorkflow] Executing action:', action.method, action.instruction);

    if (action.method === 'navigate') {
      await page.goto(action.url!, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 15000,
      });
    } else if (action.method === 'act') {
      // Try exact selector first (Strategy 1)
      if (action.selector) {
        try {
          if (action.value) {
            await page.locator(action.selector).fill(action.value, { timeout: 5000 });
          } else {
            await page.locator(action.selector).click({ timeout: 5000 });
          }
          console.log('[replayWorkflow] Action executed with exact selector');
        } catch (error) {
          // Fallback to natural language (Strategy 2)
          console.log('[replayWorkflow] Exact selector failed, using natural language');
          await stagehand.act(action.instruction);
        }
      } else {
        // No selector, use natural language
        await stagehand.act(action.instruction);
      }
    }

    // Wait a bit between actions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
