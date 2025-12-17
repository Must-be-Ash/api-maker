ashnouruzi@C357PRGCH2 api-maker % pnpm dev

> next-boilerplate@0.1.0 dev /Users/ashnouruzi/api-maker
> next dev

Discovering workflow directives 1917ms
Created steps bundle 34ms
Created intermediate workflow bundle 12ms
Creating webhook route
   ▲ Next.js 16.0.7 (Turbopack)
   - Local:         http://localhost:3000
   - Network:       http://192.168.1.101:3000
   - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.8s
 ○ Compiling /skills/[skillId] ...
 GET /skills/skill_1766007684545_h4qj4xork 200 in 4.7s (compile: 4.3s, render: 390ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766007684545_h4qj4xork
 GET /api/skills/skill_1766007684545_h4qj4xork 200 in 2.6s (compile: 2.0s, render: 580ms)
[GET /api/skills/[skillId]] Fetching skill: skill_1766007684545_h4qj4xork
 GET /api/skills/skill_1766007684545_h4qj4xork 200 in 29ms (compile: 6ms, render: 23ms)
[x402] Payment required - returning 402
 POST /api/skills/skill_1766007684545_h4qj4xork/execute 402 in 1856ms (compile: 1826ms, render: 30ms)
[x402] Payment received:
  From: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
  To: 0x08bfec5133141cc704a34505d5e504503bf3168d
  Amount: 10000
  Network: base
[x402] ✓ Payment verified for: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment verified from: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] Settlement error: Error: Failed to settle payment: 500 Internal Server Error
    at async settlePayment (lib/payment-verification.ts:130:28)
    at async POST (app/api/skills/[skillId]/execute/route.ts:129:30)
  128 |     decodedPayment.x402Version = x402Version;
  129 |
