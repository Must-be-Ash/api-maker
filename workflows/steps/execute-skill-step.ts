import { z } from "zod";
import type {
  ExecuteSkillInput,
  ExecuteSkillOutput,
  RecordedAction,
  StagehandAction,
  Skill,
} from "@/lib/types/skills";

/**
 * Execute Skill Step
 *
 * Executes a skill using the triple replay strategy:
 * 1. Exact Selector Replay (fastest, no LLM)
 * 2. Natural Language (AI-resilient, uses Stagehand)
 * 3. AI Re-learn (ultimate fallback, agent mode)
 */
export async function executeSkillStep(input: ExecuteSkillInput): Promise<ExecuteSkillOutput> {
  "use step";

  console.log('[executeSkillStep] Executing skill:', input.skillId);

  // Dynamically import MongoDB helper
  const { connectDB } = await import("@/lib/mongodb");

  // Load skill from MongoDB
  const db = await connectDB();
  const skill = await db.collection('skills').findOne({ skillId: input.skillId }) as Skill | null;

  if (!skill) {
    throw new Error(`Skill ${input.skillId} not found`);
  }

  console.log('[executeSkillStep] Loaded skill:', {
    name: skill.name,
    operations: skill.recordedActions.length,
  });

  // Dynamically import Stagehand
  const { Stagehand } = await import("@browserbasehq/stagehand");

  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    verbose: 1,
    modelName: "gpt-4o", // Use OpenAI GPT-4o for AI operations
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  let strategy: "exact_replay" | "natural_language" | "ai_relearn" = "exact_replay";
  let result: any;
  const executionStart = Date.now();

  // STRATEGY 1: EXACT SELECTOR REPLAY (Fastest - No LLM)
  try {
    console.log('[executeSkillStep] Attempting Strategy 1: Exact Selector Replay');
    result = await executeExactReplay(page, skill.recordedActions, input.variables);
    console.log('[executeSkillStep] ✓ Strategy 1 succeeded');
  } catch (err) {
    console.log('[executeSkillStep] ✗ Strategy 1 failed:', err);

    // STRATEGY 2: STAGEHAND NATURAL LANGUAGE (AI-Resilient)
    try {
      console.log('[executeSkillStep] Attempting Strategy 2: Natural Language');
      strategy = "natural_language";
      result = await executeNaturalLanguage(stagehand, skill.stagehandWorkflow, input.variables);
      console.log('[executeSkillStep] ✓ Strategy 2 succeeded');
    } catch (err2) {
      console.log('[executeSkillStep] ✗ Strategy 2 failed:', err2);

      // STRATEGY 3: AI AGENT RE-LEARN (Ultimate Fallback)
      console.log('[executeSkillStep] Attempting Strategy 3: AI Re-learn');
      strategy = "ai_relearn";
      result = await executeAIRelearn(stagehand, skill.goal, input.variables, skill.startUrl);
      console.log('[executeSkillStep] ✓ Strategy 3 succeeded');

      // Update skill with new learned workflow
      if (result.history && result.history.length > 0) {
        await updateSkillWorkflow(input.skillId, result.history);
      }
    }
  }

  const executionTime = Date.now() - executionStart;

  // Get token usage from Stagehand metrics
  let tokensUsed = 0;
  try {
    const metrics = await stagehand.metrics;
    tokensUsed = (metrics?.totalPromptTokens || 0) + (metrics?.totalCompletionTokens || 0);
  } catch (error) {
    console.log('[executeSkillStep] Could not get metrics:', error);
  }

  // Get Browserbase session info before closing
  const sessionId = (stagehand as any).sessionId || 'unknown';
  const sessionUrl = sessionId !== 'unknown'
    ? `https://www.browserbase.com/sessions/${sessionId}`
    : '';

  await stagehand.close();

  // Log execution to MongoDB
  await db.collection('skill_executions').insertOne({
    skillId: input.skillId,
    strategy,
    executionTime,
    tokensUsed,
    variables: input.variables,
    success: true,
    sessionId,
    executedAt: new Date().toISOString(),
  });

  return {
    success: true,
    data: result,
    strategy,
    executionTime,
    tokensUsed,
    sessionId,
    sessionUrl,
  };
}

/**
 * Strategy 1: Exact Selector Replay (No LLM)
 * Fastest method - replays exact selectors recorded during demonstration
 */
