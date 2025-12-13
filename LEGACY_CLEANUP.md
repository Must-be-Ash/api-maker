# Legacy blog-agent/Slophub artifacts to remove or update for the Skills System

These are the remaining files, routes, scripts, and docs tied to the old Slophub landing-page/blog-agent product. They either need to be removed or rewritten to match the new browser-recording “Skills” direction from `skill-idea.md`.

## Product/docs still describing landing pages
- `README.md` (Slophub landing page generator story, payments, gallery, etc.).
- `README/WORKFLOW.md`, `README/x402_API_GUIDE.md`, `README/x402-example-call.js`, `README/logs/x402-call-*` (full landing workflow + payment examples/logs).
- `docs/vercel-docs/micro-plan.md`, `docs/vercel-docs/micro-doc.md`, `docs/x402-docs/x402-plan.md` (microfrontends + Vercel routing for landing pages and blog-agent branding).
- `docs/idea.md`, `docs/ideas2.md` (landing/blog automation ideas, not aligned with Skills recorder).

## Frontend routes/components from the old app
- `app/layout.tsx`, `app/providers.tsx` (Slophub metadata, “AI Landing Page Generator” appName, Coinbase auth theme).
- `app/page.tsx` (main landing-page generator UI with URL/campaign form, x402 payment flow, image upload).
- `app/gallery/page.tsx`, `app/landing/[runId]/page.tsx`, `app/workflow/[runId]/page.tsx` (landing gallery, public landing render, workflow status page).
- `app/not-found.tsx` (Slophub-branded 404), `app/test-iframe/page.tsx` (landing screenshot test), `app/test/[id]/page.tsx` (placeholder test route).
- `components/Header.tsx`, `components/WalletDropdown.tsx`, `components/floating-cta.tsx` (Slophub branding + Coinbase wallet gating), `components/blog-preview.tsx` (renders V0-generated blog/landing TSX), `components/workflow-status-client.tsx`, `components/workflow-progress-bar.tsx`, `components/workflow-step-timeline.tsx` (landing workflow UI).
- Public assets tied to the old brand: `public/logo*.png|svg`, `public/logo-w-t.*`, `public/og.png`, favicon set, etc.

## Legacy APIs, workflows, and payment plumbing
- `app/api/workflows/untitled-4/route.ts` and `app/api/workflows/untitled-4/status/route.ts` (x402-gated landing-page workflow start/status).
- `workflows/untitled-4.ts` (entire landing page generation pipeline).
- Landing-specific workflow steps under `workflows/steps/`: `scrape-step.ts`, `search-step.ts`, `generate-text-step.ts`, `fal-image-generation-step.ts`, `claude-generate-html-step.ts`, `render-landing-page-html-step.ts`, `upload-assets-step.ts`, `download-and-rehost-images-step.ts`, `save-to-mongodb-step.ts`, `screenshot-step.ts`, `register-microfrontend-step.ts`, `add-to-microfrontends-group-step.ts`, `verify-microfrontend-group-membership-step.ts`, `commit-and-push-step.ts`, `deploy-to-vercel-step.ts`, `log-step-data.ts`, `create-chat-step.ts`.
- `app/api/gallery/route.ts`, `app/api/debug-landing/route.ts`, `app/api/screenshot/route.ts`, `app/api/upload/route.ts`, `app/api/payment-debug/route.ts` (landing gallery/debug, screenshot capture, blob upload, payment test endpoints).
- Payment/price config for landing pages: `lib/config.ts` (`COST_CONFIG`, `PAYMENT_CONFIG`), `lib/payment-logger.ts` (Landing Page Generation hardcoded), `lib/payment-verification.ts` helpers tuned to x402 flow.
- `microfrontends.json` (blog-agent parent/fallback); coupled to `register-microfrontend-step.ts` and Vercel microfrontend plan docs.

## Legacy scripts/data helpers
- `scripts/update-thumbnails.ts`, `scripts/check-landing-page.ts`, `scripts/delete-workflows.ts` (all target `wrun_` landing runs, screenshots, and Mongo landingPageHtml fields).
- Test/demo routes and assets above are also only for the old landing generator and can be dropped once Skills flow replaces them.
