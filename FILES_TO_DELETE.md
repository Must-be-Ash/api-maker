# Files to Delete from Old Blog-Agent App

This document lists all files from the forked blog-agent application that are **NOT needed** for the new Skills API creation system.

## Current App Focus

**NEW APP - Skills System:**
- Record browser actions to create reusable APIs
- Skill recording, execution, and management
- Browser automation with Browserbase, Stagehand, Playwright
- Variable detection and dynamic extraction
- Triple replay strategy for reliable execution

**OLD APP - Blog/Landing Page Generator (TO DELETE):**
- Landing page generation from URLs and campaign descriptions
- Website scraping and content research
- AI-generated HTML pages with images
- Vercel deployment and microfrontends
- Gallery of generated landing pages
- Slophub/Blog-Agent branding, docs, and payment copy

---

## Docs/Markdown (Keep and Rewrite, do NOT delete)
- Keep all markdown/docs/idea files and update branding/content later:
  - `README.md`
  - `README/WORKFLOW.md`, `README/x402_API_GUIDE.md`, `README/x402-example-call.js`, `README/logs/*`
  - `docs/vercel-docs/micro-plan.md`, `docs/vercel-docs/micro-doc.md`, `docs/x402-docs/x402-plan.md`
  - `docs/idea*.md`, `docs/ideas2.md`

---

## App Routes to Delete

### Landing Page Generation Routes
```
/app/page.tsx                           # Main form for landing page generation
/app/landing/[runId]/page.tsx          # Generated landing page viewer
/app/gallery/page.tsx                   # Gallery of generated landing pages
/app/workflow/[runId]/page.tsx         # Workflow progress viewer
```

### Chat/Test Routes
```
⚠️ KEEP /app/chat/page.tsx              # Chat interface - used for testing
⚠️ KEEP /app/test/[id]/page.tsx         # Test page - might be used for testing
⚠️ KEEP /app/test-iframe/page.tsx       # Iframe test page - might be needed
```

### Branding/Layout to Replace
```
/app/layout.tsx                         # Slophub metadata/OG tags
/app/providers.tsx                      # Slophub appName + Coinbase theme tuned for landing pages
/app/not-found.tsx                      # Slophub-branded 404
```

### API Routes to Delete
```
/app/api/gallery/route.ts                        # Gallery listing API
/app/api/screenshot/route.ts                     # Screenshot capture API
/app/api/upload/route.ts                         # Asset upload for landing pages
/app/api/debug-landing/route.ts                  # Landing page debug route
/app/api/workflows/untitled-4/route.ts           # Landing page workflow trigger
/app/api/workflows/untitled-4/status/route.ts    # Landing page workflow status
```

**Keep these API routes:**
- ✅ `/app/api/skills/*` - All skill-related APIs
- ✅ `/app/api/debug/skill-data/route.ts` - Skill debugging
- ✅ `/app/api/chat/route.ts` - Chat API (used for testing)
- ⚠️ `/app/api/payment-debug/route.ts` - Keep if used for testing skills payment

---

## Workflows to Delete

### Main Workflow
```
/workflows/untitled-4.ts                # Landing page generation workflow
```

### Workflow Steps (All Landing Page Related)

**Content Generation & Scraping:**
```
/workflows/steps/scrape-step.ts                      # Firecrawl website scraping
/workflows/steps/search-step.ts                      # Perplexity search for campaign data
/workflows/steps/generate-text-step.ts               # Text generation step
/workflows/steps/claude-generate-html-step.ts        # Claude HTML generation
/workflows/steps/fal-image-generation-step.ts        # Fal AI image generation
/workflows/steps/screenshot-step.ts                  # Screenshot capture
/workflows/steps/download-and-rehost-images-step.ts  # Image rehosting
/workflows/steps/render-landing-page-html-step.ts    # HTML rendering
```

**Deployment & Infrastructure:**
```
/workflows/steps/deploy-to-vercel-step.ts            # Vercel deployment
/workflows/steps/commit-and-push-step.ts             # Git operations
/workflows/steps/upload-assets-step.ts               # Asset uploading to Vercel Blob
/workflows/steps/add-to-microfrontends-group-step.ts # Microfrontends grouping
/workflows/steps/register-microfrontend-step.ts      # Microfrontend registration
/workflows/steps/verify-microfrontend-group-membership-step.ts # Verification
```

**Utility Steps (Review before deleting):**
```
/workflows/steps/save-to-mongodb-step.ts  # Generic MongoDB save - might be reusable?
/workflows/steps/log-step-data.ts         # Generic logging - might be reusable?
/workflows/steps/create-chat-step.ts      # Chat creation - not needed
```

