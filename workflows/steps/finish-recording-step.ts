import type {
  FinishRecordingInput,
  FinishRecordingOutput,
  RecordedAction,
  StagehandAction,
  SkillMetrics,
} from "@/lib/types/skills";
import { detectVariables } from "@/lib/capture/variable-detector";
import { extractTypedValues } from "@/lib/capture/action-grouper";
import { generateExtractionSchema } from "@/lib/extraction/schema-generator";

/**
 * Convert auto-navigations after search/form actions into submit actions.
 *
 * This prevents hardcoded query parameters in URLs when the browser automatically
 * navigates after a search is submitted.
 *
 * Converts a navigation to a submit action if:
 * 1. A type/fill action occurred within the last 20 seconds
 * 2. It's not the first navigation (keep initial page load)
 * 3. The URL contains query parameters (likely a search result)
 */
function filterRedundantNavigations(actions: RecordedAction[]): RecordedAction[] {
  const filtered: RecordedAction[] = [];
  const NAVIGATION_THRESHOLD_MS = 20000; // 20 seconds (handles slow page loads)

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];

    // Always keep non-navigation actions
    if (action.type !== 'navigate') {
      filtered.push(action);
      continue;
    }

    // Always keep first navigation (initial page load)
    if (i === 0) {
      filtered.push(action);
      console.log('[filterRedundantNavigations] Keeping initial navigation:', action.url);
      continue;
    }

    // Look back for recent type/fill actions (within threshold)
    let shouldConvertToSubmit = false;
    let triggerAction = null;

    for (let j = i - 1; j >= 0; j--) {
      const prevAction = actions[j];
      const timeDiff = action.timestamp - prevAction.timestamp;

      // Stop looking back if we exceed the threshold
      if (timeDiff > NAVIGATION_THRESHOLD_MS) {
        break;
      }

      // Check if this is a search/form input action (not a click on search box to focus)
      if (prevAction.type === 'type' || prevAction.type === 'fill') {
        // Additional heuristic: Check if URL has query parameters (likely a search result)
        const hasQueryParams = action.url?.includes('?') &&
          (action.url.includes('q=') || action.url.includes('search') || action.url.includes('query'));

        if (hasQueryParams) {
          console.log('[filterRedundantNavigations] 🔄 Converting auto-navigation to submit after', prevAction.type,
            `(${(timeDiff / 1000).toFixed(1)}s later)`);
          shouldConvertToSubmit = true;
          triggerAction = prevAction;
          break;
        }
      }
    }

    if (shouldConvertToSubmit && triggerAction) {
      // Convert navigation to a submit action that uses the selector from the type/fill action
      const submitAction: RecordedAction = {
        type: 'submit',
        selector: triggerAction.selector, // Use the input field selector
        description: 'Press Enter to submit search',
        timestamp: action.timestamp,
      };
      filtered.push(submitAction);
      console.log('[filterRedundantNavigations] ✓ Created submit action:', submitAction.description);
      continue;
    }

    // Keep all other navigations
    filtered.push(action);
    console.log('[filterRedundantNavigations] Keeping navigation:', action.url?.substring(0, 100));
  }

  return filtered;
}

/**
 * Finish Recording Step
 *
 * Stops the action recorder, converts recorded actions to Stagehand workflow,
 * detects variables, generates extraction schema, validates the workflow,
 * and saves the skill to MongoDB.
 */
