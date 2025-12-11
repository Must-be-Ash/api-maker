import { z } from "zod";
import type {
  ExecuteSkillInput,
  ExecuteSkillOutput,
  RecordedAction,
  StagehandAction,
  Skill,
} from "@/lib/types/skills";
import { buildZodSchemaFromFields } from "@/lib/extraction/zod-schema-builder";
import { ExecutionResultTracker } from "@/lib/execution/result-tracker";

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

  // Initialize execution result tracker
  const tracker = new ExecutionResultTracker(
    input.skillId,
    skill.name,
    input.variables || {},
    `/api/skills/${input.skillId}/execute`
  );

  // Extract and build Zod schema from stored extraction schema
  let zodExtractionSchema: z.ZodObject<any> | null = null;
  if (skill.extractionSchema && skill.extractionSchema.fields) {
    try {
      zodExtractionSchema = buildZodSchemaFromFields(skill.extractionSchema.fields);
      console.log('[executeSkillStep] Built Zod schema with', skill.extractionSchema.fields.length, 'fields');

      // Comprehensive extraction schema logging
      console.log('[Extraction Schema]', {
        fields: skill.extractionSchema.fields,
        instruction: skill.extractionSchema.instruction,
        fieldCount: skill.extractionSchema.fields.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[executeSkillStep] Error building Zod schema:', error);
    }
  }

  // Dynamically import Stagehand
  const { Stagehand } = await import("@browserbasehq/stagehand");

  // Initialize Stagehand
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    verbose: 1,
    model: "openai/gpt-4o", // Use OpenAI GPT-4o for AI operations (v3 API)
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  let strategy: "exact_replay" | "natural_language" | "ai_relearn" = "exact_replay";
  let result: any;
  const executionStart = Date.now();

  // STRATEGY 1: EXACT SELECTOR REPLAY (Fastest - No LLM)
  try {
    console.log('[executeSkillStep] Attempting Strategy 1: Exact Selector Replay');
    tracker.startStrategy('exact_replay');
    result = await executeExactReplay(
      page,
      skill.recordedActions,
      input.variables,
      stagehand,
      zodExtractionSchema,
      skill.extractionSchema?.instruction,
      skill.startUrl  // SOLUTION B: Pass startUrl for initial navigation
    );
    tracker.recordStrategySuccess('exact_replay', {
      actionsCompleted: skill.recordedActions.length,
      extractionAttempted: !!zodExtractionSchema,
    });
    console.log('[executeSkillStep] ✓ Strategy 1 succeeded');
  } catch (err) {
    console.log('[executeSkillStep] ✗ Strategy 1 failed:', err);
    tracker.recordStrategyFailure('exact_replay', err as Error, {
      actionsAttempted: skill.recordedActions.length,
    });

    // STRATEGY 2: STAGEHAND NATURAL LANGUAGE (AI-Resilient)
    try {
      console.log('[executeSkillStep] Attempting Strategy 2: Natural Language');
      strategy = "natural_language";
      tracker.startStrategy('natural_language');
      result = await executeNaturalLanguage(
        stagehand,
        skill.stagehandWorkflow,
        input.variables,
        zodExtractionSchema,
        skill.extractionSchema?.instruction,
        skill.startUrl  // SOLUTION B: Pass startUrl for initial navigation
      );
      tracker.recordStrategySuccess('natural_language', {
        actionsCompleted: skill.stagehandWorkflow?.length,
        extractionAttempted: !!zodExtractionSchema,
      });
      console.log('[executeSkillStep] ✓ Strategy 2 succeeded');
    } catch (err2) {
      console.log('[executeSkillStep] ✗ Strategy 2 failed:', err2);
      tracker.recordStrategyFailure('natural_language', err2 as Error, {
        actionsAttempted: skill.stagehandWorkflow?.length,
      });

      // STRATEGY 3: AI AGENT RE-LEARN (Ultimate Fallback)
      console.log('[executeSkillStep] Attempting Strategy 3: AI Re-learn');
      strategy = "ai_relearn";
      tracker.startStrategy('ai_relearn');
      result = await executeAIRelearn(
        stagehand,
        skill.goal,
        input.variables,
        skill.startUrl,
        zodExtractionSchema,
        skill.extractionSchema
      );
      tracker.recordStrategySuccess('ai_relearn', {
        agentIterations: result.history?.length,
        extractionAttempted: !!zodExtractionSchema,
      });
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

  // Get Browserbase session info before closing (using proper Stagehand v3 API)
  const sessionId = stagehand.browserbaseSessionID || 'unknown';
  const sessionUrl = stagehand.browserbaseSessionURL || '';
  const debugUrl = stagehand.browserbaseDebugURL || '';

  console.log('[executeSkillStep] Session info:', {
    sessionId,
    sessionUrl,
    debugUrl,
  });

  // Capture Stagehand history before closing
  let stagehandHistory: any[] = [];
  try {
    const history = await stagehand.history;
    stagehandHistory = history ? [...history] : [];
    console.log('[executeSkillStep] Captured Stagehand history:', stagehandHistory.length, 'actions');
  } catch (error) {
    console.log('[executeSkillStep] Could not get Stagehand history:', error);
  }

  // Record session info in tracker
  tracker.setSession(sessionId, sessionUrl, debugUrl);
  tracker.setTokensUsed(tokensUsed);
  tracker.setTotalExecutionTime(executionTime);
  tracker.setStagehandHistory(stagehandHistory);

  // Extract data from result
  const extractedData = result?.extraction || result?.data || null;
  tracker.setExtractedData(extractedData);

  // Validate extraction
  let validationResult = { valid: true, errors: [] as string[] };
  if (extractedData && input.variables) {
    validationResult = validateExtraction(extractedData, input.variables);
    tracker.setValidation(validationResult.valid, validationResult.errors);
  } else if (!extractedData) {
    validationResult = { valid: false, errors: ['No data was extracted'] };
    tracker.setValidation(false, ['No data was extracted']);
  }

  // Determine final success based on validation
  const finalSuccess = validationResult.valid;
  tracker.setSuccess(finalSuccess);

  // Log summary to console
  tracker.logSummary();

  // Save comprehensive result to execution_results collection
  await tracker.save();

  await stagehand.close();

  // Also save to legacy skill_executions collection (for backward compatibility)
  await db.collection('skill_executions').insertOne({
    skillId: input.skillId,
    strategy,
    executionTime,
    tokensUsed,
    variables: input.variables,
    success: finalSuccess,  // ✅ FIX: Based on validation, not hardcoded true
    extractedData,  // ✅ FIX: Save extracted data
    validationErrors: validationResult.errors,  // ✅ FIX: Save validation errors
    sessionId,
    sessionUrl,  // Store session replay URL for debugging
    debugUrl,    // Store CDP debug URL for advanced inspection
    executedAt: new Date().toISOString(),
  });

  return {
    success: finalSuccess,  // ✅ FIX: Return actual success state
    data: result,
    extractedData,  // Include extracted data in response
    validation: validationResult,  // Include validation result
    strategy,
    executionTime,
    tokensUsed,
    sessionId,
    sessionUrl,
    debugUrl,
  };
}

/**
 * Strategy 1: Exact Selector Replay (No LLM)
 * Fastest method - replays exact selectors recorded during demonstration
 */
async function executeExactReplay(
  page: any,
  actions: RecordedAction[],
  variables?: Record<string, any>,
  stagehand?: any,
  zodExtractionSchema?: z.ZodObject<any> | null,
  extractionInstruction?: string,
  startUrl?: string  // SOLUTION B: Add startUrl parameter
): Promise<any> {
  console.log('[executeExactReplay] Starting exact replay with', actions.length, 'actions');
  console.log('[executeExactReplay] Variables:', variables);

  // SOLUTION B: Ensure we start from the correct URL
  if (startUrl) {
    console.log('[executeExactReplay] Navigating to start URL:', startUrl);
    await page.goto(startUrl, {
      waitUntil: 'domcontentloaded',
      timeoutMs: 10000,
    });
  }

  for (const action of actions) {
    console.log('[executeExactReplay] Action:', action.type, action.description);

    if (action.type === 'navigate') {
      await page.goto(action.url, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 10000,
      });
    } else if (action.type === 'click') {
      await page.locator(action.selector).click({ timeout: 5000 });
    } else if (action.type === 'fill' || action.type === 'type') {
      // Handle both 'fill' (raw) and 'type' (grouped) actions
      let value = action.value || '';

      // VARIABLE SUBSTITUTION
      if (variables && value) {
        // If value is a variable placeholder like "%origin%"
        if (value.startsWith('%') && value.endsWith('%')) {
          const varName = value.slice(1, -1); // Extract "origin" from "%origin%"
          const substitutedValue = variables[varName];

          if (substitutedValue !== undefined) {
            console.log(`[executeExactReplay] Substituted ${value} → ${substitutedValue}`);

            // Comprehensive variable substitution logging
            console.log('[Variable Substitution]', {
              original: action.value,
              substituted: String(substitutedValue),
              variable: varName,
              selector: action.selector,
              timestamp: new Date().toISOString(),
            });

            value = String(substitutedValue);
          } else {
            console.warn(`[executeExactReplay] Variable ${varName} not provided, using placeholder`);
          }
        } else {
          // Value might contain multiple variables (edge case)
          Object.entries(variables).forEach(([key, val]) => {
            const placeholder = `%${key}%`;
            if (value.includes(placeholder)) {
              console.log(`[executeExactReplay] Substituted ${placeholder} → ${val}`);
              value = value.replace(new RegExp(placeholder, 'g'), String(val));
            }
          });
        }
      }

      await page.locator(action.selector).fill(value, { timeout: 5000 });
    } else if (action.type === 'submit') {
      // Handle submit actions using Stagehand's natural language act()
      // This is more reliable than trying to press Enter via Playwright
      if (stagehand) {
        await stagehand.act(action.description || 'Submit search');
        console.log('[executeExactReplay] Submitted using Stagehand act():', action.description);
      } else {
        // Fallback: Try to press Enter by typing newline character
        await page.locator(action.selector).type('\n', { timeout: 5000 });
        console.log('[executeExactReplay] Submitted using Enter key fallback');
      }
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // EXTRACTION: If schema and stagehand are provided, extract data
  let extraction = null;
  if (stagehand && zodExtractionSchema && extractionInstruction) {
    console.log('[executeExactReplay] Extracting data with schema...');
    extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema);
    console.log('[executeExactReplay] Extraction result:', extraction);
  }

  // Validate extraction - throw error if no data was extracted
  if (zodExtractionSchema && extractionInstruction) {
    if (!extraction) {
      throw new Error('Extraction returned null - no data was found on the page');
    }

    // Check if extraction has any non-empty fields
    const hasData = Object.values(extraction).some(value => {
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasData) {
      throw new Error('Extraction returned empty data - all fields are empty');
    }
  }

  return {
    success: true,
    extraction,
  };
}

/**
 * Strategy 2: Natural Language (Stagehand AI)
 * Uses natural language instructions with AI re-inference
 */
async function executeNaturalLanguage(
  stagehand: any,
  workflow: StagehandAction[],
  variables?: Record<string, any>,
  zodExtractionSchema?: z.ZodObject<any> | null,
  extractionInstruction?: string,
  startUrl?: string  // SOLUTION B: Add startUrl parameter
): Promise<any> {
  console.log('[executeNaturalLanguage] Starting natural language execution with', workflow.length, 'steps');
  console.log('[executeNaturalLanguage] Variables:', variables);

  const page = stagehand.context.pages()[0];

  // SOLUTION B: Ensure we start from the correct URL
  if (startUrl) {
    console.log('[executeNaturalLanguage] Navigating to start URL:', startUrl);
    await page.goto(startUrl, {
      waitUntil: 'domcontentloaded',
      timeoutMs: 10000,
    });
  }

  for (const action of workflow) {
    let instruction = action.instruction;
    let value = action.value;

    // VARIABLE SUBSTITUTION in instruction and value
    if (variables) {
      Object.entries(variables).forEach(([key, val]) => {
        const placeholder = `%${key}%`;

        // Substitute in instruction
        if (instruction && instruction.includes(placeholder)) {
          console.log(`[executeNaturalLanguage] Substituting ${placeholder} in instruction`);
          instruction = instruction.replace(new RegExp(placeholder, 'g'), String(val));
        }

        // Substitute in value
        if (value && value.includes(placeholder)) {
          console.log(`[executeNaturalLanguage] Substituting ${placeholder} in value`);
          value = value.replace(new RegExp(placeholder, 'g'), String(val));
        }
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

  // EXTRACTION: If schema is provided, extract data at the end
  let extraction = null;
  if (zodExtractionSchema && extractionInstruction) {
    console.log('[executeNaturalLanguage] Extracting data with schema...');
    extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema);
    console.log('[executeNaturalLanguage] Extraction result:', extraction);
  }

  // Validate extraction - throw error if no data was extracted
  if (zodExtractionSchema && extractionInstruction) {
    if (!extraction) {
      throw new Error('Extraction returned null - no data was found on the page');
    }

    // Check if extraction has any non-empty fields
    const hasData = Object.values(extraction).some(value => {
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasData) {
      throw new Error('Extraction returned empty data - all fields are empty');
    }
  }

  return {
    success: true,
    extraction,
  };
}

/**
 * Strategy 3: AI Re-learn (Agent Mode)
 * Uses Stagehand Agent to re-learn the entire workflow
 */
async function executeAIRelearn(
  stagehand: any,
  goal: string,
  variables?: Record<string, any>,
  startUrl?: string,
  zodExtractionSchema?: z.ZodObject<any> | null,
  extractionSchemaInfo?: any
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

  // Build validation criteria from variables
  let validationCriteria = '';
  if (variables) {
    validationCriteria = '\n\n3. CRITICAL VALIDATION - When making selections, VERIFY they match these criteria:\n';
    Object.entries(variables).forEach(([key, val]) => {
      validationCriteria += `   - ${key}: ${val}\n`;
    });

    // Add specific validation rules based on variable names
    if (variables.origin && variables.destination) {
      validationCriteria += `\n   IMPORTANT for flight searches:\n`;
      validationCriteria += `   - Only click flights that show "${variables.origin}" OR its airport code in origin\n`;
      validationCriteria += `   - Only click flights that show "${variables.destination}" OR its airport code in destination\n`;
      validationCriteria += `   - IGNORE alternative route suggestions (e.g., different cities)\n`;
    }

    if (variables.productName) {
      validationCriteria += `\n   IMPORTANT for product searches:\n`;
      validationCriteria += `   - Verify product title contains "${variables.productName}"\n`;
      validationCriteria += `   - Don't select unrelated products\n`;
    }
  }

  // Build schema description for system prompt
  let schemaDescription = '';
  if (extractionSchemaInfo && extractionSchemaInfo.fields) {
    schemaDescription = '\n\n4. After completing the task, extract the following data fields:\n';
    extractionSchemaInfo.fields.forEach((field: any) => {
      schemaDescription += `   - ${field.name}: ${field.description}\n`;
    });
  }

  // Create agent with explicit instructions to stay on the current site
  const currentSite = startUrl ? new URL(startUrl).hostname : 'the current website';
  const agent = stagehand.agent({
    systemPrompt: `You are a web automation expert. Your goal: ${goalWithVars}.

IMPORTANT RULES:
1. You are already on ${currentSite} - DO NOT navigate to any other website
2. Complete the entire task on this website only${validationCriteria}${schemaDescription}

Perform the task step by step using act, observe, and extract methods on ${currentSite}.
Be precise and thorough. Validate your selections match the search criteria before proceeding.`,
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

  // If no extraction found but schema is available, try manual extraction
  if (!extractionData && zodExtractionSchema && extractionSchemaInfo?.instruction) {
    console.log('[executeAIRelearn] No extraction in agent result, trying manual extraction...');
    extractionData = await stagehand.extract(extractionSchemaInfo.instruction, zodExtractionSchema);
    console.log('[executeAIRelearn] Manual extraction result:', extractionData);
  }

  // Build improved message with extraction data
  let improvedMessage = result.message || 'Task execution completed';
  if (extractionData && typeof extractionData === 'string') {
    improvedMessage = extractionData;
  }

  // Validate extraction exists and has data (if schema was provided)
  if (zodExtractionSchema && extractionSchemaInfo?.instruction) {
    if (!extractionData) {
      throw new Error('Extraction returned null - no data was found on the page');
    }

    // Check if extraction has any non-empty fields
    const hasData = Object.values(extractionData).some(value => {
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasData) {
      throw new Error('Extraction returned empty data - all fields are empty');
    }
  }

  // Validate extracted data against input variables
  let validation: { valid: boolean; errors: string[] } = { valid: true, errors: [] };
  if (extractionData && variables) {
    validation = validateExtraction(extractionData, variables);

    // Comprehensive validation logging
    console.log('[Validation]', {
      extraction: extractionData,
      variables: variables,
      valid: validation.valid,
      errors: validation.errors,
      timestamp: new Date().toISOString(),
    });

    if (!validation.valid) {
      console.warn('[executeAIRelearn] Validation failed:', validation.errors);
    } else {
      console.log('[executeAIRelearn] ✓ Validation passed');
    }
  }

  return {
    ...result,
    message: improvedMessage,
    extraction: extractionData,  // Always include extraction if available
    validation,  // Include validation results
    history: [], // Agent doesn't expose history in v3
  };
}

/**
 * Validate extracted data matches input variables
 */
function validateExtraction(
  extraction: any,
  variables: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Skip validation if extraction is not an object
  if (!extraction || typeof extraction !== 'object') {
    return { valid: true, errors: [] };
  }

  // Check if route field contains origin and destination
  if (extraction.route && variables.origin && variables.destination) {
    const route = extraction.route.toLowerCase();
    const origin = variables.origin.toLowerCase();
    const destination = variables.destination.toLowerCase();

    // Route should contain both origin and destination (or their airport codes)
    // Airport codes are typically 3 letters, so check first 3 chars
    const hasOrigin = route.includes(origin) ||
                     route.includes(origin.substring(0, 3));
    const hasDestination = route.includes(destination) ||
                          route.includes(destination.substring(0, 3));

    // Both origin and destination must be present
    if (!hasOrigin || !hasDestination) {
      if (!hasOrigin && !hasDestination) {
        errors.push(`Route "${extraction.route}" doesn't match ${variables.origin} → ${variables.destination}`);
      } else if (!hasOrigin) {
        errors.push(`Route "${extraction.route}" doesn't contain origin "${variables.origin}"`);
      } else if (!hasDestination) {
        errors.push(`Route "${extraction.route}" doesn't contain destination "${variables.destination}"`);
      }
    }
  }

  // Check if product title matches search query
  if (extraction.title && variables.productName) {
    const title = extraction.title.toLowerCase();
    const searchTerm = variables.productName.toLowerCase();

    if (!title.includes(searchTerm)) {
      errors.push(`Product title "${extraction.title}" doesn't match search "${variables.productName}"`);
    }
  }

  // Check if airline field exists for flight searches
  if (variables.origin && variables.destination && extraction.airline) {
    // Airline should be a non-empty string
    if (typeof extraction.airline !== 'string' || extraction.airline.trim() === '') {
      errors.push('Airline field is empty or invalid');
    }
  }

  // Check if price field exists and is non-empty
  if ('price' in extraction) {
    if (typeof extraction.price !== 'string' || extraction.price.trim() === '') {
      errors.push('Price field is empty or invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
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
