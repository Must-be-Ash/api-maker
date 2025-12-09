# Skills System Audit

Audit scope: browser automation “skills” implementation using Browserbase + Stagehand, MongoDB, and Vercel Workflow Kit. Reviewed `app/api/skills/**`, `workflows/**`, `lib/capture/action-recorder.ts`, `lib/types/skills.ts`, and supporting config/docs in `docs/`.

## What’s working
- Uses Workflow Kit directives (`"use workflow"` / `"use step"`) and dynamic imports for Stagehand/Mongo to avoid bundling issues.
- Browserbase session creation + Live View URL plumbing exist in `start-recording-step.ts`.
- MongoDB helper caches the client for reuse; Next config externalizes server-only packages.

## Critical issues to fix
- No x402 gating on skill APIs: `/api/skills/start-recording`, `/finish-recording`, and `/[skillId]/execute` skip `verifyPayment` and still accept free calls. The UI also never sends `X-PAYMENT`. Add `verifyPayment` + `create402Response` with `$1.99` for creation and `$0.01` (or updated price) for execution, and make the client pass the header (using `x402-fetch` or wallet flow).  
  - Files: `app/api/skills/start-recording/route.ts`, `.../finish-recording/route.ts`, `.../[skillId]/execute/route.ts`, `app/skills/record/page.tsx`, `app/skills/[skillId]/page.tsx`.
- Recorder lifecycle is not durable in Workflow Kit: `startRecordingStep` spins a long-lived `ActionRecorder` + `setInterval` and stores it in `global`. After the step returns, the workflow worker can be torn down, killing the recorder and losing actions. Workflow steps must be deterministic/short-lived. You need a persistent runner (long-lived server process/queue worker) or Browserbase-side instrumentation/webhook to stream events to Mongo. As written, most recordings will stop shortly after the API response.
- Initial navigation isn’t replayed: `startRecordingStep` navigates to `startUrl` before injecting the recorder, so the first page load is never stored. `executeExactReplay`/`executeNaturalLanguage` never go to `skill.startUrl` unless a navigation was captured, so replays start on `about:blank` and fail. Inject a synthetic `navigate` action when saving the skill (or always `page.goto(startUrl)` before replay).
- Stagehand config is off-spec: constructors use `modelName: "gpt-4o"` at the top level, but docs require `model: "openai/gpt-4o"` or `model: { modelName: "...", apiKey }`. Misconfig can default to the wrong model or throw.  
  - Files: `workflows/steps/start-recording-step.ts`, `workflows/steps/finish-recording-step.ts`, `workflows/steps/execute-skill-step.ts`.
- Missing session metadata: execution returns `sessionId: (stagehand as any).sessionId || 'unknown'`; Stagehand exposes `browserbaseSessionID`/`browserbaseSessionURL`. Current responses can’t link to replays.  
  - File: `workflows/steps/execute-skill-step.ts`.
- Duplicate analytics inserts: `executeSkillStep` inserts into `skill_executions`, and the API route inserts again. This double-counts runs. Choose one place (preferably the step) to write analytics.  
  - Files: `workflows/steps/execute-skill-step.ts`, `app/api/skills/[skillId]/execute/route.ts`.

## High/Medium issues
- Validation history and natural-language robustness are missing: `finishRecordingStep` sets `history` to `[]` and never calls Stagehand’s history API or `observe()` to create resilient instructions. The “triple replay” fallback has weak NL instructions (just `action.description`) and no selector healing data. Capture `history = await stagehand.history()` after validation, generate NL instructions with `observe()`/`act()` results, and persist them.
- No output extraction path: recorded actions only click/fill; execution returns `{ success: true }` with no data, so skills can’t expose schemas/outputs. Add explicit `extract` steps (using `stagehand.extract` with Zod schemas) and store schemas in `Skill.schema`; return extracted data from the execute step.
- Route params typed as Promise: Next.js passes `params` directly, not a Promise. Using `{ params }: { params: Promise<{ skillId: string }> }` is incorrect and forces `await params`. Adjust to `{ params: { skillId: string } }` in `app/api/skills/[skillId]/route.ts` and `.../execute/route.ts`.
- Start recording not keeping Stagehand alive: even if the worker stays up, there’s no keep-alive/timeout handling for the Browserbase session. Add a keep-alive ping or session timeout guard and clean shutdown when finish is called.
- Incomplete selector strategy: `convertToStagehand` just mirrors the recorded selector/description; there is no stable-selector generation or de-duplication, so Strategy 1 will be brittle. Consider Stagehand’s `observe()` to produce stable locators and store both CSS/XPath plus human-readable context.

## Suggested next steps
1) Gate start/finish/execute with x402 and update the UI to send `X-PAYMENT`.  
2) Redesign recording to use a persistent recorder (e.g., a long-lived worker that stays attached to the Browserbase session or a Browserbase event stream) instead of in-memory intervals.  
3) Fix Stagehand config (`model`), replay start URL, and session URL reporting.  
4) Enrich skills with `observe`/`history` data and add extraction/schema support so executions return real outputs.  
5) Remove duplicate execution logging and fix route param typing.
