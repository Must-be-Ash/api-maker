Dec 14 13:16:11.29
GET
200
dittod.vercel.app
/api/skills/skill_1765746969085_8sjm581ho
[GET /api/skills/[skillId]] Fetching skill: skill_1765746969085_8sjm581ho
Dec 14 13:16:10.81
GET
200
dittod.vercel.app
/skills/skill_1765746969085_8sjm581ho
Dec 14 13:16:09.55
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 13:15:37.93
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/step
34
[2025-12-14T21:15:52.621Z] ERROR: Browserbase session status: COMPLETED
Dec 14 13:15:37.42
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 13:15:35.57
POST
200
dittod.vercel.app
/api/skills/finish-recording
3
(node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities. (Use `node --trace-deprecation ...` to show where the warning was created)
Dec 14 13:15:14.12
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 13:15:03.27
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/step
20
[startRecordingStep] Recording session saved to database
Dec 14 13:15:02.27
POST
200
api-maker-7t6ns1ic8-arashnouruzi-yahoocoms-projects.vercel.app
/.well-known/workflow/v1/flow
Dec 14 13:15:00.51
POST
200
dittod.vercel.app
/api/skills/start-recording
3
(node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities. (Use `node --trace-deprecation ...` to show where the warning was created)
Dec 14 13:14:55.66
GET
200
dittod.vercel.app
/skills

2025-12-14 21:16:11.534 [info] [GET /api/skills/[skillId]] Fetching skill: skill_1765746969085_8sjm581ho

2025-12-14 21:16:03.116 [info] [Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main answer or result text extracted from the page'
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
  instruction: 'Extract the main answer and relevant details from the search results page.',
  description: 'Extracts main search result and relevant details from Google search.'
}
2025-12-14 21:16:03.116 [info] [finishRecordingStep] Generated extraction schema: {
  fields: 3,
  instruction: 'Extract the main answer and relevant details from the search results page.',
  withContext: true
}
2025-12-14 21:16:03.116 [info] [finishRecordingStep] Converted to Stagehand workflow: { workflowSteps: 1 }
2025-12-14 21:15:51.723 [info] [finishRecordingStep] ✅ Extraction test PASSED
2025-12-14 21:15:52.369 [error] [2025-12-14T21:15:52.368Z] ERROR: initiating shutdown → CDP transport closed: socket-close code=1006 reason=
2025-12-14 21:15:52.369 [error] [2025-12-14T21:15:52.368Z] ERROR: closing resources → CDP transport closed: socket-close code=1006 reason=
2025-12-14 21:15:52.622 [error] [2025-12-14T21:15:52.621Z] ERROR: Browserbase session status: COMPLETED
2025-12-14 21:16:01.725 [info] [finishRecordingStep] Session close timed out after 10s, continuing anyway
2025-12-14 21:16:01.725 [info] [finishRecordingStep] Extracted semantic values: []
2025-12-14 21:16:01.725 [info] [finishRecordingStep] Applied variable mapping to 0 actions
2025-12-14 21:16:01.725 [info] [finishRecordingStep] Prepended initial navigation to: https://www.google.com/
2025-12-14 21:16:01.726 [info] [filterRedundantNavigations] Keeping initial navigation: https://www.google.com/
2025-12-14 21:16:01.726 [info] [finishRecordingStep] Filtered actions: { before: 1, after: 1, removed: 0 }
2025-12-14 21:16:01.726 [info] [Schema Generator] Analysis: {
  goal: 'google search',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
2025-12-14 21:15:38.588 [info] [finishRecordingStep] Finishing recording {
  recordingId: 'rec_1765746904123_a29alnh7w',
  sessionId: 'b3d45af2-ed76-4843-b01f-d2ee21c4496d',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 21:15:39.488 [info] [finishRecordingStep] Loaded recording session: { recordingId: 'rec_1765746904123_a29alnh7w', actionsCount: 0 }
2025-12-14 21:15:39.488 [info] [finishRecordingStep] Active recorder not found in global (serverless mode)
2025-12-14 21:15:39.488 [info] [finishRecordingStep] Attempting to reconnect to Browserbase session and retrieve actions...
2025-12-14 21:15:40.126 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
2025-12-14 21:15:40.126 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: 👥 sync secrets across teammates & machines: https://dotenvx.com/ops
2025-12-14 21:15:42.300 [info] [finishRecordingStep] Reconnected to Browserbase session
2025-12-14 21:16:09.086 [info] [finishRecordingStep] Validation session closed successfully
2025-12-14 21:16:09.155 [info] [finishRecordingStep] Skill saved to database: skill_1765746969085_8sjm581ho
2025-12-14 21:16:05.861 [info] [finishRecordingStep] Validating workflow by replaying
2025-12-14 21:16:05.861 [info] [replayWorkflow] Executing action: navigate Navigate to https://www.google.com/
2025-12-14 21:16:07.767 [info] [finishRecordingStep] Workflow validation successful
2025-12-14 21:15:42.571 [info] [finishRecordingStep] Retrieved 0 actions from browser
2025-12-14 21:15:42.571 [warning] [finishRecordingStep] ⚠️ WARNING: No actions captured during recording!
2025-12-14 21:15:42.571 [warning] [finishRecordingStep] This likely means event listener injection failed in start-recording step.
2025-12-14 21:15:42.571 [warning] [finishRecordingStep] Check start-recording logs for injection errors.
2025-12-14 21:15:42.842 [info] [finishRecordingStep] Captured page context: {
  url: 'https://www.google.com/search?q=how+old+is+brad+pitt%3F&sca_esv=4063a013568e4ff8&source=hp&ei=3ig_af73KbCm0PEP_qOeYQ&iflsig=AOw8s4IAAAAAaT827rO7Rjz7EcP9DfPMxf7VSp58Pl0I&ved=0ahUKEwj-3v_q_72RAxUwEzQIHf6RJwwQ4dUDCBY&oq=how+old+is+brad+pitt%3F&gs_lp=Egdnd3Mtd2l6IhVob3cgb2xkIGlzIGJyYWQgcGl0dD8yBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAEMgUQABiABDIFEAAYgAQyBRAAGIAESNg9UNIDWIgycAF4AJABAJgBa6AB8AqqAQQxOS4yuAEMyAEA-AEBmAIWoAKODKgCCsICChAAGAMY6gIYjwHCAgoQLhgDGOoCGI8BwgIOEC4YgAQYsQMY0QMYxwHCAg4QABiABBixAxiDARiKBcICDhAAGIAEGLEDGIoFGI0GwgIIEAAYgAQYsQPCAhEQLhiABBixAxiDARiKBRiNBsICDhAuGIAEGLEDGIMBGIoFwgILEAAYgAQYsQMYgwHCAgsQLhiABBixAxiDAcICCxAuGIAEGNEDGMcBwgIREC4YgAQYsQMY0QMYgwEYxwHCAggQLhiABBixA8ICERAAGIAEGLEDGIMBGIoFGI0GwgIEEAAYA5gDDPEF-z6L4k1fpaKSBwQyMC4yoAf6lwGyBwQxOS4yuAeBDMIHBjItMTguNMgHfoAIAA&sclient=gws-wiz&sei=7ig_aea7HI3z0PEPqY6N-AY',
  title: 'how old is brad pitt? - Google Search',
  headingCount: 5
}
2025-12-14 21:15:42.843 [info] [Schema Generator] Analysis: {
  goal: 'google search',
  hasVariables: false,
  variables: [],
  contextProvided: true
}
2025-12-14 21:15:44.434 [info] [Schema Generator] Generated schema: {
  fields: [
    {
      name: 'result',
      type: 'string',
      description: 'Main answer or result text extracted from the page'
    },
    {
      name: 'title',
      type: 'string',
      description: 'Title of the result',
      optional: true
    },
    {
      name: 'snippet',
      type: 'string',
      description: 'Text snippet or description from the result',
      optional: true
    },
    {
      name: 'url',
      type: 'string',
      description: 'URL of the page with the result',
      optional: true
    }
  ],
  instruction: 'Extract search results based on the query',
  description: 'Extracts main search result and relevant details'
}
2025-12-14 21:15:44.434 [info] [finishRecordingStep] Generated test schema: { fields: 4, instruction: 'Extract search results based on the query' }

2025-12-14 21:16:10.760 [info] [POST /api/skills/finish-recording] Skill created: skill_1765746969085_8sjm581ho
2025-12-14 21:15:36.057 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2025-12-14 21:15:37.192 [info] [POST /api/skills/finish-recording] Finishing recording workflow {
  recordingId: 'rec_1765746904123_a29alnh7w',
  sessionId: 'b3d45af2-ed76-4843-b01f-d2ee21c4496d',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}

2025-12-14 21:15:10.135 [info] [startRecordingStep] Stagehand initialized
2025-12-14 21:15:11.627 [info] [startRecordingStep] Navigated to start URL: https://www.google.com/
2025-12-14 21:15:11.634 [info] [ActionRecorder] Starting recording
2025-12-14 21:15:11.634 [info] [ActionRecorder] Installing monitoring script (attempt 1/3)...
2025-12-14 21:15:11.634 [info] [ActionRecorder] Setting up addInitScript for future navigations
2025-12-14 21:15:11.911 [info] [ActionRecorder] Injecting script on current page
2025-12-14 21:15:12.500 [info] [ActionRecorder] ✅ Monitoring script installed successfully
2025-12-14 21:15:12.500 [info] [ActionRecorder] Event listeners will automatically persist across navigations
2025-12-14 21:15:12.775 [info] [ActionRecorder] Event listener installation verified
2025-12-14 21:15:12.775 [info] [ActionRecorder] Initial URL: https://www.google.com/
2025-12-14 21:15:12.775 [info] [ActionRecorder] ✅ Started recording with persistent event listeners
2025-12-14 21:15:12.776 [info] [startRecordingStep] ✅ Action recorder started with event listeners verified
2025-12-14 21:15:13.765 [info] [startRecordingStep] Recording session saved to database
2025-12-14 21:15:04.126 [info] [startRecordingStep] Starting recording {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 21:15:04.126 [info] [startRecordingStep] Creating Browserbase session
2025-12-14 21:15:04.532 [info] [startRecordingStep] Browserbase response: {
  id: 'b3d45af2-ed76-4843-b01f-d2ee21c4496d',
  createdAt: '2025-12-14T21:15:04.478296+00:00',
  updatedAt: '2025-12-14T21:15:04.478296+00:00',
  projectId: '26b0ffe0-6897-4cf1-a66c-3a927c7f9456',
  startedAt: '2025-12-14T21:15:04.468+00:00',
  expiresAt: '2025-12-14T21:20:04.468+00:00',
  status: 'RUNNING',
  proxyBytes: 0,
  keepAlive: true,
  region: 'us-west-2',
  connectUrl: 'wss://connect.usw2.browserbase.com?signingKey=eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.MeTg1JuFgSVWXgRhKqmh-RvzN93o5qrWpxmYRK-G3E2Bc_gm11P7hg._fdx6aQAa1BankMc.BNRXsBPeDrm_J81zOiyZkfZtgqIboSRrNWWQZqz2PHhKj0sN4EFnoKobX_6jFqKXinDr49bLoEriNXzBWh_W8itNPo2KwVTN6sQ4U2B590uF6MiiNwa8t9S_AEeSOk8TwIL0K38zjgMUrJlWhtS6FhFUZ-PszvBzT9rBcXnPemE4btwVE6siFJN6fE73Vsfn3Holq71bh2eEofRVr4DXd2yUS9sop4X791C4sFvhTjGQXkT87HWS6_VBedxY6JF77zD4v2fyszgcV8t6nnEEhTIzogdF-aG0GF6pezBl7wcp6CoayXy5MHwhtx35WZhFQ2FbKvBOHOcTGbn0N6J_D0Gc0Qxl4TzpyGnYL203evk_7dGFAqfoX7lZE2NVxs6k5mg-rc1H5yqEs-qHx0yskbyPUhcC0c2y7hQoqdrhsF3Yx-IhruhPAEIObUQVuLA5.Voj5xSUqiawmUpjufchDhQ',
  seleniumRemoteUrl: 'http://connect.usw2.browserbase.com/webdriver',
  signingKey: 'eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.MeTg1JuFgSVWXgRhKqmh-RvzN93o5qrWpxmYRK-G3E2Bc_gm11P7hg._fdx6aQAa1BankMc.BNRXsBPeDrm_J81zOiyZkfZtgqIboSRrNWWQZqz2PHhKj0sN4EFnoKobX_6jFqKXinDr49bLoEriNXzBWh_W8itNPo2KwVTN6sQ4U2B590uF6MiiNwa8t9S_AEeSOk8TwIL0K38zjgMUrJlWhtS6FhFUZ-PszvBzT9rBcXnPemE4btwVE6siFJN6fE73Vsfn3Holq71bh2eEofRVr4DXd2yUS9sop4X791C4sFvhTjGQXkT87HWS6_VBedxY6JF77zD4v2fyszgcV8t6nnEEhTIzogdF-aG0GF6pezBl7wcp6CoayXy5MHwhtx35WZhFQ2FbKvBOHOcTGbn0N6J_D0Gc0Qxl4TzpyGnYL203evk_7dGFAqfoX7lZE2NVxs6k5mg-rc1H5yqEs-qHx0yskbyPUhcC0c2y7hQoqdrhsF3Yx-IhruhPAEIObUQVuLA5.Voj5xSUqiawmUpjufchDhQ'
}
2025-12-14 21:15:04.532 [info] [startRecordingStep] Browserbase session created: b3d45af2-ed76-4843-b01f-d2ee21c4496d
2025-12-14 21:15:06.687 [info] [startRecordingStep] Live View URL: https://www.browserbase.com/devtools-fullscreen/inspector.html?wss=connect.browserbase.com/debug/b3d45af2-ed76-4843-b01f-d2ee21c4496d/devtools/page/18634469B7B197D297166F413BC77A52?debug=true
2025-12-14 21:15:07.661 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops
2025-12-14 21:15:07.661 [info] [dotenv@17.2.3] injecting env (0) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops

2025-12-14 21:15:01.265 [error] (node:4) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
2025-12-14 21:15:01.364 [info] [POST /api/skills/start-recording] Starting recording workflow {
  goal: 'google search',
  startUrl: 'https://www.google.com/',
  creatorAddress: '0x08bfec5133141cc704a34505d5e504503bf3168d'
}
2025-12-14 21:15:14.922 [info] [POST /api/skills/start-recording] Recording started: rec_1765746904123_a29alnh7w