> 130 |     const settleResponse = await settle(decodedPayment, paymentRequirements);
      |                            ^
  131 |
  132 |     if (!settleResponse.success) {
  133 |       console.error('[x402] Payment settlement failed');
[x402] ✗ Settlement failed: Failed to settle payment: 500 Internal Server Error
[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1766007684545_h4qj4xork',
  variables: { product: 'Playstation 5' },
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 157ms (compile: 142ms, render: 15ms)
[executeSkillStep] Executing skill: skill_1766007684545_h4qj4xork
[executeSkillStep] Loaded skill: { name: 'Amazon Product Price Search', operations: 5 }
[executeSkillStep] Using provided variables directly: { product: 'Playstation 5' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Find price for %product% on Amazon',
  substituted: 'Find price for Playstation 5 on Amazon'
}
[Schema Generator] Analysis: {
  goal: 'Find price for Playstation 5 on Amazon',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: 'Current price of the Playstation 5 with currency symbol'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Product title for validation'
    },
    {
      name: 'availability',
      type: 'string',
      description: 'Stock availability status'
    },
    {
      name: 'rating',
      type: 'string',
      description: 'Average customer rating',
      optional: true
    },
    {
      name: 'seller',
      type: 'string',
      description: 'Name of the seller offering the product',
      optional: true
    },
    {
      name: 'productUrl',
      type: 'string',
      description: 'URL of the product page'
    }
  ],
  instruction: 'Extract product price, title, availability, and other relevant details for Playstation 5 on Amazon',
  description: 'Extracts product information for Playstation 5 from Amazon, including price and availability.'
}
[executeSkillStep] Regenerated schema: {
  fields: [
    'price',
    'title',
    'availability',
    'rating',
    'seller',
    'productUrl'
  ],
  instruction: 'Extract product price, title, availability, and other relevant details for Playstation 5 on Amazon'
}
[executeSkillStep] Built Zod schema with 6 fields
[Extraction Schema] {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: 'Current price of the Playstation 5 with currency symbol'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Product title for validation'
    },
    {
      name: 'availability',
      type: 'string',
      description: 'Stock availability status'
    },
    {
      name: 'rating',
      type: 'string',
      description: 'Average customer rating',
      optional: true
    },
    {
      name: 'seller',
      type: 'string',
      description: 'Name of the seller offering the product',
      optional: true
    },
    {
      name: 'productUrl',
      type: 'string',
      description: 'URL of the product page'
    }
  ],
  instruction: 'Extract product price, title, availability, and other relevant details for Playstation 5 on Amazon',
  fieldCount: 6,
  timestamp: '2025-12-17T21:43:28.734Z'
}
[dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  suppress all logs with { quiet: true }
[dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 prevent building .env in docker: https://dotenvx.com/prebuild
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 5 actions
[executeExactReplay] Variables: { product: 'Playstation 5' }
[executeExactReplay] Navigating to start URL: https://www.amazon.com/
[executeExactReplay] Action: navigate Navigate to https://www.amazon.com/
[executeExactReplay] Action: click Click Search Amazon
[executeExactReplay] Action: type Fill Search Amazon
[executeExactReplay] Action: type Fill Search Amazon
[executeExactReplay] Substituted %product% → Playstation 5
[Variable Substitution] {
  original: '%product%',
  substituted: 'Playstation 5',
  variable: 'product',
  selector: '#twotabsearchtextbox',
  timestamp: '2025-12-17T21:43:39.636Z'
}
[executeExactReplay] Action: submit Submit and wait for navigation
[executeExactReplay] ⏎ Submitting form via: #twotabsearchtextbox
[executeExactReplay] URL before submit: https://www.amazon.com/
[executeExactReplay] ⏎ Submitting form via: #twotabsearchtextbox
[executeExactReplay] ✓ Navigation detected: https://www.amazon.com/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords=Playstation+5&crid=233974V6SVR0&sprefix=playstation+5%2Caps%2C378
[executeExactReplay] ✓ Navigation completed after submit
[Auto-Scroll] Page is long, scrolling to trigger lazy-loaded content...
[Auto-Scroll] Page height: 8434 Viewport: 711
[Auto-Scroll] Waited 2s for lazy content to load
[Auto-Scroll] ✓ Auto-scroll complete, page settled
[executeExactReplay] Extracting data with schema (full page)...
[executeExactReplay] Extraction result: {
  price: '$648.99 List: $749.99',
  title: 'PlayStation 5 Pro Console',
  availability: 'FREE delivery Mon, Dec 22 Or fastest delivery Fri, Dec 19 Arrives before Christmas',
  rating: '4.7 out of 5 stars, 11,508 ratings',
  seller: 'by PlayStation',
  productUrl: '7-2055'
}
[ResultTracker] ✓ exact_replay succeeded in 26672ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: 'f3a8c56b-508c-46ca-99e7-2fe8366a3b4d',
  sessionUrl: 'https://www.browserbase.com/sessions/f3a8c56b-508c-46ca-99e7-2fe8366a3b4d',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/f3a8c56b-508c-46ca-99e7-2fe8366a3b4d/devtools/page/F34156758A0C6CE3B839AF8D51EC76AF?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  price: '$648.99 List: $749.99',
  title: 'PlayStation 5 Pro Console',
  availability: 'FREE delivery Mon, Dec 22 Or fastest delivery Fri, Dec 19 Arrives before Christmas',
  rating: '4.7 out of 5 stars, 11,508 ratings',
  seller: 'by PlayStation',
  productUrl: '7-2055'
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1766007802616_k6wc2pex6
Skill: Amazon Product Price Search
Variables: { product: 'Playstation 5' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (26672ms)
   Details: { actionsCompleted: 5, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 26672 ms
Tokens Used: 20594

--- Extraction ---
Data Extracted: YES
Extracted Fields: 6
Non-empty Fields: [ 'price', 'title', 'availability', 'rating', 'seller', 'productUrl' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/f3a8c56b-508c-46ca-99e7-2fe8366a3b4d
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/f3a8c56b-508c-46ca-99e7-2fe8366a3b4d/devtools/page/F34156758A0C6CE3B839AF8D51EC76AF?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1766007802616_k6wc2pex6',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 37.0s (compile: 317ms, render: 36.7s)
 POST /.well-known/workflow/v1/flow 200 in 18ms (compile: 4ms, render: 14ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1766007684545_h4qj4xork',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1766007684545_h4qj4xork/execute 200 in 43s (compile: 6ms, render: 43s)
