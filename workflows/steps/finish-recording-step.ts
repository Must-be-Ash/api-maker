import type {
  FinishRecordingInput,
  FinishRecordingOutput,
  RecordedAction,
  StagehandAction,
  SkillMetrics,
  PageContext,
} from "@/lib/types/skills";
import { detectVariables, detectVariablesEnhanced, type SemanticValue } from "@/lib/capture/variable-detector";
import { extractTypedValues } from "@/lib/capture/action-grouper";
import { generateExtractionSchema, type ExtractionSchema } from "@/lib/extraction/schema-generator";
import { inferGoalFromIntent } from "@/lib/ai/goal-inference";
import { z } from "zod";

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
    let isResultPageNavigation = false;
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

        // 🔴 NEW: Also detect result page navigations (no query params)
        // If navigation happens after user input to a DIFFERENT page (not same base URL)
        // This means the page navigated to a result/details page - should be removed
        if (!hasQueryParams && action.url) {
          // Get previous page URL from earlier navigation or current page
          let previousUrl: string | undefined;
          for (let k = i - 1; k >= 0; k--) {
            if (actions[k].type === 'navigate' && actions[k].url) {
              previousUrl = actions[k].url;
              break;
            }
          }

          if (previousUrl) {
            try {
              const previousBase = new URL(previousUrl).pathname;
              const currentBase = new URL(action.url).pathname;

              // If navigating to a different path (not just query params)
              if (previousBase !== currentBase) {
                console.log('[filterRedundantNavigations] 🚫 Detected result page navigation:',
                  action.url.substring(0, 100));
                console.log('[filterRedundantNavigations]    Previous page:', previousBase);
                console.log('[filterRedundantNavigations]    Result page:  ', currentBase);
                isResultPageNavigation = true;
                triggerAction = prevAction;
                break;
              }
            } catch (error) {
              // Invalid URL, skip this check
              console.warn('[filterRedundantNavigations] Invalid URL, skipping result page check');
            }
          }
        }
      }
    }

    // Handle navigations that should be converted to submit or removed
    if ((shouldConvertToSubmit || isResultPageNavigation) && triggerAction) {
      // Convert navigation to a submit action that uses the selector from the type/fill action
      const submitAction: RecordedAction = {
        type: 'submit',
        selector: triggerAction.selector, // Use the input field selector
        description: isResultPageNavigation
          ? 'Submit and wait for navigation'
          : 'Press Enter to submit search',
        timestamp: action.timestamp,
      };
      filtered.push(submitAction);

      if (isResultPageNavigation) {
        console.log('[filterRedundantNavigations] ✓ Removed result page navigation, created submit action');
      } else {
        console.log('[filterRedundantNavigations] ✓ Created submit action:', submitAction.description);
      }
      continue;
    }

    // Keep all other navigations
    filtered.push(action);
    console.log('[filterRedundantNavigations] Keeping navigation:', action.url?.substring(0, 100));
  }

  return filtered;
}

/**
 * Captures page context from the browser session for context-aware schema generation.
 * Extracts page title, URL, headings, visible text, and structural hints about the page.
 *
 * @param page - Playwright page object from Stagehand session
 * @returns PageContext object or null if capture fails
 */
async function capturePageContext(page: any): Promise<PageContext | null> {
  try {
    return await page.evaluate(() => ({
      title: document.title,
      url: window.location.href,
      headings: Array.from(document.querySelectorAll('h1, h2, h3'))
        .map(h => h.textContent?.trim())
        .filter(Boolean)
        .slice(0, 5),
      visibleText: document.body.innerText.slice(0, 1000),
      structuralHints: {
        hasPriceElements: !!(
          document.querySelector('[class*="price"], [data-price], [itemprop="price"]') ||
          /\$\d+|\d+\s*USD|€\d+|£\d+/.test(document.body.innerText)
        ),
        hasDateElements: !!(
          document.querySelector('[datetime], [class*="date"], [data-date]') ||
          /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/.test(document.body.innerText)
        ),
        hasTableData: !!document.querySelector('table, [role="table"], [class*="table"]'),
        hasListItems: !!document.querySelector('ul li, ol li, [role="list"]'),
        hasFormElements: !!document.querySelector('form, input, textarea, select'),
      },
    }));
  } catch (error) {
    console.error('[capturePageContext] Error:', error);
    return null;
  }
}

/**
 * Build Zod Schema from Extraction Schema
 *
 * Converts an ExtractionSchema (generated by LLM) into a Zod schema
 * that can be used for runtime validation during extraction testing.
 *
 * @param schema - The extraction schema with field definitions
 * @returns A Zod schema object for validation
 */
