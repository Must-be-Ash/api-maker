import type { StartRecordingInput, StartRecordingOutput } from "@/lib/types/skills";

/**
 * Start Recording Workflow
 *
 * Creates a Browserbase session with Live View for manual user demonstration.
 * Attaches action recorder to capture user actions in real-time.
 */
export async function startRecording(input: StartRecordingInput): Promise<StartRecordingOutput> {
  "use workflow";

  console.log('[startRecording] Starting recording workflow', input);

  // Generate recording ID
  const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  console.log('[startRecording] Creating Browserbase session');

  // Create Browserbase session using fetch API
  const sessionResponse = await fetch('https://www.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'x-bb-api-key': process.env.BROWSERBASE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      browserSettings: {
        recordSession: true,
        logSession: true,
      },
    }),
  });

  const sessionData = await sessionResponse.json();
  const sessionId = sessionData.id;

  console.log('[startRecording] Browserbase session created:', sessionId);

  // Get Live View debug URL
  const debugResponse = await fetch(
    `https://www.browserbase.com/v1/sessions/${sessionId}/debug`,
    {
      method: 'GET',
      headers: {
        'x-bb-api-key': process.env.BROWSERBASE_API_KEY!,
      },
    }
  );

  const debugData = await debugResponse.json();
  const liveViewUrl = debugData.debuggerFullscreenUrl || `https://www.browserbase.com/sessions/${sessionId}`;

  console.log('[startRecording] Live View URL:', liveViewUrl);

  // Dynamically import Stagehand (prevents bundling server-only code)
  const { Stagehand } = await import("@browserbasehq/stagehand");

  // Initialize Stagehand with Browserbase session
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    verbose: 1,
    browserbaseSessionID: sessionId,
  });

  await stagehand.init();
  const page = stagehand.context.pages()[0];

  console.log('[startRecording] Stagehand initialized');

  // Navigate to start URL if provided
  if (input.startUrl) {
    await page.goto(input.startUrl, {
      waitUntil: 'domcontentloaded',
      timeoutMs: 15000,
    });
    console.log('[startRecording] Navigated to start URL:', input.startUrl);
  }

  // Dynamically import ActionRecorder (prevents bundling server-only code)
  const { ActionRecorder } = await import("@/lib/capture/action-recorder");

  // Attach action recorder
  const recorder = new ActionRecorder(page, recordingId);
  await recorder.startRecording();

  console.log('[startRecording] Action recorder started');

  // Dynamically import MongoDB helper
  const { connectDB } = await import("@/lib/mongodb");

  // Store recording session in MongoDB
  const db = await connectDB();
  await db.collection('recording_sessions').insertOne({
    recordingId,
    sessionId,
    liveViewUrl,
    goal: input.goal,
    startUrl: input.startUrl,
    recordedActions: [],
    status: 'recording',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('[startRecording] Recording session saved to database');

  // Store recorder instance globally for later cleanup
  (global as any).activeRecorders = (global as any).activeRecorders || {};
  (global as any).activeRecorders[recordingId] = {
    recorder,
    stagehand,
    sessionId,
  };

  return {
    recordingId,
    sessionId,
    liveViewUrl,
    status: 'recording',
    message: 'Live View ready. User should perform the task manually.',
  };
}
