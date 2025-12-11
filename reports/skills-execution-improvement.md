# Skills Execution: Reliability & Performance Fixes

This report captures three concrete reliability gaps in the skills execution pipeline and prescribes fixes with code references and Stagehand docs to anchor the changes.

---

## 1) Dirty State Across Triple-Strategy Fallback

- **Problem**: `execute-skill-step.ts` runs Strategy 1 → 2 → 3 on the *same* Stagehand session/page. If Strategy 1 partially mutates the DOM (e.g., navigates, fills, or clicks) before failing, later strategies start from a mutated/unknown state, breaking the “clean fallback” expectation.
- **Evidence**: `workflows/steps/execute-skill-step.ts` initializes a single `Stagehand` instance and reuses `page` for all strategies (see initialization and the sequential try/catch chain before `await stagehand.close()`).
- **Solution**: Isolate retries. Create a fresh Stagehand session (or hard-reset to `startUrl`) per strategy. This keeps replay deterministic and aligns with the “exact → NL → agent” tiering.
- **Implementation sketch**:
  1. Extract a helper `createSession(startUrl?)` that builds a new `Stagehand` with `init()` and returns `{ stagehand, page }`.
  2. For each strategy, spin a new session and close it immediately after success/failure; only carry forward data needed for analytics.
  3. If session-per-strategy is too heavy, at minimum `page.goto(startUrl, { waitUntil: 'domcontentloaded' })` before each strategy and clear prior state (cookies/storage) when possible.
  4. Keep metrics/session URLs per strategy in the tracker so you still log execution evidence.

---

## 2) Extraction Validation Blocks Non-Extraction Skills

- **Problem**: Execution is marked failed when `extraction` is null/empty even for workflows that don’t define an extraction schema (pure automation like form submission). This falsely reports failures.
- **Evidence**: In `executeExactReplay` and `executeNaturalLanguage`, after optional extraction, the code throws if no extraction data whenever a schema/instruction pair is present; upstream, `executeSkillStep` sets `validation` errors on missing data, leading to `success: false` even when automation completed.
- **Solution**: Only enforce extraction presence/validation when a schema exists. Pure automation runs should succeed if actions complete without errors.
- **Implementation sketch**:
  1. Guard validation: `if (zodExtractionSchema && extractionInstruction) { ... }` (already present) should *not* throw when schema is absent; keep current throws only inside that guarded block.
  2. When no schema is stored, skip extraction entirely and set `extractedData = null` with `validation: { valid: true, errors: [] }`.
  3. Update `ExecutionResultTracker` usage to treat “no schema” as “no validation required”.
  4. Add a regression test: create a skill without `extractionSchema`, execute, assert `success === true` when all actions run without Playwright/Stagehand errors.

---

## 3) Stagehand Agent & Natural Language Resilience Gaps

- **Problem A (Agent path)**: `executeAIRelearn` does not enable computer-use (`cua`) or caching, so fallback is slower and less reliable than Stagehand’s recommended setup.
  - **Docs**: `docs/stagehand/deterministic-agent.md` demonstrates enabling `cua: true` and `cacheDir` to auto-cache agent actions for 10–100× faster reruns.
- **Solution A**:
  1. When instantiating the agent (`stagehand.agent({...})`), pass `cua: true` and a persistent `cacheDir` (e.g., `cache/skills/${skillId}` or `${skillId}/agent`).
  2. Optionally expose model selection (e.g., `openai/computer-use-preview` or Gemini CUA) via config, but default to a CUA-capable model.
  3. Persist cache between executions so Strategy 3 is fast on subsequent calls.

- **Problem B (Selector recovery in Strategy 2)**: When selectors are missing/invalid, we rely solely on `act` instructions. Stagehand supports `observe()` to rediscover actionable elements before acting, improving resilience when the DOM changes.
  - **Docs**: `docs/stagehand/observe.md` shows `stagehand.observe("find the submit button")` returning executable selectors.
- **Solution B**:
  1. In `executeNaturalLanguage`, when an action lacks a selector or the click/fill fails, call `observe()` with a targeted instruction (e.g., “find the {action.semanticLabel || 'target element'}”); then retry using the returned selector.
  2. Cache observed selectors per skill execution to avoid repeated LLM calls within the same run.
  3. Log fallback usage in `ExecutionResultTracker` for debugging and to measure uplift.

---

## Notes on Recorder Improvements

Your `SEMANTIC_VALUE_CAPTURE_PLAN.md` already covers richer capture (dropdowns, date pickers, sliders, etc.). No additional gaps beyond that plan for this report; no extra markdown folder needed unless we add new recorder concerns later.
