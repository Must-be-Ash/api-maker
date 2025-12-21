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
import { extractVariablesFromInput } from "@/lib/ai/variable-extractor";
import { generateExtractionSchema } from "@/lib/extraction/schema-generator";

/**
 * Auto-scroll to trigger lazy-loaded content before extraction
 *
 * This function:
 * 1. Checks if the page is long enough to warrant scrolling
 * 2. Scrolls to the bottom to trigger lazy-loaded content
 * 3. Waits for content to load
 * 4. Scrolls back to the top
 *
 * This ensures extraction sees ALL content, including lazy-loaded items
 */
async function autoScrollForExtraction(page: any): Promise<void> {
  try {
    // Check if page is long enough to have content below the fold
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    if (scrollHeight > viewportHeight * 1.5) {
      console.log('[Auto-Scroll] Page is long, scrolling to trigger lazy-loaded content...');
      console.log('[Auto-Scroll] Page height:', scrollHeight, 'Viewport:', viewportHeight);

      // Scroll to the bottom using direct JavaScript (no AI involved, no context limits)
      await page.evaluate(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      });

      // Wait for lazy content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[Auto-Scroll] Waited 2s for lazy content to load');

      // Scroll back to the top using direct JavaScript
      await page.evaluate(() => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      // Let the page settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('[Auto-Scroll] ✓ Auto-scroll complete, page settled');
    } else {
      console.log('[Auto-Scroll] Page fits in viewport, skipping auto-scroll');
    }
  } catch (error) {
    console.error('[Auto-Scroll] ✗ Failed:', error);
    // Don't throw - extraction should still proceed even if auto-scroll fails
  }
}

/**
 * Get optimal extraction selector based on URL to reduce context window usage
 *
 * For sites with known content containers, this limits extraction to the main
 * content area, dramatically reducing token usage and avoiding context window errors.
 */
