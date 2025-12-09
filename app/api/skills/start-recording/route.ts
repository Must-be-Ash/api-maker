import { start } from 'workflow/api';
import { startRecording } from '@/workflows/start-recording';
import type { StartRecordingInput } from '@/lib/types/skills';
import { NextRequest } from 'next/server';

/**
 * POST /api/skills/start-recording
 *
 * Starts a new skill recording session.
 * Creates a Browserbase session with Live View for manual demonstration.
 *
 * Request Body:
 * - goal: string (required) - What the user wants to automate
 * - startUrl: string (optional) - Starting URL for the browser
 *
 * Response:
 * - recordingId: string - Unique ID for this recording session
 * - sessionId: string - Browserbase session ID
 * - liveViewUrl: string - URL to access the Live View
 * - status: 'recording'
 * - message: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, startUrl } = body;

    // Validate input
    if (!goal || typeof goal !== 'string') {
      return Response.json(
        { error: 'Goal is required and must be a string' },
        { status: 400 }
      );
    }

    const input: StartRecordingInput = {
      goal,
      startUrl,
    };

    console.log('[POST /api/skills/start-recording] Starting recording workflow', input);

    // Start the recording workflow
    const workflowResult = await start(startRecording, [input]);

    // Get the result
    const result = await workflowResult.returnValue;

    console.log('[POST /api/skills/start-recording] Recording started:', result.recordingId);

    return Response.json(result);
  } catch (error) {
    console.error('[POST /api/skills/start-recording] Error:', error);

    return Response.json(
      {
        error: 'Failed to start recording',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