**Keep these workflow files:**
- ✅ `/workflows/start-recording.ts` - Skill recording start
- ✅ `/workflows/finish-recording.ts` - Skill recording finish
- ✅ `/workflows/execute-skill.ts` - Skill execution
- ✅ `/workflows/steps/start-recording-step.ts` - Recording initialization
- ✅ `/workflows/steps/finish-recording-step.ts` - Recording completion
- ✅ `/workflows/steps/execute-skill-step.ts` - Skill execution logic

---

## Components - KEEP ALL

**Not worrying about components - keeping everything:**
- ✅ `/components/Header.tsx` - App header with wallet integration
- ✅ `/components/WalletDropdown.tsx` - Wallet dropdown menu
- ✅ `/components/SkillTester.tsx` - Skill testing component
- ✅ `/components/ui/text-shimmer.tsx` - UI utility component
- ✅ `/components/blog-preview.tsx` - Keep (might be useful)
- ✅ `/components/floating-cta.tsx` - Keep (might be useful)
- ✅ `/components/workflow-progress-bar.tsx` - Keep (might be useful for skills)
- ✅ `/components/workflow-status-client.tsx` - Keep (might be useful for skills)
- ✅ `/components/workflow-step-timeline.tsx` - Keep (might be useful for skills)

### Public Assets to Remove/Replace
```
/public/logo*.png|svg
/public/logo-w-t.*
/public/og.png
/public/favicon-*.png
/public/favicon.ico
/public/site.webmanifest
```

---

## Lib Files - Conservative Approach

### Only Delete If Certain
```
/lib/workflow-cache.ts          # Caching for landing page workflow progress - DELETE
/lib/image-utils.ts             # Image processing for landing pages - DELETE
```

### Keep Everything Else (When in Doubt, Keep)

**Config File (Partial Update Only):**
```
/lib/config.ts - KEEP
```
- ✅ **KEEP** entire file
- 🔧 **UPDATE** `COST_CONFIG.landingPageGeneration` to `COST_CONFIG.skillCreation` or similar
- 🔧 **UPDATE** comments to reference skills instead of landing pages

**Payment Logger - KEEP:**
```
/lib/payment-logger.ts - KEEP
```
- ✅ Keep but update "Landing Page Generation" references to "Skill Creation/Execution"

**Credential Helper - KEEP:**
```
/lib/credential-helper.ts - KEEP
```
- ✅ Keep (might be useful for future integrations)

**Generic Steps - KEEP:**
```
/lib/steps/condition.ts - KEEP
/lib/steps/http-request.ts - KEEP
```
- ✅ Keep (generic utilities, might be useful)

**Rate Limiting - KEEP:**
```
/lib/rate-limit.ts - KEEP
```
- ✅ Keep (might be useful for skill API rate limiting)

**Keep these lib files:**
- ✅ `/lib/mongodb.ts` - Database connection
- ✅ `/lib/payment-verification.ts` - x402 payment verification
- ✅ `/lib/payment-logger.ts` - Payment logging
- ✅ `/lib/utils.ts` - Generic utilities
- ✅ `/lib/ai/*` - Goal inference, variable extraction (for skills)
- ✅ `/lib/capture/*` - Action recording, grouping, variable detection (for skills)
- ✅ `/lib/execution/*` - Result tracking (for skills)
- ✅ `/lib/extraction/*` - Schema generation, templates (for skills)
- ✅ `/lib/types/*` - TypeScript type definitions (for skills)

---

## Root Config to Delete
```
/microfrontends.json   # blog-agent fallback; tied to landing microfrontend steps
```

---

## Scripts (Keep; review/disable instead of deleting)
```
/scripts/update-thumbnails.ts            # Landing screenshots
/scripts/check-landing-page.ts           # Checks landingPageHtml in Mongo
/scripts/delete-workflows.ts             # Deletes landing wrun_* workflows
```
Keep these scripts for reference; disable or archive rather than delete.

---

## Environment Variables to Remove

After deleting files, clean up `.env.local`:

**Remove these (landing page generation):**
```bash
# For Fal AI image generation
FAL_KEY=...

# For Firecrawl integration
FIRECRAWL_API_KEY=...

# For Perplexity integration
PERPLEXITY_API_KEY=...

# For V0 integration
V0_API_KEY=...

# For Screenshot API
SCREENSHOTAPI_TOKEN=...

# Vercel deployment (if not used elsewhere)
VERCEL_TOKEN=...
VERCEL_TEAM_ID=...
VERCEL_MICROFRONTENDS_GROUP_ID=...

# For Blob integration (if only used for landing pages)
BLOB_READ_WRITE_TOKEN=...
```