function buildZodSchemaFromExtraction(schema: ExtractionSchema): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of schema.fields) {
    let fieldSchema: z.ZodTypeAny;

    // Map extraction schema types to Zod types
    switch (field.type) {
      case 'string':
        fieldSchema = z.string().describe(field.description);
        break;
      case 'number':
        fieldSchema = z.number().describe(field.description);
        break;
      case 'boolean':
        fieldSchema = z.boolean().describe(field.description);
        break;
      case 'date':
        // Date can be string (ISO format) or Date object
        fieldSchema = z.union([z.string(), z.date()]).describe(field.description);
        break;
      case 'array':
        // Array of any type (could be strings, objects, etc.)
        fieldSchema = z.array(z.any()).describe(field.description);
        break;
      case 'object':
        // Generic object with any properties - use z.record for flexible objects
        fieldSchema = z.record(z.string(), z.any()).describe(field.description);
        break;
      default:
        // Fallback for unknown types
        console.warn(`[buildZodSchemaFromExtraction] Unknown field type: ${field.type}, using z.any()`);
        fieldSchema = z.any().describe(field.description);
    }

    // Make field optional if specified in schema
    if (field.optional) {
      fieldSchema = fieldSchema.optional();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
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
  let pageContext: PageContext | null = null;

  // ✅ RESTRUCTURE: Load recording data BEFORE closing session (needed for extraction testing)
  // Dynamically import MongoDB helper
  const { connectDB } = await import("@/lib/mongodb");

  // Load recording session from MongoDB EARLY
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

  if (activeRecorder) {
    // 🔍 CAPTURE BROWSER CONSOLE LOGS before stopping
    try {
      // Access page through recorder's page property
      const page = activeRecorder.recorder.page || activeRecorder.page;
      if (page && typeof page.evaluate === 'function') {
        const browserConsoleLogs = await page.evaluate(() => {
          return (window as any).__browserConsoleLogs__ || [];
        });
        if (browserConsoleLogs.length > 0) {
          console.log('[finishRecordingStep] ========== BROWSER CONSOLE LOGS ==========');
          browserConsoleLogs.forEach((log: any) => {
            console.log(`[BROWSER] ${log.type.toUpperCase()}:`, ...log.args);
          });
          console.log('[finishRecordingStep] ========== END BROWSER CONSOLE LOGS ==========');
        }
      } else {
        console.log('[finishRecordingStep] Page.evaluate not available');
      }
    } catch (error) {
      console.log('[finishRecordingStep] Could not retrieve browser console logs:', error);
    }

    await activeRecorder.recorder.stopRecording();
    console.log('[finishRecordingStep] Stopped action recorder');

    // ✅ FIX: Reload recording to get GROUPED actions after stopRecording()
    const updatedRecording = await db.collection('recording_sessions').findOne({
      recordingId: input.recordingId,
    });
    if (updatedRecording) {
      Object.assign(recording, updatedRecording);
      console.log('[finishRecordingStep] Reloaded recording with grouped actions:', {
        actionsCount: recording.recordedActions?.length || 0,
      });
    } else {
      console.warn('[finishRecordingStep] ⚠️ No actions captured during recording!');
    }

    // ✅ NEW: Capture page context BEFORE closing session
    if (activeRecorder.stagehand?.context?.pages) {
      try {
        const page = activeRecorder.stagehand.context.pages()[0];
        if (page) {
          pageContext = await capturePageContext(page);
          console.log('[finishRecordingStep] Captured page context:', {
            url: pageContext?.url,
            title: pageContext?.title,
            headingCount: pageContext?.headings.length || 0,
            hints: pageContext?.structuralHints,
          });
        } else {
          console.log('[finishRecordingStep] No page found in context.pages()');
        }
      } catch (error) {
        console.error('[finishRecordingStep] Error capturing page context:', error);
      }
    } else {
      console.log('[finishRecordingStep] Cannot capture context - stagehand.context.pages not available');
    }

    // ✅ NEW: Test extraction BEFORE closing session (Phase 3, Step 3.2)
    // This allows us to validate the schema works with actual page content
    if (pageContext && recording.goal && activeRecorder.stagehand?.context?.pages) {
      try {
        console.log('[finishRecordingStep] 🧪 Testing extraction schema before session close...');

        // Note: We'll generate a preliminary schema and test it here
        // Full schema generation with all context happens after session close
        // This is just a quick validation test

        const page = activeRecorder.stagehand.context.pages()[0];
        if (page) {
          // Quick schema generation with basic context
          const testSchema = await generateExtractionSchema(recording.goal, {
            startUrl: recording.startUrl,
            finalUrl: pageContext.url,
            pageTitle: pageContext.title,
            headings: pageContext.headings,
            visibleText: pageContext.visibleText,
            structuralHints: pageContext.structuralHints,
          });

          console.log('[finishRecordingStep] Generated test schema:', {
            fields: testSchema.fields.length,
            instruction: testSchema.instruction,
          });

          // Build Zod schema and test extraction
          const zodSchema = buildZodSchemaFromExtraction(testSchema);

          // V3 API: extract(instruction, schema, options?)
          const sampleExtraction = await activeRecorder.stagehand.extract(
            testSchema.instruction,
            zodSchema
          );

          // Log success without the huge sampleExtraction object
          console.log('[finishRecordingStep] ✅ Extraction test PASSED');

          // Store sample extraction in pageContext for later use (excluding pageText to avoid huge data)
          if (sampleExtraction && typeof sampleExtraction === 'object') {
            const { pageText, ...extractedData } = sampleExtraction as any;
            (pageContext as any).sampleExtraction = extractedData;
          }

        }
      } catch (extractionError) {
        console.warn('[finishRecordingStep] ⚠️  Extraction test FAILED:', extractionError);
        // Schema is generated but extraction failed - this is OK, we'll keep the schema
        // User will see this at execution time
      }
    }

    // Now close the Stagehand session (releases keep-alive session)
    try {
      await Promise.race([
        activeRecorder.stagehand.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Close timeout')), 10000) // 10 second timeout
        )
      ]);
      console.log('[finishRecordingStep] Released keep-alive session');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage === 'Close timeout') {
        console.log('[finishRecordingStep] Session close timed out after 10s, continuing anyway');
      } else {
        console.log('[finishRecordingStep] Error closing Stagehand session:', error);
      }
    }

    // Clean up global reference
    delete (global as any).activeRecorders[input.recordingId];
  } else {
    // 🔧 PRODUCTION FALLBACK: activeRecorder doesn't exist (different serverless function)
    // ActionRecorder already saved actions to MongoDB when stopRecording() was called
    console.log('[finishRecordingStep] Active recorder not found in global (serverless mode)');
    console.log('[finishRecordingStep] Actions should already be in MongoDB from recorder.stopRecording()');

    try {
      // Reconnect to Browserbase session for page context capture
      const { Stagehand } = await import("@browserbasehq/stagehand");

      const stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        projectId: process.env.BROWSERBASE_PROJECT_ID,
        verbose: 0,
        disablePino: true,
        browserbaseSessionID: input.sessionId,
        model: "openai/gpt-4o",
      });

      await stagehand.init();

      const pages = stagehand.context.pages();
      const page = pages[pages.length - 1];

      // CRITICAL FIX: In production, ActionRecorder polling does not run (serverless freezes)
      // Retrieve actions from localStorage (survives Stagehand reconnection across serverless functions)
      console.log('[finishRecordingStep] Retrieving actions from browser (serverless polling did not run)');

      const pageActions = await page.evaluate((recId: string) => {
        const storageKey = '_recordedActions_' + recId;
        const actions = JSON.parse(localStorage.getItem(storageKey) || '[]');

        console.log('[finishRecordingStep] Retrieved', actions.length, 'actions from localStorage');

        // Clear after retrieval to prevent stale data
        localStorage.removeItem(storageKey);

        return actions;
      }, input.recordingId);

      console.log('[finishRecordingStep] Retrieved', pageActions.length, 'actions from browser');

      if (pageActions && pageActions.length > 0) {
        // Group raw actions into semantic actions
        const { groupActions } = await import("@/lib/capture/action-grouper");

        console.log('[finishRecordingStep] Grouping', pageActions.length, 'raw actions...');
        const groupedActions = groupActions(pageActions);
        console.log('[finishRecordingStep] Grouped into', groupedActions.length, 'semantic actions');

        // Save grouped actions to database
        await db.collection('recording_sessions').updateOne(
          { recordingId: input.recordingId },
          {
            $set: {
              recordedActions: groupedActions,
              updatedAt: new Date().toISOString(),
            },
          }
        );

        // Reload recording with new actions
        Object.assign(recording, {
          recordedActions: groupedActions,
        });

        console.log('[finishRecordingStep] Saved grouped actions to database');
      }

      // Capture page context (needed for schema generation)
      pageContext = await capturePageContext(page);
      console.log('[finishRecordingStep] Captured page context:', {
        url: pageContext?.url,
        title: pageContext?.title,
        headingCount: pageContext?.headings.length || 0,
      });

      // Test extraction schema (optional, can skip if session expires)
      if (pageContext && recording.goal) {
        try {
          const testSchema = await generateExtractionSchema(recording.goal, {
            startUrl: recording.startUrl,
            finalUrl: pageContext.url,
            pageTitle: pageContext.title,
            headings: pageContext.headings,
            visibleText: pageContext.visibleText,
            structuralHints: pageContext.structuralHints,
          });

          console.log('[finishRecordingStep] Generated test schema:', {
            fields: testSchema.fields.length,
            instruction: testSchema.instruction,
          });

          const zodSchema = buildZodSchemaFromExtraction(testSchema);
          const sampleExtraction = await stagehand.extract(
            testSchema.instruction,
            zodSchema
          );

          console.log('[finishRecordingStep] ✅ Extraction test PASSED');

          if (sampleExtraction && typeof sampleExtraction === 'object') {
            const { pageText, ...extractedData } = sampleExtraction as any;
            (pageContext as any).sampleExtraction = extractedData;
          }
        } catch (error) {
          console.log('[finishRecordingStep] Extraction test failed (session may have expired):', error);
          // Continue anyway - schema will be generated without testing
        }
      }

      // Close the session with timeout
      try {
        await Promise.race([
          stagehand.close(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Close timeout')), 10000)
          )
        ]);
        console.log('[finishRecordingStep] Released Browserbase session');
      } catch (closeError) {
        const errorMessage = closeError instanceof Error ? closeError.message : String(closeError);
        if (errorMessage === 'Close timeout') {
          console.log('[finishRecordingStep] Session close timed out after 10s, continuing anyway');
        } else {
          console.log('[finishRecordingStep] Error closing session:', closeError);
        }
      }

    } catch (error) {
      console.error('[finishRecordingStep] Error in production fallback path:', error);
      // Continue anyway - worst case we have 0 actions but skill is still created
    }
  }

  // Extract ALL semantic values from recorded actions (not just text inputs)
  // This includes values from dropdowns, date pickers, number inputs, autocomplete, checkboxes
  // ✅ FIX: Extract semantic values and filter out intermediate typing states
  // For each selector, keep only the LAST semantic value (final state after typing completes)
  const allSemanticValues: Array<SemanticValue & { selector?: string }> = (recording.recordedActions || [])
    .map((action: RecordedAction, index: number): (SemanticValue & { selector?: string }) | null => {
      // Extract semantic value if present
      if (action.semanticValue !== undefined && action.semanticValue !== null && action.semanticType) {
        return {
          value: action.semanticValue,
          type: action.semanticType,
          label: action.semanticLabel || action.description || 'unknown',
          actionIndex: index,
          selector: action.selector
        };
      }
      // Fallback: Extract text input values (for compatibility)
      if (action.value && (action.type === 'fill' || action.type === 'type')) {
        return {
          value: action.value,
          type: 'text-input' as const,
          label: action.description || 'text input',
          actionIndex: index,
          selector: action.selector
        };
      }
      return null;
    })
    .filter((sv: (SemanticValue & { selector?: string }) | null): sv is SemanticValue & { selector?: string } => sv !== null);

  // Group by selector and keep only the LAST value for each selector
  const selectorMap = new Map<string, SemanticValue & { selector?: string }>();
  allSemanticValues.forEach((sv: SemanticValue & { selector?: string }) => {
    const key = sv.selector || `index-${sv.actionIndex}`;
    // Always replace with later values (keeps the most recent/final state)
    selectorMap.set(key, sv);
  });

  // Convert back to array and remove selector property
  const semanticValues: SemanticValue[] = Array.from(selectorMap.values()).map(sv => ({
    value: sv.value,
    type: sv.type,
    label: sv.label,
    actionIndex: sv.actionIndex
  }));

  console.log('[finishRecordingStep] Extracted semantic values (filtered):', semanticValues);

  // ✅ PHASE 1: Infer structured goal from vague user intent FIRST (before variable detection)
  // This ensures we work with the enhanced/proper goal, not the original malformed one
  let finalGoal = recording.goal;
  let originalGoal = recording.goal;
  let goalInference = null;

  // Check if goal is vague or just a variable placeholder
  const isVagueGoal =
    recording.goal.length < 20 ||                    // Too short (e.g., "get weather", "search")
    recording.goal.match(/^%\w+%?$/) ||              // Just a variable (e.g., "%query%" or malformed "%query")
    !recording.goal.includes('%');                   // No variables (might need to add them)

  if (isVagueGoal && semanticValues.length > 0) {
    console.log('[finishRecordingStep] Goal appears vague, inferring structured goal...');
    console.log('[finishRecordingStep] Original goal:', recording.goal);

    try {
      // Extract demo query from first semantic value (usually the main input)
      const demoQuery = semanticValues[0]?.value?.toString() || '';

      // Call goal inference - convert grouped actions to simple action summaries
      const actionSummaries = (recording.recordedActions || []).map((a: RecordedAction) => ({
        type: a.type,
        description: a.description || ''
      }));

      const inferredGoal = await inferGoalFromIntent(
        recording.goal,
        demoQuery,
        recording.startUrl,
        actionSummaries
      );

      console.log('[finishRecordingStep] Inferred goal:', {
        original: recording.goal,
        structured: inferredGoal.structuredGoal,
        variables: inferredGoal.variables,
        category: inferredGoal.category,
        confidence: inferredGoal.confidence
      });

      // Use inferred goal if confidence is high enough
      if (inferredGoal.confidence >= 0.7) {
        finalGoal = inferredGoal.structuredGoal;
        goalInference = inferredGoal;
        console.log('[finishRecordingStep] ✅ Using inferred goal (confidence >= 0.7)');
      } else {
        console.log('[finishRecordingStep] ⚠️  Keeping original goal (low confidence)');
      }
    } catch (error) {
      console.error('[finishRecordingStep] Error inferring goal:', error);
    }
  }

  // ✅ PHASE 2: Detect variables and map them to semantic values (ENHANCED VERSION)
  // Now using the enhanced/inferred goal, not the original malformed one
  let variableMapping: Record<string, string> = {};
  if (semanticValues.length > 0 && finalGoal) {
    try {
      // Use enhanced detection that understands all interaction types
      variableMapping = await detectVariablesEnhanced(finalGoal, semanticValues);
      console.log('[finishRecordingStep] Variable mapping (enhanced):', variableMapping);
    } catch (error) {
      console.error('[finishRecordingStep] Error detecting variables (enhanced):', error);

      // Fallback to old detection method (text inputs only)
      try {
        const typedValues = extractTypedValues(recording.recordedActions || []);
        if (typedValues.length > 0) {
          variableMapping = await detectVariables(finalGoal, typedValues);
          console.log('[finishRecordingStep] Variable mapping (fallback):', variableMapping);
        }
      } catch (fallbackError) {
        console.error('[finishRecordingStep] Error in fallback detection:', fallbackError);
      }
    }
  }

  // Replace demo values with variable placeholders in actions
  const variableMappedActions = recording.recordedActions.map((action: RecordedAction) => {
    if (action.value) {
      let newValue = action.value;
      let wasReplaced = false;

      // Sort mappings by length (longest first) to avoid substring conflicts
      // Example: Replace "nintendo switch 2" before "nint" to prevent corruption
      const sortedMappings = Object.entries(variableMapping).sort((a, b) => b[0].length - a[0].length);

      // ✅ FIX: For autocomplete/date-picker, directly replace value with placeholder if semanticValue matches
      if (action.semanticType === 'autocomplete' || action.semanticType === 'date-picker') {
        const semanticStr = String(action.semanticValue || '');
        for (const [originalText, placeholder] of sortedMappings) {
          if (semanticStr === originalText || semanticStr.includes(originalText)) {
            console.log(`[Variable Mapping] Semantic match: "${action.value}" → ${placeholder} (via semanticValue: "${semanticStr}")`);
            newValue = placeholder;
            wasReplaced = true;
            break;
          }
        }
      }

      // Fallback: Replace each mapped value within the action's value (for text-input, etc.)
      if (!wasReplaced) {
        sortedMappings.forEach(([originalText, placeholder]) => {
          if (newValue.includes(originalText)) {
            // Escape special regex characters in originalText
            const escapedText = originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            newValue = newValue.replace(new RegExp(escapedText, 'gi'), placeholder);
            wasReplaced = true;
          }
        });
      }

      if (wasReplaced) {
        // ALSO UPDATE semanticValue if it exists (Bug fix: ensure workflow instructions use placeholders)
        let newSemanticValue = action.semanticValue;
        if (action.semanticValue !== undefined && action.semanticValue !== null) {
          // Use the same sorted mappings to avoid substring conflicts
          sortedMappings.forEach(([originalText, placeholder]) => {
            const semanticStr = String(newSemanticValue);
            if (semanticStr.includes(originalText)) {
              // Escape special regex characters in originalText
              const escapedText = originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              newSemanticValue = semanticStr.replace(new RegExp(escapedText, 'gi'), placeholder);
            }
          });
        }

        return {
          ...action,
          value: newValue, // Replace with placeholders
          semanticValue: newSemanticValue, // ✅ FIX: Also update semanticValue
          originalValue: action.value, // Keep original for reference
        };
      }
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

  // ✅ NEW: Filter out intermediate clicks without semantic value
  // These are clicks that just open fields (e.g., "Click field with placeholder 'Origin'")
  // or click calendar cells (e.g., "Click 19") which are site-specific
  // They don't execute during actual workflow runs and cause GPT-4o errors
  const executableActions = filteredActions.filter((action) => {
    // Keep all non-click actions
    if (action.type !== 'click') {
      return true;
    }

    // For click actions: only keep if they have TRUE semantic meaning
    // ONLY keep clicks that are:
    // 1. Select actions (e.g., "Select Vancouver from dropdown")
    // 2. Submit actions (e.g., "Submit form")
    // 3. Have a value to fill (autocomplete with value)
    const description = action.description || '';
    const hasSemanticContext = description.includes('Select') ||
                               description.includes('Submit') ||
                               (action as any).value;  // Has a value to fill

    if (!hasSemanticContext) {
      console.log('[finishRecordingStep] ⏭️  Filtering out intermediate click:', description);
      return false;
    }

    return true;
  });

  console.log('[finishRecordingStep] Filtered intermediate clicks:', {
    before: filteredActions.length,
    after: executableActions.length,
    removed: filteredActions.length - executableActions.length
  });

  // Generate extraction schema from goal with context
  let extractionSchema = null;
  if (finalGoal) {
    try {
      // ✅ NEW: Pass context to schema generator for better accuracy
      extractionSchema = await generateExtractionSchema(finalGoal, {
        startUrl: recording.startUrl,
        finalUrl: pageContext?.url,
        pageTitle: pageContext?.title,
        headings: pageContext?.headings,
        visibleText: pageContext?.visibleText,
        structuralHints: pageContext?.structuralHints,
        semanticValues: semanticValues.map(sv => ({
          value: sv.value,
          type: sv.type,
          label: sv.label,
        })),
        actions: executableActions.map(a => ({
          type: a.type,
          description: a.description || '',
          selector: a.selector,
        })),
      });
      console.log('[finishRecordingStep] Generated extraction schema:', {
        fields: extractionSchema.fields.length,
        instruction: extractionSchema.instruction,
        withContext: !!pageContext,
      });
    } catch (error) {
      console.error('[finishRecordingStep] Error generating schema:', error);
    }
  }

  // Convert recorded actions to Stagehand workflow (use executableActions - already filtered)
  const stagehandWorkflow = convertToStagehand(executableActions || []);

  console.log('[finishRecordingStep] Converted to Stagehand workflow:', {
    workflowSteps: stagehandWorkflow.length,
  });

  // Validate workflow by replaying it
  let testResult: { success: boolean; error?: string } = { success: false };
  let history: any[] = [];
  let metrics: SkillMetrics = {
    totalTokens: 0,
    duration: 0,
    operations: executableActions?.length || 0,  // ✅ FIX: Use executableActions (after filtering)
  };

  try {
    // Dynamically import Stagehand for validation
    const { Stagehand } = await import("@browserbasehq/stagehand");

    const stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY,
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      verbose: 0, // Errors only
      disablePino: true, // Disable pino logger (prevents pino-pretty error in Vercel)
      model: "openai/gpt-4o",
    });

    await stagehand.init();
    const page = stagehand.context.pages()[0];

    console.log('[finishRecordingStep] Validating workflow by replaying');

    const startTime = Date.now();
    const VALIDATION_TIMEOUT = 60000; // 60 seconds max

    try {
      await Promise.race([
        replayWorkflow(stagehand, page, stagehandWorkflow, variableMapping),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Validation timeout')), VALIDATION_TIMEOUT)
        )
      ]);
      testResult = { success: true };
      console.log('[finishRecordingStep] Workflow validation successful');
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage === 'Validation timeout') {
        console.warn('[finishRecordingStep] Validation timed out after 60s, skipping validation');
        testResult = { success: false, error: 'Validation timeout' };
        // Continue anyway - validation is not critical for skill creation
      } else {
        throw error; // Re-throw other errors
      }
    }

    const duration = Date.now() - startTime;

    // Get metrics if available (with timeout to handle API errors)
    let stagehandMetrics: any = null;
    try {
      stagehandMetrics = await Promise.race([
        stagehand.metrics,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Metrics timeout')), 5000)
        )
      ]) as any;
    } catch (error) {
      console.log('[Metrics] Failed to fetch, continuing without metrics:', (error as Error).message);
      // Don't throw - metrics are non-critical for skill creation
    }

    metrics = {
      totalTokens: (stagehandMetrics?.totalPromptTokens || 0) + (stagehandMetrics?.totalCompletionTokens || 0),
      duration,
      operations: stagehandWorkflow.length,
    };

    // Close Stagehand session with timeout (prevent hanging)
    try {
      await Promise.race([
        stagehand.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Close timeout')), 10000) // 10 second timeout
        )
      ]);
      console.log('[finishRecordingStep] Validation session closed successfully');
    } catch (closeError) {
      // CDP transport errors during close are expected and can be ignored
      const errorMessage = closeError instanceof Error ? closeError.message : String(closeError);
      if (errorMessage === 'Close timeout') {
        console.log('[finishRecordingStep] Session close timed out after 10s, continuing anyway');
      } else {
        console.log('[finishRecordingStep] Session cleanup completed (CDP transport closed)');
      }
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
    name: `Skill: ${finalGoal.substring(0, 50)}`,
    goal: finalGoal,
    originalGoal: originalGoal, // ✅ NEW: Store original goal before inference
    goalInference: goalInference, // ✅ NEW: Store inference metadata (if goal was inferred)
    startUrl: recording.startUrl,

    // Page context (for context-aware extraction)
    pageContext: pageContext ? {
      url: pageContext.url,
      title: pageContext.title,
      headings: pageContext.headings,
      visibleText: pageContext.visibleText,
      structuralHints: pageContext.structuralHints,
      sampleExtraction: pageContext.sampleExtraction || null, // ✅ NEW: Sample extraction from testing
    } : null,

    // HYBRID STORAGE - Now with variable-mapped actions, initial navigation, and filtered intermediate clicks
    recordedActions: executableActions || [],  // ✅ FIX: Use executableActions (after filtering intermediate clicks)
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

    // Ownership tracking for wallet-based authorization
    creatorAddress: input.creatorAddress || null,

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
    name: `Skill: ${finalGoal.substring(0, 50)}`,
    goal: finalGoal,
    originalGoal: originalGoal,
    goalInference: goalInference,
    recordedActions: executableActions || [],  // ✅ FIX: Return executable actions (after filtering intermediate clicks)
    stagehandWorkflow,
    testResult,
    metrics,
  };
}

