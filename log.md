my endpoint is working great and we paid with x402 and successfully fetch results based on variable query and you can see the terminal logs here /Users/ashnouruzi/api-maker/log.md

but my frontend failed to show the results and just got stock on 'Processing payment & executing...'

[x402] Payment required - returning 402
 POST /api/skills/skill_1765858104395_pr5n8rm7q/execute 402 in 42ms (compile: 18ms, render: 24ms)
[x402] Payment received:
  From: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
  To: 0x08bfec5133141cc704a34505d5e504503bf3168d
  Amount: 10000
  Network: base
[x402] ✓ Payment verified for: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment verified from: 0x67C8c22E7EDc7Bf25C299E2c3b9aaD4cF2ee6c79
[x402] ✓ Payment settled: 0xfd32273e5d2e80bdd680fe0d0a97e732616618a6f64116f61fe6b0893455a624
[x402] ✓ Payment settled: 0xfd32273e5d2e80bdd680fe0d0a97e732616618a6f64116f61fe6b0893455a624
[POST /api/skills/[skillId]/execute] Executing skill {
  skillId: 'skill_1765858104395_pr5n8rm7q',
  variables: { topic: 'Brad Pitt' },
  executorAddress: null
}
 POST /.well-known/workflow/v1/flow 200 in 15ms (compile: 1489µs, render: 14ms)
