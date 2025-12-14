
Dec 14 12:35:18.72
POST
---
dittod.vercel.app
/api/skills/finish-recording
2
(node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities. (Use `node --trace-deprecation ...` to show where the warning was created)
Dec 14 12:34:54.42
POST
200
api-maker-ghbse5hs1-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 12:34:44.66
POST
200
api-maker-ghbse5hs1-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/step
14
[startRecordingStep] Recording session saved to database
Dec 14 12:34:43.68
POST
200
api-maker-ghbse5hs1-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 12:34:41.90
POST
200
dittod.vercel.app
/api/skills/start-recording
3
(node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities. (Use `node --trace-deprecation ...` to show where the warning was created)
Dec 14 12:34:36.65
GET
200
dittod.vercel.app
/skills
Dec 14 12:34:36.38
GET
200
dittod.vercel.app
/
Dec 14 12:34:36.38
GET
200
dittod.vercel.app
/
Dec 14 12:34:36.36
GET
200
dittod.vercel.app
/skills/skill_1765744328219_g98c7qpuw
Dec 14 12:34:36.28
GET
200
dittod.vercel.app
/skills/skill_1765702732859_agbkx2tu8
Dec 14 12:34:36.26
GET
---
dittod.vercel.app
/skills/skill_1765700327120_dvok2fg2b
Dec 14 12:34:36.26
GET
200
dittod.vercel.app
/skills/skill_1765700933737_3derya1ef
Dec 14 12:34:36.25
GET
200
dittod.vercel.app
/skills/skill_1765700006142_y3yhq0a25
Dec 14 12:34:36.24
GET
200
dittod.vercel.app
/skills/skill_1765653224044_2tf5sfnz5
Dec 14 12:34:36.15
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.99
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.99
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.99
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.99
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.97
GET
200
dittod.vercel.app
/skills/skill_1765650966976_ku5vv5rah
Dec 14 12:34:35.90
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.87
GET
---
dittod.vercel.app
/skills/skill_1765649178470_zbud9gukk
Dec 14 12:34:35.85
GET
200
dittod.vercel.app
/skills/skill_1765611450587_kfq953loo
Dec 14 12:34:35.76
GET
200
dittod.vercel.app
/
Dec 14 12:34:35.75
GET
200
dittod.vercel.app
/skills/skill_1765744328219_g98c7qpuw
Dec 14 12:34:35.69
GET
200
dittod.vercel.app
/skills/record
Dec 14 12:34:35.59
GET
200
dittod.vercel.app
/skills/skill_1765702732859_agbkx2tu8
Dec 14 12:34:35.47
GET
200
dittod.vercel.app
/skills/skill_1765700933737_3derya1ef
Dec 14 12:34:35.34
GET
200
dittod.vercel.app
/skills/skill_1765700327120_dvok2fg2b
Dec 14 12:34:35.21
GET
200
dittod.vercel.app
/skills/skill_1765700006142_y3yhq0a25
Dec 14 12:34:34.84
GET
200
dittod.vercel.app
/skills/skill_1765649178470_zbud9gukk
Dec 14 12:34:34.84
GET
200
dittod.vercel.app
/skills/skill_1765653224044_2tf5sfnz5
Dec 14 12:34:34.84
GET
200
dittod.vercel.app
/skills/skill_1765650966976_ku5vv5rah
Dec 14 12:34:34.84
GET
200
dittod.vercel.app
/skills/skill_1765611450587_kfq953loo
Dec 14 12:34:34.18
GET
200
dittod.vercel.app
/skills
Dec 14 12:34:33.72
GET
200
dittod.vercel.app
/skills
Dec 14 12:34:30.61
GET
200
dittod.vercel.app
/

details:
2025-12-14 20:35:40.777 [info] [POST /api/skills/finish-recording] Skill created: skill_1765744538825_s49m64ewr
2025-12-14 20:35:19.206 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2025-12-14 20:35:20.282 [info] [POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765744485503_s8b3dd38s',
  sessionId: 'de534469-2580-4c15-adba-b01be2f90f14',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 20:35:33.065 [info] [Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: "Main answer or featured snippet text about Brad Pitt's age"
    },
    {
      name: 'source',
      type: 'string',
      description: 'Source or title of where the result came from',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the page with the result',
      optional: true
    }
  ],
  instruction: "Extract the main answer about Brad Pitt's age from the search results.",
  description: "Extracts the main search result and relevant details about Brad Pitt's age from Google search."
}
2025-12-14 20:35:33.065 [info] [finishRecordingStep] Generated extraction schema: {
  fields: 3,
  instruction: "Extract the main answer about Brad Pitt's age from the search results.",
  withContext: true
}
2025-12-14 20:35:33.067 [info] [finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 1 }
2025-12-14 20:35:38.826 [info] [finishRecordingStep] Validation session closed successfully
2025-12-14 20:35:38.895 [info] [finishRecordingStep] Skill saved to database: skill_1765744538825_s49m64ewr
2025-12-14 20:35:31.593 [info] [finishRecordingStep] Released Browserbase session
2025-12-14 20:35:31.593 [info] [finishRecordingStep] Extracted semantic values: []
2025-12-14 20:35:31.593 [info] [finishRecordingStep] Applied variable mapping to 0 actions
2025-12-14 20:35:31.593 [info] [finishRecordingStep] Prepended initial navigation to: https://www.google.com/
2025-12-14 20:35:31.594 [info] [filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
2025-12-14 20:35:31.594 [info] [finishRecordingStep] Filtered actions: { before: 1, after: 1, removed: 0 }
2025-12-14 20:35:31.594 [info] [Schema Generator] Analysis: {
  goal: 'google search',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
2025-12-14 20:35:21.573 [info] [finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765744485503_s8b3dd38s',
  sessionId: 'de534469-2580-4c15-adba-b01be2f90f14',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 20:35:22.474 [info] [finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765744485503_s8b3dd38s', actionsCount: 0 }
2025-12-14 20:35:22.474 [info] [finishRecordingStep] Active recorder not found in global (serverless mode)
2025-12-14 20:35:22.474 [info] [finishRecordingStep] Attempting to reconnect to Browserbase session and retrieve actions...
2025-12-14 20:35:23.116 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  enable debug logging with { debug: true }
2025-12-14 20:35:23.116 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: ⚙️  load multiple .env files with { path: ['.env.local', '.env'] }
2025-12-14 20:35:25.351 [info] [finishRecordingStep] Reconnected to Browserbase session
2025-12-14 20:35:25.624 [info] [finishRecordingStep] Retrieved 0 actions from browser
2025-12-14 20:35:25.897 [info] [finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=brad+pitts+age&sca_esv=a0bb12506671175f&source=hp&ei=ax8_aYbMJvbK0PEPtqOnqQs&iflsig=AOw8s4IAAAAAaT8te6EqmWhC1NaO1i8XEVRrFhh6Xv94&ved=0ahUKEwjGrcDp9r2RAxV2JTQIHbbRKbUQ4dUDCBY&uact=5&oq=brad+pitts+age&gs_lp=Egdnd3Mtd2l6Ig5icmFkIHBpdHRzIGFnZTIJEAAYgAQYChgLMgkQABiABBgKGAsyCRAAGIAEGAoYCzIJEAAYgAQYChgLMgkQABiABBgKGAsyCBAAGBYYChgeMggQABgWGAoYHjIIEAAYFhgKGB4yCBAAGBYYChgeMggQABgWGAoYHkidVVDgEFjdSXABeACQAQCYAVigAecHqgECMTS4AQPIAQD4AQGYAg-gAucIqAIKwgIKEAAYAxjqAhiPAcICDhAuGIAEGLEDGIMBGIoFwgIREC4YgAQYsQMY0QMYgwEYxwHCAgsQABiABBixAxiDAcICCxAuGIAEGLEDGIMBwgIEEAAYA8ICCBAAGIAEGLEDwgILEC4YgAQY0QMYxwHCAg4QLhiABBixAxjRAxjHAcICDhAAGIAEGLEDGIoFGI0GwgIIEC4YgAQYsQPCAg4QABiABBixAxiDARiKBcICBRAuGIAEwgILEC4YgAQYxwEYrwHCAgUQABiABMICBxAAGIAEGAqYAwrxBc0SXAmOENb3kgcEMTQuMaAHqqsBsgcEMTMuMbgH3QjCBwYyLTExLjTIB2SACAA&sclient=gws-wiz&sei=fh8_adX0DOiz0PEPkrWWqQM',
  title: 'brad pitts age - Google Search',
  headingCount: 5
}
2025-12-14 20:35:25.898 [info] [Schema Generator] Analysis: {
  goal: 'google search',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
2025-12-14 20:35:27.843 [info] [Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: "Main answer or featured snippet text about Brad Pitt's age"
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the search result page',
      optional: true
    },
    {
      name: 'snippet',
      type: 'string',
      description: 'Text snippet or description from the search result',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the search result page',
      optional: true
    }
  ],
  instruction: "Extract the main answer about Brad Pitt's age from the search results",
  description: "Extracts the main search result and relevant details about Brad Pitt's age from Google Search"
}
2025-12-14 20:35:27.844 [info] [finishRecordingStep] Generated test schema: {
  fields: 4,
  instruction: "Extract the main answer about Brad Pitt's age from the search results"
}
2025-12-14 20:35:30.983 [info] [finishRecordingStep] ✅ Extraction test PASSED
2025-12-14 20:35:37.484 [info] [finishRecordingStep] Workflow validation successful
2025-12-14 20:35:35.699 [info] [finishRecordingStep] Validating workflow by replaying
2025-12-14 20:35:35.699 [info] [replayWorkflow] Executing action: navigate Navigate to https://www.google.com/

2025-12-14 20:35:40.777 [info] [POST /api/skills/finish-recording] Skill created: skill_1765744538825_s49m64ewr
2025-12-14 20:35:19.206 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2025-12-14 20:35:20.282 [info] [POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765744485503_s8b3dd38s',
  sessionId: 'de534469-2580-4c15-adba-b01be2f90f14',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}

2025-12-14 20:34:45.503 [info] [startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 20:34:45.503 [info] [startRecordingStep] Creating Browserbase session
2025-12-14 20:34:51.168 [info] [startRecordingStep] Stagehand initialized
2025-12-14 20:34:52.556 [info] [startRecordingStep] Navigated to start URL: https://www.google.com/
2025-12-14 20:34:52.559 [info] [ActionRecorder] Starting recording
2025-12-14 20:34:53.070 [info] [ActionRecorder] Initial URL: https://www.google.com/
2025-12-14 20:34:53.071 [info] [ActionRecorder] Started recording
2025-12-14 20:34:53.071 [info] [startRecordingStep] Action recorder started
2025-12-14 20:34:54.028 [info] [startRecordingStep] Recording session saved to database
2025-12-14 20:34:45.878 [info] [startRecordingStep] Browserbase response: {
  id: 'de534469-2580-4c15-adba-b01be2f90f14',
  createdAt: '2025-12-14T20:34:45.825452+00:00',
  updatedAt: '2025-12-14T20:34:45.825452+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T20:34:45.815+00:00',
  expiresAt: '2025-12-14T20:39:45.815+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.VmkIpLa0pVR9ZPV1BQXhBgLRyZprUU0rJ6KdqCx_iKyd7S6mLZBPeQ.WYmCyLprfnm0Suix.AHyReWJoziKhj3aZLbtL5l6kFYWM3IOhrmWlV-dfRYNYDVHMIAvKHqskxvb0dFkAqBYIfiqt933G8oPDOyujFs_c_Sa29DZniAFcsbznuupSK6tBqUncihDisa6ouRUu2t2Keh14388NOOMak4dF2VRU_wPZCYWztSgyND1u6VxEI8gZe6FHGe_sbTxpPGSF2tOZpJQfytIe6HfNH8aovZDstG-hlYgw1X9q8kMHUZMKzH22U6pQ5o8frXutKtpDPLTOW7cCW4uIGVqNub9PuCmXpoGH67bw7ZhDEtzs4ktYcNv59-AYNwpQ1sXQR-tXLmYPMtrdp8E4sejjR24y6gR1cyxfnnJRWn5QPRym1Xc32PORjKCCxNps2IaaK2PY-CNgOkhXm5Be8ROrnBSN4dS6ErcZTb6mkwGVK1z4DmfXdQwRzBwg23hNR2_QC-8r.ahl30_zh13bVog6yZSZwhA',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.VmkIpLa0pVR9ZPV1BQXhBgLRyZprUU0rJ6KdqCx_iKyd7S6mLZBPeQ.WYmCyLprfnm0Suix.AHyReWJoziKhj3aZLbtL5l6kFYWM3IOhrmWlV-dfRYNYDVHMIAvKHqskxvb0dFkAqBYIfiqt933G8oPDOyujFs_c_Sa29DZniAFcsbznuupSK6tBqUncihDisa6ouRUu2t2Keh14388NOOMak4dF2VRU_wPZCYWztSgyND1u6VxEI8gZe6FHGe_sbTxpPGSF2tOZpJQfytIe6HfNH8aovZDstG-hlYgw1X9q8kMHUZMKzH22U6pQ5o8frXutKtpDPLTOW7cCW4uIGVqNub9PuCmXpoGH67bw7ZhDEtzs4ktYcNv59-AYNwpQ1sXQR-tXLmYPMtrdp8E4sejjR24y6gR1cyxfnnJRWn5QPRym1Xc32PORjKCCxNps2IaaK2PY-CNgOkhXm5Be8ROrnBSN4dS6ErcZTb6mkwGVK1z4DmfXdQwRzBwg23hNR2_QC-8r.ahl30_zh13bVog6yZSZwhA'
}
2025-12-14 20:34:45.878 [info] [startRecordingStep] Browserbase session created: de534469-2580-4c15-adba-b01be2f90f14
2025-12-14 20:34:47.934 [info] [startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/de534469-2580-4c15-adba-b01be2f90f14/devtools/page/DA7ED07EA2D56936142145B6C3005B1E?debug=true
2025-12-14 20:34:48.863 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: 🛠️  run anywhere with `dotenvx run -- yourcommand`
2025-12-14 20:34:48.863 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: 🔐 encrypt with Dotenvx: https://dotenvx.com

2025-12-14 20:34:42.708 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2025-12-14 20:34:42.852 [info] [POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 20:34:55.328 [info] [POST /api/skills/start-recording] Recording started: rec_1765744485503_s8b3dd38s