/**
 * Convert recorded actions to Stagehand workflow format
 *
 * ENHANCED: Now generates semantic instructions for all widget types
 * (date pickers, dropdowns, number inputs, autocomplete, checkboxes)
 *
 * Note: Handles both raw actions ('fill') and grouped actions ('type')
 * Preserves variable placeholders (%variable%) in values
 */
function convertToStagehand(actions: RecordedAction[]): StagehandAction[] {
  return actions.map(action => {
    // Navigate actions
    if (action.type === 'navigate') {
      return {
        method: 'navigate',
        url: action.url!,
        instruction: `Navigate to ${action.url}`,
      };
    }

    // Submit actions
    if (action.type === 'submit') {
      return {
        method: 'act',
        selector: action.selector,
        instruction: action.description || 'Submit form',
      };
    }

    // Scroll actions
    if (action.type === 'scroll') {
      // Generate natural language scroll instruction based on percentage
      let instruction = 'scroll down';

      if (action.scrollPercent !== undefined) {
        if (action.scrollPercent >= 90) {
          instruction = 'scroll to the bottom';
        } else if (action.scrollPercent <= 10) {
          instruction = 'scroll to the top';
        } else if (action.scrollPercent >= 45 && action.scrollPercent <= 55) {
          instruction = 'scroll to the middle';
        } else {
          instruction = `scroll to ${action.scrollPercent}% of the page`;
        }
      }

      return {
        method: 'act',
        instruction: instruction,
      };
    }

    // SEMANTIC VALUE HANDLING - Generate natural language instructions for all widget types
    if (action.semanticValue !== undefined && action.semanticValue !== null && action.semanticType) {
      const semanticValueStr = String(action.semanticValue);

      // Check if this value is a variable placeholder
      const isVariable = semanticValueStr.startsWith('%') && semanticValueStr.endsWith('%');
      const displayValue = isVariable ? semanticValueStr : `"${semanticValueStr}"`;

      switch (action.semanticType) {
        case 'date-picker':
          // ✅ FIX: Use clear "Fill" instruction that specifies both the field AND the value
          // Format: "Fill [field description] with [date value]"
          // This works for both typed date inputs AND calendar date pickers
          const dateFieldLabel = action.semanticLabel || 'date field';
          return {
            method: 'act',
            selector: action.selector,
            instruction: `Fill ${dateFieldLabel} with ${semanticValueStr}`,
          };

        case 'dropdown':
          // Generate: "Select cabin class %cabinClass%" or "Select cabin class economy"
          return {
            method: 'act',
            selector: action.selector,
            instruction: `Select ${action.semanticLabel || 'option'} ${displayValue}`,
          };

        case 'number-input':
        case 'range-slider':
          // Generate: "Set guest count to %guests%" or "Set guest count to 2"
          return {
            method: 'act',
            selector: action.selector,
            instruction: `Set ${action.semanticLabel || 'value'} to ${semanticValueStr}`,
          };

        case 'autocomplete':
          // Generate: "Type %origin% into location field"
          // This is atomic, specific, and follows Stagehand best practices
          return {
            method: 'act',
            selector: action.selector,
            instruction: `Type ${displayValue} into the ${action.semanticLabel || 'location'} field`,
            value: semanticValueStr,  // ✅ Add value field for exact selector fallback
          };

        case 'checkbox':
          // Generate: "Enable direct flights filter" or "Disable remote only"
          const checkboxAction = action.semanticValue === true ? 'Enable' : 'Disable';
          return {
            method: 'act',
            selector: action.selector,
            instruction: `${checkboxAction} ${action.semanticLabel || 'option'}`,
          };

        case 'text-input':
          // Text inputs - existing behavior with enhanced label
          const valueInstruction = isVariable ? semanticValueStr : displayValue;
          return {
            method: 'act',
            selector: action.selector,
            instruction: `Fill ${action.semanticLabel || action.description} with ${valueInstruction}`,
            value: semanticValueStr,
          };

        default:
          // Fallback for unknown semantic types
          return {
            method: 'act',
            selector: action.selector,
            instruction: action.description,
          };
      }
    }

    // LEGACY HANDLING - For actions without semantic values (backward compatibility)
    if (action.type === 'click') {
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
 *
 * IMPORTANT: During replay, we need to reverse-substitute variables back to their demo values.
 * For example: If variableMapping is {"what's the price of apple stock?": "%query%"},
 * we need to substitute "%query%" back to "what's the price of apple stock?" for validation.
 */
async function replayWorkflow(
  stagehand: any,
  page: any,
  workflow: StagehandAction[],
  variableMapping?: Record<string, string>
) {
  // Create reverse mapping: %query% → "what's the price of apple stock?"
  const reverseMapping: Record<string, string> = {};
  if (variableMapping) {
    Object.entries(variableMapping).forEach(([originalValue, variable]) => {
      reverseMapping[variable] = originalValue;
    });
  }

  // ✅ NEW: Filter out intermediate clicks without semantic value
  // These are clicks that just open fields (e.g., "Click field with placeholder 'Origin'")
  // They don't have semantic context and cause GPT-4o to return empty {}
  const executableWorkflow = workflow.filter((action) => {
    // Keep all non-click actions
    if (action.method !== 'act' || !action.instruction.startsWith('Click')) {
      return true;
    }

    // For click actions: only keep if they have semantic meaning OR a value to fill
    const hasSemanticContext = action.instruction.includes('Select') ||
                               action.instruction.includes('Submit') ||
                               action.value;

    if (!hasSemanticContext) {
      console.log('[replayWorkflow] ⏭️  Skipping intermediate click:', action.instruction);
      return false;
    }

    return true;
  });

  console.log('[replayWorkflow] Filtered workflow:', {
    original: workflow.length,
    executable: executableWorkflow.length,
    skipped: workflow.length - executableWorkflow.length
  });

  for (const action of executableWorkflow) {
    console.log('[replayWorkflow] Executing action:', action.method, action.instruction);

    if (action.method === 'navigate') {
      await page.goto(action.url!, {
        waitUntil: 'domcontentloaded',
        timeoutMs: 15000,
      });
    } else if (action.method === 'act') {
      // Reverse-substitute variables in the value
      let valueToUse = action.value;
      if (valueToUse && Object.keys(reverseMapping).length > 0) {
        Object.entries(reverseMapping).forEach(([variable, originalValue]) => {
          if (valueToUse) {
            valueToUse = valueToUse.replace(variable, originalValue);
          }
        });
        if (valueToUse !== action.value) {
          console.log('[replayWorkflow] Reverse-substituted variable:', {
            from: action.value,
            to: valueToUse
          });
        }
      }

      // Try exact selector first with Playwright (fastest, no LLM)
      if (action.selector) {
        try {
          if (valueToUse) {
            await page.locator(action.selector).fill(valueToUse, { timeout: 5000 });
          } else {
            await page.locator(action.selector).click({ timeout: 5000 });
          }
          console.log('[replayWorkflow] Action executed with exact selector');
        } catch (error) {
          // ✅ FIX: Fallback to natural language instruction (not Action object)
          // Stagehand Action objects expect XPath, but we have CSS selectors
          // Using natural language is more reliable than converting CSS → XPath
          console.log('[replayWorkflow] Exact selector failed, using natural language instruction');

          let instruction = action.instruction;
          // Add value to instruction if present
          if (valueToUse && !instruction.includes(valueToUse)) {
            instruction = `${instruction} with value "${valueToUse}"`;
          }

          await stagehand.act(instruction);
        }
      } else {
        // No selector, use natural language instruction
        await stagehand.act(action.instruction);
      }
    }

    // Wait a bit between actions
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