[executeSkillStep] Executing skill: skill_1765858104395_pr5n8rm7q
[executeSkillStep] Loaded skill: {
  name: 'Skill: Search Wikipedia for %topic% and extract informati',
  operations: 4
}
[executeSkillStep] Using provided variables directly: { topic: 'Brad Pitt' }
[executeSkillStep] Skill has variables, regenerating schema with actual values
[executeSkillStep] Substituted goal: {
  original: 'Search Wikipedia for %topic% and extract information',
  substituted: 'Search Wikipedia for Brad Pitt and extract information'
}
[Schema Generator] Analysis: {
  goal: 'Search Wikipedia for Brad Pitt and extract information',
  hasVariables: false,
  variables: [],
  contextProvided: false
}
[Schema Generator] Generated schema: {
  fields: [
    {
      name: 'name',
      type: 'string',
      description: "Full name of the person, e.g., 'Brad Pitt'."
    },
    {
      name: 'birthDate',
      type: 'string',
      description: "Birth date in ISO format, e.g., '1963-12-18'."
    },
    {
      name: 'occupation',
      type: 'array',
      description: "List of occupations, e.g., ['Actor', 'Producer']."
    },
    {
      name: 'awards',
      type: 'array',
      description: 'List of notable awards received.'
    },
    {
      name: 'spouse',
      type: 'array',
      description: 'List of spouses with marriage dates, if available.',
      optional: true
    },
    {
      name: 'children',
      type: 'number',
      description: 'Number of children.',
      optional: true
    },
    {
      name: 'biography',
      type: 'string',
      description: "Brief biography or summary of the person's life.",
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the Wikipedia page.'
    }
  ],
  instruction: 'Extract detailed information about Brad Pitt from his Wikipedia page.',
  description: 'Extracts personal and career information about Brad Pitt from Wikipedia.'
}
[executeSkillStep] Regenerated schema: {
  fields: [
    'name',
    'birthDate',
    'occupation',
    'awards',
    'spouse',
    'children',
    'biography',
    'url'
  ],
  instruction: 'Extract detailed information about Brad Pitt from his Wikipedia page.'
}
[executeSkillStep] Built Zod schema with 8 fields
[Extraction Schema] {
  fields: [
    {
      name: 'name',
      type: 'string',
      description: "Full name of the person, e.g., 'Brad Pitt'."
    },
    {
      name: 'birthDate',
      type: 'string',
      description: "Birth date in ISO format, e.g., '1963-12-18'."
    },
    {
      name: 'occupation',
      type: 'array',
      description: "List of occupations, e.g., ['Actor', 'Producer']."
    },
    {
      name: 'awards',
      type: 'array',
      description: 'List of notable awards received.'
    },
    {
      name: 'spouse',
      type: 'array',
      description: 'List of spouses with marriage dates, if available.',
      optional: true
    },
    {
      name: 'children',
      type: 'number',
      description: 'Number of children.',
      optional: true
    },
    {
      name: 'biography',
      type: 'string',
      description: "Brief biography or summary of the person's life.",
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the Wikipedia page.'
    }
  ],
  instruction: 'Extract detailed information about Brad Pitt from his Wikipedia page.',
  fieldCount: 8,
  timestamp: '2025-12-16T04:09:52.499Z'
}
[executeSkillStep] Attempting Strategy 1: Exact Selector Replay
[ResultTracker] Starting exact_replay
[executeExactReplay] Starting exact replay with 4 actions
[executeExactReplay] Variables: { topic: 'Brad Pitt' }
[executeExactReplay] Navigating to start URL: https://www.wikipedia.org/
[executeExactReplay] Action: navigate Navigate to https://www.wikipedia.org/
[executeExactReplay] Action: click Click input
[executeExactReplay] Action: type Fill input
[executeExactReplay] Substituted %topic% → Brad Pitt
[Variable Substitution] {
  original: '%topic%',
  substituted: 'Brad Pitt',
  variable: 'topic',
  selector: '#searchInput',
  timestamp: '2025-12-16T04:09:58.858Z'
}
[executeExactReplay] Action: submit Submit and wait for navigation
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] URL before submit: https://www.wikipedia.org/
[executeExactReplay] ⏎ Submitting form via: #searchInput
[executeExactReplay] ✓ Navigation detected: https://en.wikipedia.org/wiki/Brad_Pitt
[executeExactReplay] ✓ Navigation completed after submit
[executeExactReplay] Extracting data with schema...
[executeExactReplay] Extraction result: {
  name: 'Brad Pitt',
  birthDate: 'December 18, 1963',
  occupation: [ 'Actor', 'film producer' ],
  awards: [
    'Academy Awards',
    'British Academy Film Awards',
    'Golden Globe Awards',
    'Primetime Emmy Awards',
    'Volpi Cup'
  ],
  spouse: [
    'Jennifer Aniston (m. 2000; div. 2005)',
    'Angelina Jolie (m. 2014; div. 2019)'
  ],
  children: 6,
  biography: "William Bradley Pitt (born December 18, 1963) is an American actor and film producer. In a film career spanning more than thirty years, Pitt has received numerous accolades, including two Academy Awards, two British Academy Film Awards, two Golden Globe Awards, two Primetime Emmy Awards and one Volpi Cup. His films as a leading actor have grossed over $7.5 billion worldwide. Pitt first gained recognition as a cowboy hitchhiker in the Ridley Scott road film Thelma & Louise (1991). Pitt emerged as a star taking on leading man roles in films such as the drama A River Runs Through It (1992), the western Legends of the Fall (1994), the horror film Interview with the Vampire (1994), the crime thriller Seven (1995), the cult film Fight Club (1999), and the crime comedy Snatch (2000). Pitt found greater commercial success starring in Steven Soderbergh's heist film Ocean's Eleven (2001), and reprised his role in its sequels. He cemented his leading man status starring in blockbusters such as the historical epic Troy (2004), the romantic crime film Mr. & Mrs. Smith (2005), the horror World War Z (2013), and the sports drama F1 (2025). Pitt won the Academy Award for Best Supporting Actor for playing a stuntman in Quentin Tarantino's Once Upon a Time in Hollywood (2019). He was Oscar-nominated for his roles in the science fiction drama 12 Monkeys (1995), the fantasy romance The Curious Case of Benjamin Button (2008) and the sports drama Moneyball (2011). He also starred in acclaimed films such as Babel (2006), The Assassination of Jesse James by the Coward Robert Ford (2007), Burn After Reading (2008), Inglourious Basterds (2009), The Tree of Life (2011), Fury (2014), The Big Short (2015), and Ad Astra (2019). In 2001, Pitt co-founded the production company Plan B Entertainment. As a producer, he won the Academy Award for Best Picture for 12 Years a Slave (2013) and was nominated for Moneyball (2011) and The Big Short (2015). One of the most influential celebrities, Pitt appeared on Forbes' annual Celebrity 100 list from 2006 to 2008, and the Time 100 list in 2007. Regarded as a sex symbol, Pitt was named People's Sexiest Man Alive in 1995 and 2000. Pitt's relationships have also been subject to widespread media attention, particularly his marriages to actresses Jennifer Aniston and Angelina Jolie, the latter of whom he shares six children with.",
  url: 'https://en.wikipedia.org/wiki/Brad_Pitt'
}
[ResultTracker] ✓ exact_replay succeeded in 48669ms
[executeSkillStep] ✓ Strategy 1 succeeded
[executeSkillStep] Session info: {
  sessionId: '06b1d8d6-65a1-418f-8e7c-96062a839883',
  sessionUrl: 'https://www.browserbase.com/sessions/06b1d8d6-65a1-418f-8e7c-96062a839883',
  debugUrl: 'https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/06b1d8d6-65a1-418f-8e7c-96062a839883/devtools/page/6A3062BF840F6007182D3664BC1AB881?debug=true'
}
[executeSkillStep] Captured Stagehand history: 0 actions
[ResultTracker] Stagehand history captured: {
  totalActions: 0,
  counts: { act: 0, extract: 0, observe: 0, navigate: 0, agent: 0 }
}
[ResultTracker] Extracted data: {
  name: 'Brad Pitt',
  birthDate: 'December 18, 1963',
  occupation: [ 'Actor', 'film producer' ],
  awards: [
    'Academy Awards',
    'British Academy Film Awards',
    'Golden Globe Awards',
    'Primetime Emmy Awards',
    'Volpi Cup'
  ],
  spouse: [
    'Jennifer Aniston (m. 2000; div. 2005)',
    'Angelina Jolie (m. 2014; div. 2019)'
  ],
  children: 6,
  biography: "William Bradley Pitt (born December 18, 1963) is an American actor and film producer. In a film career spanning more than thirty years, Pitt has received numerous accolades, including two Academy Awards, two British Academy Film Awards, two Golden Globe Awards, two Primetime Emmy Awards and one Volpi Cup. His films as a leading actor have grossed over $7.5 billion worldwide. Pitt first gained recognition as a cowboy hitchhiker in the Ridley Scott road film Thelma & Louise (1991). Pitt emerged as a star taking on leading man roles in films such as the drama A River Runs Through It (1992), the western Legends of the Fall (1994), the horror film Interview with the Vampire (1994), the crime thriller Seven (1995), the cult film Fight Club (1999), and the crime comedy Snatch (2000). Pitt found greater commercial success starring in Steven Soderbergh's heist film Ocean's Eleven (2001), and reprised his role in its sequels. He cemented his leading man status starring in blockbusters such as the historical epic Troy (2004), the romantic crime film Mr. & Mrs. Smith (2005), the horror World War Z (2013), and the sports drama F1 (2025). Pitt won the Academy Award for Best Supporting Actor for playing a stuntman in Quentin Tarantino's Once Upon a Time in Hollywood (2019). He was Oscar-nominated for his roles in the science fiction drama 12 Monkeys (1995), the fantasy romance The Curious Case of Benjamin Button (2008) and the sports drama Moneyball (2011). He also starred in acclaimed films such as Babel (2006), The Assassination of Jesse James by the Coward Robert Ford (2007), Burn After Reading (2008), Inglourious Basterds (2009), The Tree of Life (2011), Fury (2014), The Big Short (2015), and Ad Astra (2019). In 2001, Pitt co-founded the production company Plan B Entertainment. As a producer, he won the Academy Award for Best Picture for 12 Years a Slave (2013) and was nominated for Moneyball (2011) and The Big Short (2015). One of the most influential celebrities, Pitt appeared on Forbes' annual Celebrity 100 list from 2006 to 2008, and the Time 100 list in 2007. Regarded as a sex symbol, Pitt was named People's Sexiest Man Alive in 1995 and 2000. Pitt's relationships have also been subject to widespread media attention, particularly his marriages to actresses Jennifer Aniston and Angelina Jolie, the latter of whom he shares six children with.",
  url: 'https://en.wikipedia.org/wiki/Brad_Pitt'
}
[ResultTracker] Validation: { valid: true, errors: [] }