**Keep these (skills system):**
```bash
✅ MONGODB_URI - Required for skill storage
✅ OPENAI_API_KEY - Used by AI SDK for goal inference, variable detection, etc.
✅ BROWSERBASE_API_KEY - Required for browser sessions
✅ BROWSERBASE_PROJECT_ID - Required for Browserbase
✅ NEXT_PUBLIC_CDP_PROJECT_ID - Coinbase wallet integration
✅ CDP_API_KEY_ID - CDP wallet
✅ CDP_API_KEY_SECRET - CDP wallet
✅ FACILITATOR_URL - x402 payment network
✅ NEXT_PUBLIC_NETWORK - Network configuration
✅ USDC_CONTRACT_ADDRESS - USDC payment contract
✅ NEXT_PUBLIC_RECEIVING_WALLET_ADDRESS - Payment receiving address
✅ X402_WALLET_ADDRESS - x402 configuration
✅ NEXT_PUBLIC_URL - App URL
```

---

## MongoDB Collections to Review

After deleting code, review MongoDB collections:

**Likely can delete:**
- `workflows` collection - stores landing page generation workflows
- `workflow_step_status` collection - stores workflow progress for landing pages

**Keep:**
- ✅ `skills` - Skill definitions
- ✅ `recording_sessions` - Active recording sessions
- ✅ `execution_results` - Skill execution logs

---

## Dependencies to Review (package.json)

After deleting files, review if these dependencies are still needed:

**Likely can remove:**
```json
"@codesandbox/sandpack-react"  // Used for blog preview
"@fal-ai/client"               // Fal AI image generation
"firecrawl-sdk"                // Website scraping
```

**Keep:**
```json
"@browserbasehq/stagehand"     // ✅ Browser automation
"@coinbase/cdp-hooks"          // ✅ Wallet integration
"x402-fetch"                   // ✅ Payment integration
"mongodb"                      // ✅ Database
"openai"                       // ✅ AI SDK
"ai"                           // ✅ Vercel AI SDK
"workflow"                     // ✅ Workflow framework
```

---

## Deletion Strategy

### Phase 1: Safe to Delete Immediately
1. Landing page viewer: `/app/landing/*`
2. Gallery: `/app/gallery/*`, `/app/api/gallery/*`
3. Slophub branding assets: `/public/logo*`, `/public/og.png`, favicons/webmanifest
4. Slophub layout/providers/not-found: `/app/layout.tsx`, `/app/providers.tsx`, `/app/not-found.tsx`

**KEEP (for testing):**
- ✅ `/app/test/*`, `/app/test-iframe/*`
- ✅ `/app/chat/*`, `/app/api/chat/*`
- ✅ All components

### Phase 2: Delete Workflows
1. `/workflows/untitled-4.ts`
2. All workflow steps listed above (except skill-related)

### Phase 3: Delete APIs
1. `/app/api/upload/*`
2. `/app/api/screenshot/*`
3. `/app/api/debug-landing/*`
4. `/app/api/workflows/untitled-4/*`
5. Landing page generation form: `/app/page.tsx`
6. Payment-debug endpoint if unused by skills: `/app/api/payment-debug/route.ts`

### Phase 4: Clean up Lib (Conservative - Keep Most Things)
1. **DELETE:** `/lib/workflow-cache.ts`
2. **DELETE:** `/lib/image-utils.ts`
3. **UPDATE (not delete):** `/lib/config.ts` - Change landingPageGeneration to skillCreation
4. **UPDATE (not delete):** `/lib/payment-logger.ts` - Update text references
5. **KEEP:** Everything else in `/lib/` (when in doubt, keep it)

### Phase 5: Environment & Dependencies
1. Remove unused env vars from `.env.local`
2. Remove unused dependencies from `package.json`
3. Run `pnpm install` to update lockfile

---

## What to Build Next (New Home Page)

After deleting the old landing page generator (`/app/page.tsx`), create a new home page focused on the Skills system:

**New Home Page Should Include:**
- Hero section explaining skill recording/API creation
- "Create Your First Skill" CTA button → `/skills/record`
- "Browse Existing Skills" link → `/skills`
- How it works: 1) Record, 2) Execute, 3) Get Results
- Example use cases (flight search, product price check, weather lookup)
- Wallet connection (already have Header component)

---

## Summary (Conservative Approach)

**Files to DELETE:**
- ~10 app routes (landing, gallery, workflow viewer)
- ~16 workflow steps (landing page generation)
- 1 workflow (`untitled-4.ts`)
- 2 lib files (`workflow-cache.ts`, `image-utils.ts`)
- Public assets (Slophub branding)
- Layout/providers (Slophub branding)
- ~7 env vars (Fal, Firecrawl, Perplexity, etc.)

**Files to KEEP (when in doubt):**
- ✅ All components
- ✅ Chat & test pages (for testing)
- ✅ Most lib files (credential-helper, rate-limit, generic steps, etc.)
- ✅ Payment-related files (just update text references)

**Files to UPDATE (not delete):**
- 🔧 `/lib/config.ts` - Update pricing references
- 🔧 `/lib/payment-logger.ts` - Update "Landing Page" to "Skill"

**Result:** Clean removal of landing page generation workflow while keeping everything that might be useful for testing or future features.