async function executeExactReplay(
  page: any,
  actions: RecordedAction[],
  variables?: Record<string, any>
): Promise<any> {
  console.log('[executeExactReplay] Starting exact replay with', actions.length, 'actions');

  for (const action of actions) {
    console.log('[executeExactReplay] Action:', action.type, action.description);

    if (action.type === 'navigate') {
      await page.goto(action.url, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 10000,
      });
    } else if (action.type === 'click') {
      await page.locator(action.selector).click({ timeout: 5000 });
    } else if (action.type === 'fill') {
      let value = action.value || '';

      // Variable substitution
      if (variables) {
        Object.entries(variables).forEach(([key, val]) => {
          value = value.replace(`%${key}%`, String(val));
        });
      }

      await page.locator(action.selector).fill(value, { timeout: 5000 });
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return { success: true };
}

/**
 * Strategy 2: Natural Language (Stagehand AI)
 * Uses natural language instructions with AI re-inference
 */
async function executeNaturalLanguage(
  stagehand: any,
  workflow: StagehandAction[],
  variables?: Record<string, any>
): Promise<any> {
  console.log('[executeNaturalLanguage] Starting natural language execution with', workflow.length, 'steps');

  const page = stagehand.context.pages()[0];

  for (const action of workflow) {
    let instruction = action.instruction;

    // Variable substitution
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        instruction = instruction.replace(`%${key}%`, String(val));
      });
    }

    console.log('[executeNaturalLanguage] Action:', action.method, instruction);

    if (action.method === 'navigate') {
      await page.goto(action.url!, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 10000,
      });
    } else if (action.method === 'act') {
      await stagehand.act(instruction);
    } else if (action.method === 'extract') {
      // If schema is provided, use it
      if (action.schema) {
        return await stagehand.extract(instruction, z.object(action.schema as any));
      } else {
        return await stagehand.extract(instruction);
      }
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { success: true };
}

/**
 * Strategy 3: AI Re-learn (Agent Mode)
 * Uses Stagehand Agent to re-learn the entire workflow
 */
async function executeAIRelearn(
  stagehand: any,
  goal: string,
  variables?: Record<string, any>,
  startUrl?: string
): Promise<any> {
  console.log('[executeAIRelearn] Starting AI re-learn for goal:', goal);

  let goalWithVars = goal;

  // Variable substitution
  if (variables) {
    Object.entries(variables).forEach(([key, val]) => {
      goalWithVars = goalWithVars.replace(`%${key}%`, String(val));
    });
  }

  // Navigate to start URL if provided
  if (startUrl) {
    const page = stagehand.context.pages()[0];
    await page.goto(startUrl, {
      waitUntil: 'domcontentloaded',
      timeoutMs: 10000,
    });
    console.log('[executeAIRelearn] Navigated to start URL:', startUrl);
  }

  // Create agent with explicit instructions to stay on the current site
  const currentSite = startUrl ? new URL(startUrl).hostname : 'the current website';
  const agent = stagehand.agent({
    systemPrompt: `You are a web automation expert. Your goal: ${goalWithVars}.

IMPORTANT RULES:
1. You are already on ${currentSite} - DO NOT navigate to any other website
2. Complete the entire task on this website only
3. When extracting flight information, extract ALL details including:
   - Total price (with currency symbol)
   - Airline names for each flight segment
   - Flight numbers
   - Departure and arrival times
   - Departure and arrival airports

Perform the task step by step using act, observe, and extract methods on ${currentSite}.
Be precise and thorough in your extraction.`,
  });

  console.log('[executeAIRelearn] Agent created, executing task');

  // Execute with agent
  const result = await agent.execute({
    instruction: goalWithVars,
    maxSteps: 20,
  });

  console.log('[executeAIRelearn] Agent execution complete');
  console.log('[executeAIRelearn] Full result keys:', Object.keys(result));
  console.log('[executeAIRelearn] Result:', JSON.stringify(result, null, 2));

  // Extract data from actions if available (even if task marked incomplete)
  let extractionData = null;
  if (result.actions && Array.isArray(result.actions)) {
    // Find the extraction action in the actions array
    const extractionAction = result.actions.find(
      (action: any) => action.type === 'extract' || action.extraction
    );

    if (extractionAction) {
      extractionData = extractionAction.extraction || extractionAction;
      console.log('[executeAIRelearn] Found extraction data:', extractionData);
    }
  }

  // Build improved message with extraction data
  let improvedMessage = result.message || 'Task execution completed';
  if (extractionData && typeof extractionData === 'string') {
    improvedMessage = extractionData;
  }

  return {
    ...result,
    message: improvedMessage,
    extraction: extractionData,  // Always include extraction if available
    history: [], // Agent doesn't expose history in v3
  };
}

/**
 * Update skill workflow with new history from successful AI re-learn
 */
async function updateSkillWorkflow(skillId: string, newHistory: any[]) {
  try {
    // Dynamically import MongoDB helper
    const { connectDB } = await import("@/lib/mongodb");
    const db = await connectDB();
    await db.collection('skills').updateOne(
      { skillId },
      {
        $set: {
          history: newHistory,
          updatedAt: new Date().toISOString(),
        }
      }
    );
    console.log('[updateSkillWorkflow] Skill workflow updated');
  } catch (error) {
    console.error('[updateSkillWorkflow] Error updating skill:', error);
  }
}