========== EXECUTION SUMMARY ==========
Execution ID: exec_1765858187651_c4r2j4r5t
Skill: Skill: Search Wikipedia for %topic% and extract informati
Variables: { topic: 'Brad Pitt' }

--- Strategy Attempts ---
1. exact_replay: ✓ SUCCESS (48669ms)
   Details: { actionsCompleted: 4, extractionAttempted: true }

--- Final Result ---
Success: true
Final Strategy: exact_replay
Total Time: 48669 ms
Tokens Used: 105640

--- Extraction ---
Data Extracted: YES
Extracted Fields: 8
Non-empty Fields: [
  'name',
  'birthDate',
  'occupation',
  'awards',
  'spouse',
  'children',
  'biography',
  'url'
]

--- Validation ---
Valid: true

--- Session ---
Session URL: https://www.browserbase.com/sessions/06b1d8d6-65a1-418f-8e7c-96062a839883
Debug URL: https://www.browserbase.com/devtools/inspector.html?wss=connect.browserbase.com/debug/06b1d8d6-65a1-418f-8e7c-96062a839883/devtools/page/6A3062BF840F6007182D3664BC1AB881?debug=true
=======================================

[ResultTracker] Saved to MongoDB: {
  executionId: 'exec_1765858187651_c4r2j4r5t',
  success: true,
  strategy: 'exact_replay',
  validationValid: true
}
[2025-12-16T04:10:45.184Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
[2025-12-16T04:10:45.184Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
[2025-12-16T04:10:45.273Z] ERROR: Browserbase session status: COMPLETED
 GET /?auth=required 200 in 17ms (compile: 8ms, render: 9ms)