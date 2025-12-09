# Skills System Audit (Re-run)

Scope re-checked after latest changes (new `app/chat/page.tsx`; skill workflows/routes unchanged). Focus: Browserbase + Stagehand + MongoDB + Vercel Workflow Kit for `/skills`.

## What’s working
- Workflow directives/dynamic imports still correct; Next config externalizes server-only deps.
- Browserbase session creation + Live View URL wiring present.
- Mongo client helper caches connections appropriately.

## Critical issues (still present)
- **No x402 gating**: `/api/skills/start-recording`, `/finish-recording`, `/[skillId]/execute` accept free calls; UIs don’t send `X-PAYMENT`. Add `verifyPayment/create402Response` with creation/execution prices and wire clients to send the header (x402-fetch/wallet flow).
- **Recorder durability**: `startRecordingStep` keeps an in-memory `ActionRecorder` interval in a Workflow step; once the worker is reclaimed the recorder dies and actions stop. Needs a persistent runner/stream tied to the Browserbase session (or Browserbase event feed/webhook) rather than per-step globals.
- **Start URL not captured/replayed**: navigation to `startUrl` happens before injection and isn’t stored; replays start on `about:blank` unless the user manually navigated. Inject a synthetic `navigate` action or always `page.goto(startUrl)` before replay.
- **Stagehand config off-spec**: constructors pass `modelName: "gpt-4o"` at root; docs expect `model: "openai/gpt-4o"` or `model: { modelName: "...", apiKey }`. Fix in `start-recording-step.ts`, `finish-recording-step.ts`, `execute-skill-step.ts`.
- **Session metadata**: execute response pulls `(stagehand as any).sessionId || 'unknown'`; use `browserbaseSessionID/browserbaseSessionURL` so consumers get replay links.
- **Duplicate analytics inserts**: both `executeSkillStep` and the execute route write to `skill_executions`, double-counting runs. Pick one (prefer the step).

## High/Medium issues
- **Validation history missing**: `finishRecordingStep` sets `history = []`; no Stagehand `history()`/`observe()` data saved, so NL fallback is weak.
- **No extraction/results**: flows only click/fill and return `{ success: true }`; no `extract` steps or stored schemas -> API has no outputs. Add extraction + schema persistence and return extracted data.
- **Route params typed as Promise**: execute handlers use `{ params: Promise<{ skillId: string }> }`; Next passes plain objects. Update to `{ params: { skillId: string } }` in both GET/POST skill routes.
- **Session lifecycle**: no keep-alive/timeout guard for Browserbase during recording; sessions may die mid-recording.
- **Selector robustness**: `convertToStagehand` just echoes selectors/descriptions; no stable locator generation/deduping, making Strategy 1 brittle.

## Notes on new code
- `app/chat/page.tsx` is a new UI, but there is no `/api/chat` route in the repo; it will 404 unless added. Not part of skills, just flagging.

## Next steps (priority)
1) Enforce x402 on skill APIs and update clients to send `X-PAYMENT`.  
2) Replace in-step recorder with a durable recorder/stream tied to Browserbase.  
3) Fix Stagehand `model` config, replay start URL handling, and session URL reporting.  
4) Persist Stagehand history/observe output and add extraction/schema so executions return real data.  
5) Resolve duplicate logging and param typing.***
