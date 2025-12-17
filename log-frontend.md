[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1766007684545_h4qj4xork',
  variables: { product: 'iPhone 15 Pro' },
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 13ms (compile: 2ms, render: 10ms)
[executeSkillStep] Executing skill: skill_1766007684545_h4qj4xork
[executeSkillStep] Loaded skill: { name: 'Amazon Product Price Search', operations: 5 }
[executeSkillStep] Using provided variables directly: { product: 'iPhone 15 Pro' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Find price for %product% on Amazon',
  substituted: 'Find price for iPhone 15 Pro on Amazon'
}
[Schema Generator] Analysis: {
  goal: 'Find price for iPhone 15 Pro on Amazon',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: 'Current price of the iPhone 15 Pro with currency symbol'
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
      description: 'Name of the seller',
      optional: true
    },
    {
      name: 'productUrl',
      type: 'string',
      description: 'URL of the product page'
    }
  ],
  instruction: 'Extract product price, title, availability, and other details for iPhone 15 Pro on Amazon',
  description: 'Extracts product information including price, title, and availability from Amazon for the iPhone 15 Pro.'
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
  instruction: 'Extract product price, title, availability, and other details for iPhone 15 Pro on Amazon'
}
[executeSkillStep] Built Zod schema with 6 fields
[Extraction Schema] {
  fields: [
    {
      name: 'price',
      type: 'string',
      description: 'Current price of the iPhone 15 Pro with currency symbol'
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
      description: 'Name of the seller',
      optional: true
    },
    {
      name: 'productUrl',
      type: 'string',
      description: 'URL of the product page'
    }
  ],
  instruction: 'Extract product price, title, availability, and other details for iPhone 15 Pro on Amazon',
  fieldCount: 6,
  timestamp: '2025-12-17T21:45:04.731Z'
}
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 5 actions
[executeExactReplay] Variables: { product: 'iPhone 15 Pro' }
[executeExactReplay] Navigating to start URL: https://www.amazon.com/
[executeExactReplay] Action: navigate Navigate to https://www.amazon.com/
[executeExactReplay] Action: click Click Search Amazon
[executeExactReplay] Action: type Fill Search Amazon
[executeExactReplay] Action: type Fill Search Amazon
[executeExactReplay] Substituted %product% → iPhone 15 Pro
[Variable Substitution] {
  original: '%product%',
  substituted: 'iPhone 15 Pro',
  variable: 'product',
  selector: '#twotabsearchtextbox',
  timestamp: '2025-12-17T21:45:14.275Z'
}
[executeExactReplay] Action: submit Submit and wait for navigation
[executeExactReplay] ⏎ Submitting form via: #twotabsearchtextbox
[executeExactReplay] URL before submit: https://www.amazon.com/
[executeExactReplay] ⏎ Submitting form via: #twotabsearchtextbox
[executeExactReplay] ✓ Navigation detected: https://www.amazon.com/s/ref=nb_sb_noss_1?url=search-alias%3Daps&field-keywords=iPhone+15+Pro&crid=2ABUIHYTMPREH&sprefix=iphone+15+pro%2Caps%2C297
[executeExactReplay] ✓ Navigation completed after submit
[Auto-Scroll] Page is long, scrolling to trigger lazy-loaded content...
[Auto-Scroll] Page height: 7740 Viewport: 711
[Auto-Scroll] Waited 2s for lazy content to load
[Auto-Scroll] ✓ Auto-scroll complete, page settled
[executeExactReplay] Extracting data with schema (full page)...
[executeExactReplay] Extraction result: {
  price: '$539.00',
  title: 'Apple iPhone 15 Pro, 256GB, Blue Titanium - Unlocked (Renewed)',
  availability: 'FREE delivery Mon, Dec 22',
  rating: '4.1 out of 5 stars, 1,987 ratings',
  seller: 'Apple',
  productUrl: '7-1884'
}
[ResultTracker] ✓ exact_replay succeeded in 34730ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '1e755348-018a-4ee8-b848-49b8273d7c72',
  sessionUrl: 'https://www.browserbase.com/sessions/1e755348-018a-4ee8-b848-49b8273d7c72',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/1e755348-018a-4ee8-b848-49b8273d7c72/devtools/page/C19FEB65D1C85AB48B41A6F1E4EC90B0?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  price: '$539.00',
  title: 'Apple iPhone 15 Pro, 256GB, Blue Titanium - Unlocked (Renewed)',
  availability: 'FREE delivery Mon, Dec 22',
  rating: '4.1 out of 5 stars, 1,987 ratings',
  seller: 'Apple',
  productUrl: '7-1884'
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1766007901543_qiyvw3hk3
Skill: Amazon Product Price Search
Variables: { product: 'iPhone 15 Pro' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (34730ms)
   Details: { actionsCompleted: 5, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 34731 ms
Tokens Used: 28604

--- Extraction ---
Data Extracted: YES
Extracted Fields: 6
Non-empty Fields: [ 'price', 'title', 'availability', 'rating', 'seller', 'productUrl' ]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/1e755348-018a-4ee8-b848-49b8273d7c72
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/1e755348-018a-4ee8-b848-49b8273d7c72/devtools/page/C19FEB65D1C85AB48B41A6F1E4EC90B0?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1766007901543_qiyvw3hk3',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
 POST /.well-known/workflow/v1/step 200 in 42s (compile: 2ms, render: 42s)
 POST /.well-known/workflow/v1/flow 200 in 14ms (compile: 1588µs, render: 12ms)
[POST /api/skills/[skillId]/execute] Skill executed: {
  skillId: 'skill_1766007684545_h4qj4xork',
  strategy: 'exact_replay',
  success: true
}
 POST /api/skills/skill_1766007684545_h4qj4xork/execute 200 in 45s (compile: 6ms, render: 45s)
