# Rebrand/Rewrite Targets (Slophub/Blog-Agent → Skills System)

Only the places that need editing/rebranding for the new Skills system (no delete list here).

## Product Copy & Docs (Keep, but rewrite/rebrand)
- `README.md` – replace Slophub landing-page narrative with Skills recorder/executor story.
- `README/WORKFLOW.md`, `README/x402_API_GUIDE.md`, `README/x402-example-call.js`, `README/logs/*` – rewrite to describe skill recording/execution flows (or archive in-place; do not delete).
- `docs/vercel-docs/micro-plan.md`, `docs/vercel-docs/micro-doc.md`, `docs/x402-docs/x402-plan.md` – remove microfrontend/landing language; update if skills still use Vercel routing/payment.
- `docs/idea*.md`, `docs/ideas2.md` – keep ideas; annotate/prune toward skills use cases.

## App Shell & UI Branding
- `app/layout.tsx` – update site metadata/OG tags from Slophub to Skills system.
- `app/providers.tsx` – change `appName`, theme overrides, any copy tied to landing pages.
- `app/not-found.tsx` – swap Slophub logo/text for Skills branding.
- `components/Header.tsx`, `components/WalletDropdown.tsx`, `components/floating-cta.tsx` – update logos, names, links (no slophub.xyz), wallet prompts to fit Skills.

## Feature Pages to Rewrite (not delete, unless replacing)
- `app/page.tsx` – main form is landing-page generator; needs full rewrite to Skills home/CTA.
- `app/gallery/page.tsx`, `app/landing/[runId]/page.tsx`, `app/workflow/[runId]/page.tsx` – convert or replace with Skills equivalents (skill list, execution history, recording status).
- `components/workflow-status-client.tsx`, `components/workflow-progress-bar.tsx`, `components/workflow-step-timeline.tsx` – rebrand UI and repurpose for skill runs if kept.
- `components/blog-preview.tsx` – either repurpose for skill output preview or remove; currently branded to blog/landing previews.

## Assets
- `public/logo*.png|svg`, `public/logo-w-t.*`, `public/og.png`, favicons/webmanifest – replace with Skills branding.

## Payments/Config
- `lib/config.ts` – remove landing-specific prices (`COST_CONFIG.landingPageGeneration`), update wording for Skills pricing.
- `lib/payment-logger.ts` – change service labels from “Landing Page Generation” to Skills terminology.
- `lib/payment-verification.ts` (if used) – ensure copy/examples match Skills endpoints.

## API/Workflow Naming (if kept vs. deleted)
- `app/api/payment-debug/route.ts` – rename description to Skills if retained.
- `app/api/workflows/untitled-4/*`, `workflows/untitled-4.ts` and related steps – if repurposed instead of deleted, rename IDs/descriptions from landing pages to skills.