export async function finishRecordingStep(input: FinishRecordingInput): Promise<FinishRecordingOutput> {
  "use step";

  console.log('[finishRecordingStep] Finishing recording', input);

  // Stop action recorder if it exists
  const activeRecorder = (global as any).activeRecorders?.[input.recordingId];
  if (activeRecorder) {
    await activeRecorder.recorder.stopRecording();
    console.log('[finishRecordingStep] Stopped action recorder');

    // Close the Stagehand session (releases keep-alive session)
    try {
      await activeRecorder.stagehand.close();
      console.log('[finishRecordingStep] Released keep-alive session');
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

  // Extract typed values from recorded actions (for variable detection)
  const typedValues = extractTypedValues(recording.recordedActions || []);
  console.log('[finishRecordingStep] Extracted typed values:', typedValues);

  // Detect variables and map them to typed values
  let variableMapping: Record<string, string> = {};
  if (typedValues.length > 0 && recording.goal) {
    try {
      variableMapping = await detectVariables(recording.goal, typedValues);
      console.log('[finishRecordingStep] Variable mapping:', variableMapping);
    } catch (error) {
      console.error('[finishRecordingStep] Error detecting variables:', error);
    }
  }

  // Replace demo values with variable placeholders in actions
  const variableMappedActions = recording.recordedActions.map((action: RecordedAction) => {
    if (action.value && variableMapping[action.value]) {
      return {
        ...action,
        value: variableMapping[action.value], // Replace with %variable%
        originalValue: action.value, // Keep original for reference
      };
    }
    return action;
  });

  console.log('[finishRecordingStep] Applied variable mapping to',
    Object.keys(variableMapping).length, 'actions');

  // SOLUTION A: Prepend synthetic navigate action for the initial startUrl
  // This ensures the initial navigation is captured in the workflow
  const allActions: RecordedAction[] = [];

  if (recording.startUrl) {
    // Use createdAt timestamp since startedAt doesn't exist in recording_sessions schema
    const startTimestamp = recording.createdAt
      ? new Date(recording.createdAt).getTime()
      : Date.now();

    allActions.push({
      type: 'navigate',
      url: recording.startUrl,
      description: `Navigate to ${recording.startUrl}`,
      timestamp: startTimestamp,
    } as RecordedAction);
    console.log('[finishRecordingStep] Prepended initial navigation to:', recording.startUrl);
  }

  // Append all recorded actions after the initial navigation
  allActions.push(...variableMappedActions);

  // Filter out redundant auto-navigations that follow search/form actions
  const filteredActions = filterRedundantNavigations(allActions);
  console.log('[finishRecordingStep] Filtered actions:', {
    before: allActions.length,
    after: filteredActions.length,
    removed: allActions.length - filteredActions.length
  });

  // Generate extraction schema from goal
  let extractionSchema = null;
  if (recording.goal) {
    try {
      extractionSchema = await generateExtractionSchema(recording.goal);
      console.log('[finishRecordingStep] Generated extraction schema:', {
        fields: extractionSchema.fields.length,
        instruction: extractionSchema.instruction,
      });
    } catch (error) {
      console.error('[finishRecordingStep] Error generating schema:', error);
    }
  }

  // Convert recorded actions to Stagehand workflow (use filteredActions)
  const stagehandWorkflow = convertToStagehand(filteredActions || []);

  console.log('[finishRecordingStep] Converted to Stagehand workflow:', {
    workflowSteps: stagehandWorkflow.length,
  });

  // Validate workflow by replaying it
  let testResult: { success: boolean; error?: string } = { success: false };
  let history: any[] = [];
  let metrics: SkillMetrics = {
    totalTokens: 0,
    duration: 0,
    operations: filteredActions?.length || 0,
  };

  try {
    // Dynamically import Stagehand for validation
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      verbose: 1,
      model: "openai/gpt-4o", // Use OpenAI GPT-4o for AI operations (v3 API)
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

    // Close Stagehand session (ignore CDP transport errors during cleanup)
    try {
      await stagehand.close();
      console.log('[finishRecordingStep] Validation session closed successfully');
    } catch (closeError) {
      // CDP transport errors during close are expected and can be ignored
      console.log('[finishRecordingStep] Session cleanup completed (CDP transport closed)');
    }
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

    // HYBRID STORAGE - Now with variable-mapped actions, initial navigation, and filtered redundant navigations
    recordedActions: filteredActions || [],
    stagehandWorkflow,
    history,

    // Variable mapping (for execution-time substitution)
    variableMapping,

    // Extraction schema (for structured data extraction)
    extractionSchema: extractionSchema ? {
      fields: extractionSchema.fields,
      instruction: extractionSchema.instruction,
      description: extractionSchema.description,
    } : null,

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
    recordedActions: allActions || [],
    stagehandWorkflow,
    testResult,
    metrics,
  };
}

/**
 * Convert recorded actions to Stagehand workflow format
 *
 * Note: Handles both raw actions ('fill') and grouped actions ('type')
 * Preserves variable placeholders (%variable%) in values
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
    } else if (action.type === 'fill' || action.type === 'type') {
      // Handle both raw 'fill' and grouped 'type' actions
      // Preserve variable placeholders in value
      const valueInstruction = action.value?.startsWith('%')
        ? action.value // Keep %variable% placeholder
        : `"${action.value}"`; // Quote literal values

      return {
        method: 'act',
        selector: action.selector,
        instruction: `${action.description} with value ${valueInstruction}`,
        value: action.value,
      };
    } else if (action.type === 'submit') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: action.description || 'Submit form',
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
