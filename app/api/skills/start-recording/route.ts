import { start } from 'workflow/api';
import { startRecording } from '@/workflows/start-recording';
import type { StartRecordingInput } from '@/lib/types/skills';
import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/validate-session';

/**
 * POST /api/skills/start-recording
 *
 * Starts a new skill recording session.
 * Creates a Browserbase session with Live View for manual demonstration.
 *
 * REQUIRES AUTHENTICATION
 *
 * Request Headers:
 * - Authorization: Bearer <CDP_ACCESS_TOKEN> (required)
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
    // AUTHENTICATE USER
    const session = await validateSession(request);

    if (!session.isAuthenticated) {
      return Response.json(
        { error: 'Unauthorized', message: session.error },
        { status: 401 }
      );
    }

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
      creatorAddress: session.evmAddress, // SERVER-VERIFIED ADDRESS
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
