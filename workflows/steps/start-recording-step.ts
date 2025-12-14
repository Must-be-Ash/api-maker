import type { StartRecordingInput, StartRecordingOutput } from "@/lib/types/skills";

/**
 * Start Recording Step
 *
 * Creates a Browserbase session with Live View for manual user demonstration.
 * Attaches action recorder to capture user actions in real-time.
 */
export async function startRecordingStep(input: StartRecordingInput): Promise<StartRecordingOutput> {
  "use step";

  console.log('[startRecordingStep] Starting recording', input);

  // Generate recording ID
  const recordingId = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

  console.log('[startRecordingStep] Creating Browserbase session');

  // Create Browserbase session using fetch API
  const sessionResponse = await fetch('https://api.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'x-bb-api-key': process.env.BROWSERBASE_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: process.env.BROWSERBASE_PROJECT_ID,
      keepAlive: true, // Enable keep-alive for long-running recording sessions
      browserSettings: {
        recordSession: true,
        logSession: true,
      },
    }),
  });

  if (!sessionResponse.ok) {
    const errorText = await sessionResponse.text();
    console.error('[startRecordingStep] Browserbase API error:', {
      status: sessionResponse.status,
      statusText: sessionResponse.statusText,
      body: errorText,
    });
    throw new Error(`Browserbase API error (${sessionResponse.status}): ${errorText}`);
  }

  const sessionData = await sessionResponse.json();
  console.log('[startRecordingStep] Browserbase response:', sessionData);

  const sessionId = sessionData.id;

  if (!sessionId) {
    console.error('[startRecordingStep] No session ID in response:', sessionData);
    throw new Error('Browserbase did not return a session ID');
  }

  console.log('[startRecordingStep] Browserbase session created:', sessionId);

  // Get Live View debug URL
  const debugResponse = await fetch(
    `https://api.browserbase.com/v1/sessions/${sessionId}/debug`,
    {
      method: 'GET',
      headers: {
        'x-bb-api-key': process.env.BROWSERBASE_API_KEY!,
      },
    }
  );

  const debugData = await debugResponse.json();
  const liveViewUrl = debugData.debuggerFullscreenUrl || `https://www.browserbase.com/sessions/${sessionId}`;

  console.log('[startRecordingStep] Live View URL:', liveViewUrl);

  // Dynamically import Stagehand (prevents bundling server-only code)
  const { Stagehand } = await import("@browserbasehq/stagehand");

  // Initialize Stagehand with Browserbase session
  const stagehand = new Stagehand({
    env: "BROWSERBASE",
    apiKey: process.env.BROWSERBASE_API_KEY,
    projectId: process.env.BROWSERBASE_PROJECT_ID,
    verbose: 0, // Errors only
    disablePino: true, // Disable pino logger (prevents pino-pretty error in Vercel)
    browserbaseSessionID: sessionId,
    model: "openai/gpt-4o", // Use OpenAI GPT-4o for AI operations (v3 API)
  });

  await stagehand.init();
  const context = stagehand.context;
  const page = stagehand.context.pages()[0];

  console.log('[startRecordingStep] Stagehand initialized');

  // Navigate to start URL if provided
  if (input.startUrl) {
    await page.goto(input.startUrl, {
      waitUntil: 'domcontentloaded',
      timeoutMs: 15000,
    });
    console.log('[startRecordingStep] Navigated to start URL:', input.startUrl);
  }

  // Dynamically import ActionRecorder (prevents bundling server-only code)
  const { ActionRecorder } = await import("@/lib/capture/action-recorder");

  // Attach action recorder with context for addInitScript support
  const recorder = new ActionRecorder(page, recordingId, context);

  try {
    await recorder.startRecording();
    console.log('[startRecordingStep] ✅ Action recorder started with event listeners verified');
  } catch (error) {
    console.error('[startRecordingStep] ❌ Failed to start action recorder:', error);
    throw new Error(`Action recording initialization failed: ${error}`);
  }

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
    creatorAddress: input.creatorAddress || null, // Server-verified wallet address
    recordedActions: [],
    status: 'recording',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log('[startRecordingStep] Recording session saved to database');

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