function getExtractionSelector(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // ✅ FIX: Wikipedia pages can be extremely long (e.g., Bob Dylan page is 64k pixels)
    // Full page extraction exceeds context window for long articles
    // Use targeted selector to extract only the main article content
    if (hostname.includes('wikipedia.org')) {
      console.log('[getExtractionSelector] Wikipedia detected - using targeted selector to avoid context window overflow');
      return '.mw-parser-output'; // Main article content only (excludes navigation, sidebar, footer)
    }

    // Add more site-specific selectors here as needed
    // Example: Amazon product pages
    // if (hostname.includes('amazon.com')) {
    //   return '#dp-container'; // Product detail container
    // }

    // Default: no selector (full page extraction)
    return undefined;
  } catch (error) {
    console.warn('[getExtractionSelector] Invalid URL, using full page extraction:', error);
    return undefined;
  }
}

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

  // Detect variables in skill goal
  const variables = skill.goal.match(/%(\w+)%/g) || [];
  let processedVariables = input.variables || {};

  // If skill has variables and user provided input, extract intelligently
  if (variables.length > 0 && input.variables) {
    const inputKeys = Object.keys(input.variables);
    const firstValue = input.variables[inputKeys[0]];

    // Check if user passed natural language input that needs parsing
    // (e.g., user passed one value but skill needs multiple variables)
    if (inputKeys.length === 1 && variables.length > 1 && typeof firstValue === 'string') {
      console.log('[executeSkillStep] Extracting multiple variables from natural language input:', firstValue);

      try {
        processedVariables = await extractVariablesFromInput(
          skill.goal,
          firstValue,
          variables
        );

        console.log('[executeSkillStep] Extracted variables:', processedVariables);
      } catch (error) {
        console.error('[executeSkillStep] Error extracting variables:', error);
        console.log('[executeSkillStep] Falling back to original input');
        // Keep original input.variables
      }
    } else {
      console.log('[executeSkillStep] Using provided variables directly:', processedVariables);
    }
  }

  // Initialize execution result tracker
  const tracker = new ExecutionResultTracker(
    input.skillId,
    skill.name,
    processedVariables, // Use extracted/processed variables
    `/api/skills/${input.skillId}/execute`
  );

  // Regenerate schema if skill has variables
  if (variables.length > 0 && skill.extractionSchema && processedVariables) {
    console.log('[executeSkillStep] Skill has variables, regenerating schema with actual values');

    // Substitute variables in goal
    let substitutedGoal = skill.goal;
    Object.entries(processedVariables).forEach(([key, value]) => {
      // Add % symbols if not already present
      const placeholder = key.startsWith('%') ? key : `%${key}%`;
      substitutedGoal = substitutedGoal.replace(placeholder, value as string);
    });

    console.log('[executeSkillStep] Substituted goal:', {
      original: skill.goal,
      substituted: substitutedGoal
    });

    try {
      // Regenerate schema with actual context
      const regeneratedSchema = await generateExtractionSchema(substitutedGoal);

      // Use regenerated schema
      skill.extractionSchema = regeneratedSchema;

      console.log('[executeSkillStep] Regenerated schema:', {
        fields: regeneratedSchema.fields.map(f => f.name),
        instruction: regeneratedSchema.instruction
      });
    } catch (error) {
      console.error('[executeSkillStep] Error regenerating schema:', error);
      console.log('[executeSkillStep] Continuing with original schema');
    }
  }

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

  // Initialize Stagehand with client-provided Browserbase x402 session or our API key
  const usingClientSession = !!input.browserbaseConnectUrl;

  if (usingClientSession) {
    console.log('[executeSkillStep] Using client-provided Browserbase x402 session:', {
      sessionId: input.browserbaseSessionId,
      hasConnectUrl: !!input.browserbaseConnectUrl,
    });
  } else {
    console.log('[executeSkillStep] Using platform Browserbase API key (recording mode)');
  }

  const stagehand = new Stagehand({
    env: usingClientSession ? "LOCAL" : "BROWSERBASE",
    apiKey: usingClientSession ? undefined : process.env.BROWSERBASE_API_KEY,
    projectId: usingClientSession ? undefined : process.env.BROWSERBASE_PROJECT_ID,
    ...(usingClientSession && {
      wsEndpoint: input.browserbaseConnectUrl, // Use client's pre-paid session
    }),
    verbose: 1, // Show warnings and errors
    disablePino: true, // Disable pino logger (prevents pino-pretty error in Vercel)
    model: "openai/gpt-4o", // Using GPT-4o for everything (was working before)
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  // Helper function to reset page state between strategy attempts
  async function resetPageState() {
    console.log('[executeSkillStep] 🔄 Resetting page state for next strategy...');
    try {
      // Navigate to a blank page first to clear any existing state
      await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeoutMs: 5000 });

      // Then navigate to the start URL to begin fresh
      if (skill?.startUrl) {
        console.log('[executeSkillStep] 🔄 Navigating to clean start URL:', skill.startUrl);
        await page.goto(skill.startUrl, { waitUntil: 'domcontentloaded', timeoutMs: 10000 });
        console.log('[executeSkillStep] ✓ Page state reset complete');
      }
    } catch (error) {
      console.warn('[executeSkillStep] ⚠️ Page reset failed, continuing anyway:', (error as Error).message);
    }
  }

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
      processedVariables, // Use extracted/processed variables
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

    // 🔄 CRITICAL: Reset page state before attempting Strategy 2
    // Strategy 1 may have left the page in a bad state (wrong URL, partial inputs)
    await resetPageState();

    // STRATEGY 2: STAGEHAND NATURAL LANGUAGE (AI-Resilient)
    try {
      console.log('[executeSkillStep] Attempting Strategy 2: Natural Language');
      strategy = "natural_language";
      tracker.startStrategy('natural_language');
      result = await executeNaturalLanguage(
        stagehand,
        skill.stagehandWorkflow,
        processedVariables, // Use extracted/processed variables
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

      // 🔄 CRITICAL: Reset page state before attempting Strategy 3
      // Strategy 2 may have left the page in a bad state
      await resetPageState();

      // STRATEGY 3: AI AGENT RE-LEARN (Ultimate Fallback)
      console.log('[executeSkillStep] Attempting Strategy 3: AI Re-learn');
      strategy = "ai_relearn";
      tracker.startStrategy('ai_relearn');
      result = await executeAIRelearn(
        stagehand,
        skill.goal,
        processedVariables, // Use extracted/processed variables
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
  if (extractedData && processedVariables && Object.keys(processedVariables).length > 0) {
    validationResult = validateExtraction(extractedData, processedVariables);
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

  // Terminate Browserbase x402 session to get refund for unused time
  if (usingClientSession && input.browserbaseSessionId) {
    try {
      const { terminateSession } = await import('@/lib/browserbase/x402-client');
      console.log('[Browserbase x402] Terminating session:', input.browserbaseSessionId);

      const termination = await terminateSession(input.browserbaseSessionId);

      console.log('[Browserbase x402] Session terminated:', {
        minutesUsed: termination.usage.minutesUsed,
        minutesPaid: termination.usage.minutesPaid,
        refundAmount: termination.refund?.amount || 0,
        refundEligible: termination.refund?.eligible || false,
      });
    } catch (error) {
      console.error('[Browserbase x402] Failed to terminate session:', error);
      // Don't throw - execution already completed successfully
    }
  }

  // Also save to legacy skill_executions collection (for backward compatibility)
  await db.collection('skill_executions').insertOne({
    skillId: input.skillId,
    strategy,
    executionTime,
    tokensUsed,
    variables: processedVariables, // Use extracted/processed variables
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
 * Retry wrapper for dropdown selection handlers
 *
 * Provides automatic retry logic for transient failures (network issues, timing problems)
 *
 * @param handlerFn - The handler function to retry
 * @param handlerName - Name for logging purposes
 * @param maxRetries - Maximum number of retry attempts (default: 1)
 * @returns Result from the handler function
 */
async function retryDropdownSelection(
  handlerFn: () => Promise<any>,
  handlerName: string,
  maxRetries = 1
) {
  "use step";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await handlerFn();
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`[${handlerName}] All ${maxRetries + 1} attempts failed`);
        throw error;
      }

      console.warn(`[${handlerName}] Attempt ${attempt + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
}

/**
 * Wait for widget/dropdown to become visible
 *
 * Generic helper for waiting for any type of widget (autocomplete, calendar, dropdown)
 * to appear in the DOM and be visible before interacting with it.
 *
 * @param page - Playwright page object
 * @param widgetType - Type of widget to wait for
 * @param timeoutMs - Maximum time to wait (default: 2000ms)
 * @returns Promise<boolean> - true if widget appeared, false if timeout
 */
async function waitForWidgetVisible(
  page: any,
  widgetType: 'autocomplete' | 'calendar' | 'dropdown',
  timeoutMs = 2000
): Promise<boolean> {
  "use step";

  const selectorsByType = {
    autocomplete: [
      '[role="listbox"]',
      '[role="menu"]',
      '[class*="dropdown"]',
      '[class*="suggestions"]',
      '[class*="autocomplete"]',
      'ul[class*="autocomplete"]',
      '[id*="autocomplete"]'
    ],
    calendar: [
      // ✅ IMPROVED: Wait for actual date CELLS, not just calendar container
      // Calendar widgets often load the container first, then populate cells via JS
      '[id*="datepicker"] [class*="day"]',
      '[id*="datepicker"] td',
      '[id*="datepicker"] [role="gridcell"]',
      '[class*="calendar"] [class*="day"]',
      '[class*="calendar"] td',
      '[class*="calendar"] [role="gridcell"]',
      '[class*="picker"] [class*="day"]',
      '[class*="picker"] td',
      // Fallback: Container selectors (if cells use different naming)
      '[id*="datepicker"]',
      '[id*="calendar"]',
      '[class*="datepicker"]',
      '[class*="calendar"]',
      '[class*="picker"]',
      '[role="dialog"]'
    ],
    dropdown: [
      '[role="listbox"]',
      '[role="menu"]',
      '[class*="dropdown"]',
      'ul[class*="dropdown"]',
      'select[open]'
    ]
  };

  console.log(`[waitForWidget] Waiting for ${widgetType} widget (timeout: ${timeoutMs}ms)...`);

  const appeared = await page.evaluate(async (selectors: string[], timeout: number) => {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      for (const selector of selectors) {
        const el = document.querySelector(selector);
        if (el && (el as HTMLElement).offsetParent !== null) {
          return true; // Widget visible
        }
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false; // Timeout
  }, selectorsByType[widgetType], timeoutMs);

  if (appeared) {
    console.log(`[waitForWidget] ✓ ${widgetType} widget visible`);
  } else {
    console.warn(`[waitForWidget] ⚠️  ${widgetType} widget not detected after ${timeoutMs}ms`);
  }

  return appeared;
}

/**
 * Handle Traditional <select> Dropdown Selection
 *
 * Uses direct selectOption() API (no LLM cost) with fallback to observe→act pattern
 * Supports iframes via deepLocator
 *
 * @param page - Stagehand page object
 * @param stagehand - Stagehand instance (optional, for fallback)
 * @param selector - CSS or XPath selector for the <select> element
 * @param value - Value to select from dropdown
 * @param isInIframe - Whether the selector is inside an iframe
 * @returns Result object with success status and method used
 */
async function handleSelectDropdown(
  page: any,
  stagehand: any,
  selector: string,
  value: string,
  isInIframe = false
) {
  "use step";

  console.log(`[handleSelectDropdown] Selecting "${value}" from: ${selector}`);
  console.log(`[handleSelectDropdown] 🔍 Debug info:`, {
    selector,
    value,
    isInIframe,
    locatorType: isInIframe ? 'deepLocator' : 'locator'
  });

  try {
    // Strategy 1: Direct selectOption (fastest, no LLM)
    const locator = isInIframe
      ? page.deepLocator(selector)  // Use deepLocator for iframes
      : page.locator(selector);

    const selected = await locator.selectOption(value);
    console.log(`[handleSelectDropdown] ✓ Selected: ${selected}`);
    console.log(`[handleSelectDropdown] 📊 Result:`, {
      success: true,
      method: 'selectOption',
      selected,
      llmCost: 0
    });
    return { success: true, selected, method: 'selectOption' };

  } catch (error) {
    console.warn(`[handleSelectDropdown] selectOption failed: ${(error as Error).message}`);

    // Strategy 2: Fallback to observe→act (for non-standard selects)
    if (stagehand) {
      try {
        const [action] = await stagehand.observe(
          `find the dropdown to select "${value}"`,
          { timeout: 10000 }
        );

        if (action) {
          await stagehand.act(action);
          console.log(`[handleSelectDropdown] ✓ Selected via observe→act`);
          return { success: true, method: 'observe-act' };
        }
      } catch (observeError) {
        console.error(`[handleSelectDropdown] observe→act failed: ${(observeError as Error).message}`);
      }
    }

    // Capture screenshot for debugging
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      console.log(`[handleSelectDropdown] Screenshot captured (${screenshot.length} bytes)`);
    } catch (screenshotError) {
      // Ignore screenshot errors
    }

    throw new Error(`Failed to select "${value}" from <select> dropdown: ${(error as Error).message}`);
  }
}

/**
 * Handle Autocomplete/Suggestions Dropdown Selection
 *
 * Uses observe→act pattern to find and select from dropdown suggestions
 * Supports iframes via deepLocator
 *
 * @param stagehand - Stagehand instance for observe/act
 * @param page - Stagehand page object
 * @param selector - CSS or XPath selector for the input field
 * @param value - Value to type and select from suggestions
 * @param fieldDescription - Optional description for better observe accuracy
 * @param isInIframe - Whether the selector is inside an iframe
 * @returns Result object with success status and method used
 */
async function handleAutocompleteDropdown(
  stagehand: any,
  page: any,
  selector: string,
  value: string,
  fieldDescription = '',
  isInIframe = false
) {
  "use step";

  console.log(`[handleAutocomplete] Handling autocomplete for: ${value}`);

  try {
    // Step 1: Type value into field (triggers dropdown)
    // Note: fill() automatically clears existing content (locator.md:76-92)
    const locator = isInIframe
      ? page.deepLocator(selector)
      : page.locator(selector);

    await locator.fill(value);
    console.log(`[handleAutocomplete] ✓ Typed "${value}"`);

    // Step 2: Wait for dropdown suggestions to appear (smart wait)
    const dropdownAppeared = await waitForWidgetVisible(page, 'autocomplete', 2000);
    if (!dropdownAppeared) {
      console.warn('[handleAutocomplete] ⚠️  Dropdown not detected, proceeding anyway');
    }

    // Step 3: Use observe() to find dropdown suggestions
    const instruction = fieldDescription
      ? `find the dropdown option containing "${value}" in the ${fieldDescription} autocomplete menu`
      : `find the dropdown option containing the text "${value}"`;

    console.log(`[handleAutocomplete] 🔍 Observing: ${instruction}`);

    const actions = await stagehand.observe(instruction, {
      timeout: 10000
    });

    // Debug logging for observe results
    console.log('[handleAutocomplete] 📊 observe() returned:', {
      actionsCount: actions?.length || 0,
      timeout: 10000,
      instruction: instruction
    });

    if (actions && actions.length > 0) {
      // Log first action details for debugging
      console.log('[handleAutocomplete] 📋 First action:', {
        selector: actions[0].selector,
        description: actions[0].description,
        method: actions[0].method
      });
    }

    if (!actions || actions.length === 0) {
      // ✅ IMPROVED: Specific error message for autocomplete
      console.warn(`[handleAutocomplete] ⚠️  observe returned no actions - dropdown may not have appeared`);

      // ✅ NEW: Capture screenshot for debugging
      try {
        const screenshot = await page.screenshot({ fullPage: false });
        console.log(`[handleAutocomplete] 📸 Screenshot captured (${screenshot.length} bytes) for debugging`);
      } catch (screenshotError) {
        console.warn('[handleAutocomplete] Failed to capture screenshot:', (screenshotError as Error).message);
      }

      // Fallback: Try natural language act() as last resort
      console.warn(`[handleAutocomplete] Trying natural language fallback...`);
      try {
        await stagehand.act(`select "${value}" from the dropdown`);

        // Verify selection worked
        await new Promise(resolve => setTimeout(resolve, 500));
        const currentValue = await locator.inputValue().catch(() => '');

        if (currentValue.toLowerCase().includes(value.toLowerCase().substring(0, 3))) {
          console.log(`[handleAutocomplete] ✓ Fallback succeeded`);
          return { success: true, method: 'fallback' };
        }
      } catch (fallbackError) {
        // Both observe and fallback failed - throw descriptive error
        throw new Error(
          `Autocomplete dropdown not found for "${value}" - dropdown may not have appeared after typing. ` +
          `Field: "${fieldDescription || 'unknown'}". Tried observe→act and natural language fallback, both failed.`
        );
      }

      throw new Error(
        `Autocomplete selection failed for "${value}" - field value did not match after selection attempt. ` +
        `Expected to contain "${value.substring(0, 3)}" but got "${await locator.inputValue().catch(() => 'unknown')}"`
      );
    }

    console.log(`[handleAutocomplete] Found ${actions.length} suggestions`);

    // Step 4: Click the first matching suggestion
    const [suggestionAction] = actions;
    console.log(`[handleAutocomplete] 📝 Clicking: ${suggestionAction.description}`);
    await stagehand.act(suggestionAction);

    // Step 5: Wait for dropdown to close and page to stabilize
    // ✅ INCREASED: 1000ms → gives website time to process selection and run validation JS
    // Some websites clear other fields during validation - this settling time prevents that
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verify selection by checking field value (no extra LLM call)
    const selectedValue = await locator.inputValue().catch(() => '');
    console.log(`[handleAutocomplete] Field value after selection: "${selectedValue}"`);

    console.log(`[handleAutocomplete] ✓ Autocomplete selection complete`);
    return { success: true, selectedValue, method: 'observe-act' };

  } catch (error) {
    console.error(`[handleAutocomplete] Failed:`, (error as Error).message);

    // Capture screenshot for debugging
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      console.log(`[handleAutocomplete] Screenshot captured (${screenshot.length} bytes)`);
    } catch (screenshotError) {
      // Ignore screenshot errors
    }

    throw new Error(`Autocomplete selection failed for "${value}": ${(error as Error).message}`);
  }
}

/**
 * Handle Custom Dropdown Widget Selection
 *
 * For custom dropdown widgets (non-<select>, non-autocomplete)
 * Uses observe→act pattern to open dropdown and select option
 *
 * @param stagehand - Stagehand instance for observe/act
 * @param page - Stagehand page object
 * @param triggerSelector - Selector for the dropdown trigger/button
 * @param value - Value to select from dropdown
 * @param fieldDescription - Optional description for better observe accuracy
 * @returns Result object with success status
 */
async function handleCustomDropdown(
  stagehand: any,
  page: any,
  triggerSelector: string, // Note: Using observe() instead of direct selector for reliability
  value: string,
  fieldDescription = ''
) {
  "use step";

  console.log(`[handleCustomDropdown] Opening dropdown for: ${value}`);
  console.log(`[handleCustomDropdown] 🔍 Debug info:`, {
    triggerSelector,
    value,
    fieldDescription,
    useObserve: true
  });

  try {
    // Step 1: Click trigger to open dropdown (using observe for reliability)
    const [openAction] = await stagehand.observe(
      `find the ${fieldDescription} dropdown button`,
      { timeout: 10000 }
    );

    // Debug logging for observe results
    if (openAction) {
      console.log('[handleCustomDropdown] 📋 Trigger action:', {
        selector: openAction.selector,
        description: openAction.description,
        method: openAction.method
      });
    }

    if (openAction) {
      await stagehand.act(openAction);
      console.log(`[handleCustomDropdown] ✓ Dropdown opened`);
    } else {
      throw new Error('Dropdown trigger not found');
    }

    // Step 2: Wait for dropdown to render (smart wait)
    const dropdownAppeared = await waitForWidgetVisible(page, 'dropdown', 2000);
    if (!dropdownAppeared) {
      console.warn('[handleCustomDropdown] ⚠️  Dropdown not detected, proceeding anyway');
    }

    // Step 3: Find and click the option
    const instruction = `find the option "${value}" in the ${fieldDescription} dropdown menu`;
    const [optionAction] = await stagehand.observe(instruction, {
      timeout: 10000
    });

    if (!optionAction) {
      // ✅ NEW: Capture screenshot for debugging
      try {
        const screenshot = await page.screenshot({ fullPage: false });
        console.log(`[handleCustomDropdown] 📸 Screenshot captured (${screenshot.length} bytes) - option not found`);
      } catch (screenshotError) {
        console.warn('[handleCustomDropdown] Failed to capture screenshot:', (screenshotError as Error).message);
      }

      // ✅ IMPROVED: Specific error message for custom dropdown
      throw new Error(
        `Custom dropdown option "${value}" not found in ${fieldDescription} dropdown. ` +
        `Dropdown widget ${dropdownAppeared ? 'appeared but option not found' : 'may not have appeared'}. ` +
        `Searched with instruction: "${instruction}"`
      );
    }

    console.log(`[handleCustomDropdown] 📝 Selecting: ${optionAction.description}`);
    await stagehand.act(optionAction);

    // Step 4: Wait for dropdown to close
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`[handleCustomDropdown] ✓ Custom dropdown selection complete`);
    return { success: true, selectedValue: value };

  } catch (error) {
    console.error(`[handleCustomDropdown] Failed:`, (error as Error).message);

    // Capture screenshot
    try {
      await page.screenshot({ fullPage: false });
    } catch (e) { /* ignore */ }

    throw error;
  }
}

/**
 * Handle Date Picker Selection (Simplified)
 *
 * Tries direct text input first (works for most date pickers)
 * Falls back to AI navigation for complex calendar UIs
 *
 * @param stagehand - Stagehand instance for AI navigation
 * @param page - Stagehand page object
 * @param selector - Selector for the date input field
 * @param dateValue - Date value (e.g., "2024-12-25" or "12/25/2024")
 * @param fieldDescription - Optional description for better AI accuracy
 * @returns Result object with success status and method used
 */
async function handleDatePicker(
  stagehand: any,
  page: any,
  selector: string,
  dateValue: string,
  fieldDescription = ''
) {
  "use step";

  console.log(`[handleDatePicker] Selecting date: ${dateValue}`);
  console.log(`[handleDatePicker] 🔍 Debug info:`, {
    selector,
    dateValue,
    fieldDescription,
    strategy: 'direct-input-first'
  });

  try {
    // Strategy 1: Try direct text input (many date pickers accept this)
    console.log('[handleDatePicker] 🎯 Trying Strategy 1: Direct text input');
    const locator = page.locator(selector);
    await locator.fill(dateValue);

    // Verify it worked
    await new Promise(resolve => setTimeout(resolve, 500));
    const currentValue = await locator.inputValue().catch(() => '');

    if (currentValue && currentValue.includes(dateValue.substring(5, 10))) {
      console.log(`[handleDatePicker] ✓ Direct input succeeded: ${currentValue}`);
      return { success: true, method: 'direct-input' };
    }

    throw new Error('Direct input did not work');

  } catch (directError) {
    console.log(`[handleDatePicker] Direct input failed, using AI navigation`);

    // Strategy 2: Use AI to navigate the date picker UI
    try {
      // Parse date for natural language
      const date = new Date(dateValue);
      const monthName = date.toLocaleString('en-US', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();

      const instruction = `select the date ${monthName} ${day}, ${year} in the ${fieldDescription} date picker`;
      console.log(`[handleDatePicker] AI instruction: ${instruction}`);

      // Let AI figure out the complex UI (click calendar icon, navigate months, etc.)
      await stagehand.act(instruction);

      console.log(`[handleDatePicker] ✓ AI navigation succeeded`);
      return { success: true, method: 'ai-navigation' };

    } catch (aiError) {
      console.error(`[handleDatePicker] All strategies failed`);

      // Screenshot
      try {
        await page.screenshot({ fullPage: false });
      } catch (e) { /* ignore */ }

      throw new Error(`Date picker selection failed for "${dateValue}": ${(aiError as Error).message}`);
    }
  }
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

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    console.log('[executeExactReplay] Action:', action.type, action.description);

    if (action.type === 'navigate') {
      await page.goto(action.url, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 10000,
      });
    } else if (action.type === 'click') {
      // ✅ IMPROVED: Detect optional elements (cookie banners, popups) that may not always appear
      const isOptionalElement = action.description && (
        action.description.toLowerCase().includes('accept') ||
        action.description.toLowerCase().includes('cookie') ||
        action.description.toLowerCase().includes('dismiss') ||
        action.description.toLowerCase().includes('close popup')
      );

      if (isOptionalElement) {
        // Try to click optional elements but don't fail if not found
        try {
          console.log('[executeExactReplay] Optional element detected, attempting click...');
          await page.locator(action.selector).click();
          console.log('[executeExactReplay] ✓ Optional element clicked');
        } catch (error) {
          console.log('[executeExactReplay] ⚠️ Optional element not found, continuing...', (error as Error).message);
          // Don't throw - continue execution
        }
      } else {
        // Required elements - try exact selector, then observe→act fallback
        try {
          await page.locator(action.selector).click();

          // ✅ NEW: Wait for calendar widget if this is a date field opener
          const nextAction = actions[i + 1];
          const isDateFieldOpener = nextAction && (nextAction as any).semanticType === 'date-picker';

          if (isDateFieldOpener) {
            console.log('[executeExactReplay] 🗓️  Date field opener clicked, waiting for calendar widget...');

            // Wait for calendar widget to appear (smart wait)
            // ✅ INCREASED: 5000ms timeout for calendar (date cells load slowly via JS)
            const calendarAppeared = await waitForWidgetVisible(page, 'calendar', 5000);

            if (calendarAppeared) {
              // Additional settle time for animations
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        } catch (error) {
          console.warn('[executeExactReplay] Required click failed, using observe→act fallback:', (error as Error).message);
          if (stagehand) {
            // ✅ IMPROVED: Use observe() to find element with semantic context
            // Build context-aware description using semantic metadata
            const semanticType = (action as any).semanticType;
            const semanticLabel = (action as any).semanticLabel;
            let description = action.description || 'the target element to click';

            // Enhance description with semantic context for disambiguation
            if (semanticType === 'date-picker' && semanticLabel) {
              // Extract day number from description (e.g., "Click 19" → "19")
              const dayMatch = description.match(/(\d{1,2})/);
              const day = dayMatch ? dayMatch[1] : '';
              // ✅ IMPROVED: More specific instruction to avoid finding prices/other numbers
              description = `calendar date cell for day ${day} in the ${semanticLabel} date picker widget`;
              console.log('[executeExactReplay] 🗓️  Date-picker context added:', description);
            } else if (semanticType === 'autocomplete' && semanticLabel) {
              description = `autocomplete field for ${semanticLabel}`;
              console.log('[executeExactReplay] 🔍 Autocomplete context added:', description);
            } else if (semanticType) {
              description = `${semanticType} element: ${description}`;
              console.log('[executeExactReplay] 🏷️  Semantic type added:', semanticType);
            }

            // Scope observe() query to container if possible
            let scopedDescription = description;
            let observeOptions: any = {};
            const selectorHint = action.selector;

            if (selectorHint) {
              // Extract container hints from selector (e.g., form, section, dialog)
              const containerMatch = selectorHint.match(/(form|section|dialog|div\[class.*form|div\[id.*form)/i);
              if (containerMatch) {
                scopedDescription = `within the form: ${description}`;
                console.log('[executeExactReplay] 🎯 Scoped to form container');
              }
            }

            // ✅ NEW: For date-picker clicks, scope to calendar widget if it exists
            if (semanticType === 'date-picker') {
              const calendarSelector = await page.evaluate(() => {
                const selectors = [
                  '[id*="datepicker"]', '[id*="calendar"]',
                  '[class*="datepicker"]', '[class*="calendar"]',
                  '[class*="picker"]', '[role="dialog"]'
                ];
                for (const selector of selectors) {
                  const el = document.querySelector(selector);
                  if (el && (el as HTMLElement).offsetParent !== null) {
                    // Return XPath for Stagehand
                    const xpath = (el as any).ownerDocument.evaluate(
                      'count(preceding-sibling::*)+1',
                      el,
                      null,
                      XPathResult.NUMBER_TYPE,
                      null
                    ).numberValue;
                    const parent = (el as any).parentNode;
                    const parentPath = parent && parent.tagName !== 'HTML'
                      ? '/' + parent.tagName.toLowerCase()
                      : '';
                    return `${parentPath}/*[${xpath}]`;
                  }
                }
                return null;
              }).catch(() => null);

              if (calendarSelector) {
                observeOptions.selector = calendarSelector;
                console.log('[executeExactReplay] 🎯 Scoping observe to calendar widget:', calendarSelector);
              }
            }

            console.log('[executeExactReplay] Observing for:', scopedDescription);

            const [observedAction] = await stagehand.observe(`find ${scopedDescription}`, observeOptions);

            if (observedAction && observedAction.method === 'click') {
              // Use the observed Action directly for clicks (no modification needed)
              console.log('[executeExactReplay] ✓ Found via observe, executing deterministically');
              await stagehand.act(observedAction);  // Deterministic execution (no LLM)

              // ✅ NEW: Wait for calendar widget if this is a date field opener (fallback path)
              const nextAction = actions[i + 1];
              const isDateFieldOpener = nextAction && (nextAction as any).semanticType === 'date-picker';

              if (isDateFieldOpener) {
                console.log('[executeExactReplay] 🗓️  Date field opener clicked (fallback), waiting for calendar...');
                // ✅ INCREASED: 5000ms timeout for calendar (date cells load slowly via JS)
            const calendarAppeared = await waitForWidgetVisible(page, 'calendar', 5000);
                if (calendarAppeared) {
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              }
            } else {
              // ✅ IMPROVED: Specific error message for date-picker
              if (semanticType === 'date-picker') {
                console.error('[executeExactReplay] ❌ Date picker calendar cells not found');
                console.error('[executeExactReplay] This likely means the calendar widget did not open properly');
                console.error('[executeExactReplay] Searched for:', scopedDescription);

                // ✅ NEW: Capture screenshot for debugging
                try {
                  const screenshot = await page.screenshot({ fullPage: false });
                  console.log(`[executeExactReplay] 📸 Screenshot captured (${screenshot.length} bytes) - date picker cells not found`);
                } catch (screenshotError) {
                  console.warn('[executeExactReplay] Failed to capture screenshot:', (screenshotError as Error).message);
                }
              }

              // Final fallback: pure natural language
              console.log('[executeExactReplay] ⚠️  observe failed, using natural language');
              const fallbackInstruction = action.description || 'click the target element';

              try {
                await stagehand.act(fallbackInstruction);
              } catch (nlError) {
                // Both observe and natural language failed
                if (semanticType === 'date-picker') {
                  throw new Error(
                    `Date picker calendar cells not found - calendar widget may not be open. ` +
                    `Searched for: "${scopedDescription}". ` +
                    `Both observe→act and natural language fallback failed.`
                  );
                }
                throw nlError; // Re-throw for other types
              }

              // ✅ NEW: Wait for calendar widget (natural language fallback path)
              const nextAction = actions[i + 1];
              const isDateFieldOpener = nextAction && (nextAction as any).semanticType === 'date-picker';

              if (isDateFieldOpener) {
                console.log('[executeExactReplay] 🗓️  Date field opener clicked (NL fallback), waiting...');
                // ✅ INCREASED: 5000ms timeout for calendar (date cells load slowly via JS)
            const calendarAppeared = await waitForWidgetVisible(page, 'calendar', 5000);
                if (calendarAppeared) {
                  await new Promise(resolve => setTimeout(resolve, 300));
                }
              }
            }
          } else {
            throw error;
          }
        }
      }
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

      // ✅ DROPDOWN HANDLING: Check if this is a <select> dropdown
      const dropdownType = (action as any).dropdownType;
      const isInIframe = (action as any).isInIframe || false;

      // Debug logging for dropdown detection
      if (dropdownType || isInIframe) {
        console.log('[executeExactReplay] 🔍 Dropdown metadata detected:', {
          dropdownType: dropdownType || 'none',
          isInIframe,
          selector: action.selector,
          value: value,
          semanticType: (action as any).semanticType,
          description: action.description
        });
      }

      if (dropdownType === 'select' && action.selector) {
        console.log('[executeExactReplay] 🎯 Select dropdown detected, using handleSelectDropdown');
        try {
          const result = await handleSelectDropdown(page, stagehand, action.selector, value, isInIframe);
          console.log('[executeExactReplay] ✓ Select dropdown handled successfully:', {
            method: result.method,
            selected: result.selected || result.success
          });
          continue; // Skip normal fill/type logic, move to next action
        } catch (dropdownError) {
          console.error('[executeExactReplay] ❌ Select dropdown handler failed:', (dropdownError as Error).message);
          throw dropdownError; // Propagate error to trigger strategy fallback
        }
      }

      // Try exact selector first; fall back to observe→act if the selector drifted
      try {
        await page.locator(action.selector).fill(value);
      } catch (error) {
        console.warn('[executeExactReplay] Exact fill failed, using observe→act fallback:', (error as Error).message);
        if (stagehand) {
          // ✅ IMPROVED: Use observe() to find element with semantic context
          // Build context-aware description using semantic metadata
          const semanticType = (action as any).semanticType;
          const semanticLabel = (action as any).semanticLabel;
          let description = action.description || `field to fill with "${value}"`;

          // Enhance description with semantic context for disambiguation
          if (semanticType === 'date-picker' && semanticLabel) {
            description = `date picker field for ${semanticLabel}`;
            console.log('[executeExactReplay] 🗓️  Date-picker context added:', description);
          } else if (semanticType === 'autocomplete' && semanticLabel) {
            description = `autocomplete field for ${semanticLabel}`;
            console.log('[executeExactReplay] 🔍 Autocomplete context added:', description);
          } else if (semanticType) {
            description = `${semanticType} field: ${description}`;
            console.log('[executeExactReplay] 🏷️  Semantic type added:', semanticType);
          }

          // Scope observe() query to container if possible
          let scopedDescription = description;
          const selectorHint = action.selector;

          if (selectorHint) {
            // Extract container hints from selector (e.g., form, section, dialog)
            const containerMatch = selectorHint.match(/(form|section|dialog|div\[class.*form|div\[id.*form)/i);
            if (containerMatch) {
              scopedDescription = `within the form: ${description}`;
              console.log('[executeExactReplay] 🎯 Scoped to form container');
            }
          }

          console.log('[executeExactReplay] Observing for:', scopedDescription);

          const [observedAction] = await stagehand.observe(`find ${scopedDescription}`);

          if (observedAction && observedAction.method === 'fill') {
            // Create NEW Action object with our value (don't mutate observed action)
            const actionWithValue = {
              selector: observedAction.selector,
              description: observedAction.description,
              method: 'fill' as const,
              arguments: [value]
            };
            console.log('[executeExactReplay] ✓ Found via observe, executing deterministically');
            await stagehand.act(actionWithValue);  // Deterministic execution (no LLM)
          } else {
            // Final fallback: pure natural language
            console.log('[executeExactReplay] ⚠️  observe failed, using natural language');
            const fallbackInstruction = action.description
              ? `${action.description} with value "${value}"`
              : `fill the field with "${value}"`;
            await stagehand.act(fallbackInstruction);
          }
        } else {
          throw error;
        }
      }

      // ✅ AUTOCOMPLETE HANDLING: Use observe→act pattern to fix {} error
      // Check for autocomplete AFTER select dropdown check (priority order)
      if (dropdownType === 'autocomplete' && stagehand && action.selector) {
        console.log('[executeExactReplay] 🎯 Autocomplete dropdown detected, using handleAutocompleteDropdown');
        try {
          const fieldDesc = action.description || '';
          await handleAutocompleteDropdown(
            stagehand,
            page,
            action.selector,
            value,
            fieldDesc,
            isInIframe
          );
          console.log('[executeExactReplay] ✓ Autocomplete dropdown handled successfully');
          continue; // Skip normal fill/type logic, move to next action
        } catch (autocompleteError) {
          console.error('[executeExactReplay] ❌ Autocomplete handler failed:', (autocompleteError as Error).message);
          throw autocompleteError; // Propagate error to trigger strategy fallback
        }
      }

      // FALLBACK: Also check old semanticType field for backwards compatibility
      const isAutocompleteField = (action as any).semanticType === 'autocomplete';
      if (isAutocompleteField && !dropdownType && stagehand && action.selector) {
        console.log('[executeExactReplay] 🎯 Autocomplete detected (via semanticType), using handleAutocompleteDropdown');
        try {
          const fieldDesc = action.description || '';
          await handleAutocompleteDropdown(
            stagehand,
            page,
            action.selector,
            value,
            fieldDesc,
            isInIframe
          );
          console.log('[executeExactReplay] ✓ Autocomplete handled successfully');
          continue; // Skip normal fill/type logic, move to next action
        } catch (autocompleteError) {
          console.error('[executeExactReplay] ❌ Autocomplete handler failed:', (autocompleteError as Error).message);
          throw autocompleteError; // Propagate error to trigger strategy fallback
        }
      }

      // ✅ CUSTOM DROPDOWN HANDLING: Handle custom dropdown widgets
      if (dropdownType === 'custom' && stagehand && action.selector) {
        console.log('[executeExactReplay] 🎯 Custom dropdown detected, using handleCustomDropdown');
        try {
          const fieldDesc = action.description || '';
          await handleCustomDropdown(
            stagehand,
            page,
            action.selector,
            value,
            fieldDesc
          );
          console.log('[executeExactReplay] ✓ Custom dropdown handled successfully');
          continue; // Skip normal fill/type logic, move to next action
        } catch (customDropdownError) {
          console.error('[executeExactReplay] ❌ Custom dropdown handler failed:', (customDropdownError as Error).message);
          throw customDropdownError; // Propagate error to trigger strategy fallback
        }
      }

      // ✅ DATE PICKER HANDLING: Handle date picker widgets
      if (dropdownType === 'datepicker' && stagehand && action.selector) {
        console.log('[executeExactReplay] 🗓️  Date picker detected, using handleDatePicker');
        try {
          const fieldDesc = action.description || '';
          await handleDatePicker(
            stagehand,
            page,
            action.selector,
            value,
            fieldDesc
          );
          console.log('[executeExactReplay] ✓ Date picker handled successfully');
          continue; // Skip normal fill/type logic, move to next action
        } catch (datePickerError) {
          console.error('[executeExactReplay] ❌ Date picker handler failed:', (datePickerError as Error).message);
          throw datePickerError; // Propagate error to trigger strategy fallback
        }
      }
    } else if (action.type === 'submit') {
      // Submit the form by pressing Enter
      // The selector points to the input field that triggered the navigation
      if (action.selector) {
        console.log('[executeExactReplay] ⏎ Submitting form via:', action.selector);

        // Capture URL before submit to detect navigation
        const urlBeforeSubmit = page.url();
        console.log('[executeExactReplay] URL before submit:', urlBeforeSubmit);

        try {
          // Wait for autocomplete suggestions to load after typing
          await new Promise(resolve => setTimeout(resolve, 1000));

          // ✅ NEW: Pre-submit validation - Check and refill cleared fields
          // Some websites have bugs that clear origin when destination is selected
          const formFieldCheck = await page.evaluate(() => {
            const origin = document.querySelector('#flights-origin-prepop-whitelabel_en') as HTMLInputElement;
            const destination = document.querySelector('#flights-destination-prepop-whitelabel_en') as HTMLInputElement;
            return {
              origin: origin?.value || '',
              destination: destination?.value || '',
              originExists: !!origin,
              destinationExists: !!destination
            };
          });
          console.log('[executeExactReplay] 📋 Form fields before submit:', formFieldCheck);

          // ✅ FIX: Re-fill origin if it was cleared by website's buggy JavaScript
          if (formFieldCheck.originExists && !formFieldCheck.origin && variables?.origin) {
            console.log('[executeExactReplay] ⚠️  Origin field was cleared! Re-filling with:', variables.origin);
            const originLocator = page.locator('#flights-origin-prepop-whitelabel_en');
            await originLocator.fill(variables.origin as string);
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('[executeExactReplay] ✓ Origin field restored');
          } else if (!formFieldCheck.originExists) {
            console.warn('[executeExactReplay] ⚠️  Origin field (#flights-origin-prepop-whitelabel_en) does not exist in DOM before submit!');
            console.warn('[executeExactReplay] The website may have removed or changed the field after destination was selected.');
            console.warn('[executeExactReplay] This is a website bug - proceeding with submit anyway...');
          }

          // Submit the form using page.evaluate() (verified against Stagehand docs)
          console.log('[executeExactReplay] ⏎ Submitting form via:', action.selector);

          await page.evaluate((selector: string) => {
            const el = document.querySelector(selector);
            if (el) {
              const form = el.closest('form');
              if (form) {
                form.requestSubmit(); // Modern way to trigger submit with validation
              } else {
                // Fallback: Dispatch Enter key event
                el.dispatchEvent(new KeyboardEvent('keydown', {
                  key: 'Enter',
                  code: 'Enter',
                  keyCode: 13,
                  bubbles: true
                }));
              }
            }
          }, action.selector);

          // Wait for navigation to occur (poll for URL change)
          const navigationStartTime = Date.now();
          let navigationOccurred = false;

          while (Date.now() - navigationStartTime < 10000) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const currentUrl = page.url();

            if (currentUrl !== urlBeforeSubmit) {
              navigationOccurred = true;
              console.log('[executeExactReplay] ✓ Navigation detected:', currentUrl);
              break;
            }
          }

          if (!navigationOccurred) {
            throw new Error('Form submission did not trigger navigation - autocomplete dropdown may require explicit selection');
          }

          // Wait for page to be fully loaded
          // Stagehand v3 API: waitForLoadState(state, timeoutMs?)
          await page.waitForLoadState('domcontentloaded', 5000);
          console.log('[executeExactReplay] ✓ Navigation completed after submit');
        } catch (error) {
          console.error('[executeExactReplay] ✗ Submit failed:', (error as Error).message);
          throw error; // Re-throw to fail Strategy 1 and try Strategy 2
        }
      } else {
        // Fallback: Use AI to find and click submit button
        console.warn('[executeExactReplay] No selector for submit action, using AI fallback');
        if (stagehand) {
          await stagehand.act(action.description || 'Submit search');
          console.log('[executeExactReplay] Submitted using Stagehand act():', action.description);
        }
      }
    } else if (action.type === 'scroll') {
      // Replay scroll action with precise positioning
      try {
        console.log(`[executeExactReplay] Scrolling to ${action.scrollPercent}%`);

        // Use Playwright page.evaluate for precise scroll
        await page.evaluate((scrollData: any) => {
          if (scrollData.scrollTarget === 'window') {
            // Scroll window
            window.scrollTo({
              top: scrollData.scrollPosition.y,
              left: scrollData.scrollPosition.x,
              behavior: 'smooth'
            });
          }
        }, {
          scrollTarget: action.scrollTarget,
          scrollPosition: action.scrollPosition,
        });

        // Wait for scroll to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log(`[executeExactReplay] ✓ Scroll completed`);
      } catch (error) {
        console.error(`[executeExactReplay] ✗ Scroll failed:`, error);
        throw error;
      }
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // EXTRACTION: If schema and stagehand are provided, extract data
  let extraction = null;
  if (stagehand && zodExtractionSchema && extractionInstruction) {
    // Auto-scroll to trigger lazy-loaded content before extraction
    await autoScrollForExtraction(page);

    // Get optimal selector for this page to reduce context window usage
    const currentUrl = page.url();
    const extractionSelector = getExtractionSelector(currentUrl);

    if (extractionSelector) {
      console.log(`[executeExactReplay] Using targeted extraction with selector: ${extractionSelector}`);
      extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema, {
        selector: extractionSelector,
        timeout: 120000 // 2 minutes for large pages
      });
    } else {
      console.log('[executeExactReplay] Extracting data with schema (full page)...');
      extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema, {
        timeout: 120000 // 2 minutes for large pages
      });
    }
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

  for (let i = 0; i < workflow.length; i++) {
    const action = workflow[i];
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

    // 🔍 AUTOCOMPLETE DETECTION: Detect autocomplete patterns and handle type-then-select
    // Pattern 1: fill + submit (Wikipedia style)
    // Pattern 2: fill + click (Flight search dropdown style)
    // ✅ FIX: Use semantic type to accurately detect date pickers (not heuristics)
    let isAutocomplete = false;
    let autocompleteType = null;

    // ✅ IMPROVED: Check semantic type to avoid misclassifying date pickers as autocomplete
    const isDatePicker = action.semanticType === 'date-picker';

    if (!isDatePicker &&
        action.method === 'act' &&
        instruction &&
        instruction.toLowerCase().includes('fill') &&
        value &&
        i + 1 < workflow.length) {

      const nextInstruction = workflow[i + 1].instruction?.toLowerCase() || '';

      if (nextInstruction.includes('submit')) {
        console.log('[executeNaturalLanguage] 🔍 Detected autocomplete pattern: fill + submit');
        isAutocomplete = true;
        autocompleteType = 'submit';
      } else if (nextInstruction.includes('click')) {
        console.log('[executeNaturalLanguage] 🔍 Detected autocomplete pattern: fill + click dropdown');
        isAutocomplete = true;
        autocompleteType = 'click';
      }
    }

    console.log('[executeNaturalLanguage] Action:', action.method, instruction);

    if (action.method === 'navigate') {
      await page.goto(action.url!, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 10000,
      });
    } else if (action.method === 'act') {
      // ✅ IMPROVED: Detect optional elements (cookie banners, popups) that may not always appear
      const isOptionalElement = instruction && (
        instruction.toLowerCase().includes('accept') ||
        instruction.toLowerCase().includes('cookie') ||
        instruction.toLowerCase().includes('dismiss') ||
        instruction.toLowerCase().includes('close popup')
      );

      // Use AI for all actions in Natural Language strategy
      console.log('[executeNaturalLanguage] Executing via AI:', instruction);

      if (isOptionalElement) {
        // Try optional actions but don't fail if element not found
        try {
          await stagehand.act(instruction, { page: page, timeout: 5000 });
          console.log('[executeNaturalLanguage] ✓ Optional action completed');
        } catch (error) {
          console.log('[executeNaturalLanguage] ⚠️ Optional element not found, continuing...', (error as Error).message);
          // Don't throw - continue execution
        }
      } else {
        // Required actions - fail if they don't work

        // ✅ DROPDOWN DETECTION: Use observe→act for dropdown selections
        const isDropdownAction = /select|choose|pick.*from|dropdown/i.test(instruction || '');

        if (isDropdownAction) {
          console.log('[executeNaturalLanguage] 🎯 Dropdown action detected, using observe→act pattern');
          try {
            const [observedAction] = await stagehand.observe(instruction, { timeout: 10000 });
            if (observedAction) {
              console.log('[executeNaturalLanguage] ✓ Found via observe, executing deterministically');
              await stagehand.act(observedAction);
            } else {
              console.warn('[executeNaturalLanguage] observe returned nothing, using direct act as fallback');
              await stagehand.act(instruction, { page: page });
            }
          } catch (observeError) {
            console.warn('[executeNaturalLanguage] observe failed, using direct act as fallback:', (observeError as Error).message);
            await stagehand.act(instruction, { page: page });
          }
        } else {
          // Non-dropdown actions - use direct act
          await stagehand.act(instruction, { page: page });
        }
      }

      // Wait for scroll to complete if this is a scroll action
      if (instruction && instruction.toLowerCase().includes('scroll')) {
        console.log('[executeNaturalLanguage] 💤 Waiting 1s for scroll to complete...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 🔍 AUTOCOMPLETE TWO-STEP: After typing, wait for dropdown and select suggestion
      if (isAutocomplete) {
        console.log(`[executeNaturalLanguage] 💤 Waiting 3s for autocomplete dropdown to load (type: ${autocompleteType})...`);
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log(`[executeNaturalLanguage] 🎯 Selecting option matching typed value: "${value}"`);
        const urlBeforeClick = page.url();
        console.log('[executeNaturalLanguage] URL before click:', urlBeforeClick);

        // ✅ CRITICAL: Use the VARIABLE VALUE (not hardcoded recorded value)
        // This allows "New York" to be selected even if "Vancouver" was recorded
        const clickInstruction = `click on the link or suggestion containing '${value}' in the dropdown list`;
        console.log('[executeNaturalLanguage] Dynamic click instruction:', clickInstruction);

        try {
          await stagehand.act(clickInstruction, { page: page });
          console.log('[executeNaturalLanguage] ✓ Autocomplete option selected');
        } catch (error) {
          console.error('[executeNaturalLanguage] ⚠️  Error during dropdown selection:', (error as Error).message);

          // Check if navigation actually occurred despite the error (Stagehand internal error after successful click)
          await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for potential navigation
          const urlAfterClick = page.url();
          console.log('[executeNaturalLanguage] URL after click:', urlAfterClick);

          if (urlAfterClick !== urlBeforeClick) {
            console.log('[executeNaturalLanguage] ✓ Navigation occurred despite error - treating as success');
            // Navigation happened, continue execution
          } else {
            console.error('[executeNaturalLanguage] ✗ No navigation occurred - selection truly failed');
            throw error; // Re-throw if navigation didn't happen
          }
        }

        // Skip the next action (submit or click) since we handled it via autocomplete
        i++; // Skip next action
        console.log(`[executeNaturalLanguage] ⏭️  Skipped redundant ${autocompleteType} action`);
      }
    } else if (action.method === 'extract') {
      // If schema is provided, use it
      if (action.schema) {
        return await stagehand.extract(instruction, z.object(action.schema as any), {
          timeout: 120000 // 2 minutes for large pages
        });
      } else {
        return await stagehand.extract(instruction, undefined, {
          timeout: 120000 // 2 minutes for large pages
        });
      }
    }

    // Small delay between actions
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // EXTRACTION: If schema is provided, extract data at the end
  let extraction = null;
  if (zodExtractionSchema && extractionInstruction) {
    // Auto-scroll to trigger lazy-loaded content before extraction
    await autoScrollForExtraction(page);

    // Get optimal selector for this page to reduce context window usage
    const currentUrl = page.url();
    const extractionSelector = getExtractionSelector(currentUrl);

    if (extractionSelector) {
      console.log(`[executeNaturalLanguage] Using targeted extraction with selector: ${extractionSelector}`);
      extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema, {
        selector: extractionSelector,
        timeout: 120000 // 2 minutes for large pages
      });
    } else {
      console.log('[executeNaturalLanguage] Extracting data with schema (full page)...');
      extraction = await stagehand.extract(extractionInstruction, zodExtractionSchema, {
        timeout: 120000 // 2 minutes for large pages
      });
    }
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
    cua: false,  // Use standard tool-based operation (not computer control mode)
    systemPrompt: `You are a web automation expert. Your goal: ${goalWithVars}.

IMPORTANT RULES:
1. You are already on ${currentSite} - DO NOT navigate to any other website
2. Complete the entire task on this website only${validationCriteria}${schemaDescription}

DROPDOWN SELECTION BEST PRACTICES:
- When selecting from dropdowns, ALWAYS use observe() first to find options, then act() on the observed action
- Example: actions = await observe("find the dropdown option containing 'NYC'"); await act(actions[0])
- This ensures reliable selection even if UI changes

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
      // Unwrap the actual data from the agent's extraction format
      // Agent returns: { type: 'extract', result: {...actual data...}, success: true, ... }
      // We want just the result field for consistency with Strategy 1/2
      const rawExtraction = extractionAction.extraction || extractionAction;
      extractionData = rawExtraction.result || rawExtraction;
      console.log('[executeAIRelearn] Found extraction data:', extractionData);
    }
  }

  // If no extraction found but schema is available, try manual extraction
  if (!extractionData && zodExtractionSchema && extractionSchemaInfo?.instruction) {
    console.log('[executeAIRelearn] No extraction in agent result, trying manual extraction...');

    // Auto-scroll to trigger lazy-loaded content before extraction
    const page = stagehand.context.pages()[0];
    await autoScrollForExtraction(page);

    // Get optimal selector for this page to reduce context window usage
    const currentUrl = page.url();
    const extractionSelector = getExtractionSelector(currentUrl);

    if (extractionSelector) {
      console.log(`[executeAIRelearn] Using targeted extraction with selector: ${extractionSelector}`);
      extractionData = await stagehand.extract(extractionSchemaInfo.instruction, zodExtractionSchema, {
        selector: extractionSelector,
        timeout: 120000 // 2 minutes for large pages
      });
    } else {
      console.log('[executeAIRelearn] Manual extraction (full page)...');
      extractionData = await stagehand.extract(extractionSchemaInfo.instruction, zodExtractionSchema, {
        timeout: 120000 // 2 minutes for large pages
      });
    }
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
