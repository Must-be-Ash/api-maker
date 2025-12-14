import { start } from 'workflow/api';
import { finishRecording } from '@/workflows/finish-recording';
import type { FinishRecordingInput } from '@/lib/types/skills';
import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/validate-session';
import { connectDB } from '@/lib/mongodb';

/**
 * POST /api/skills/finish-recording
 *
 * Finishes a recording session, validates the workflow, and creates a skill.
 *
 * REQUIRES AUTHENTICATION
 *
 * Request Headers:
 * - Authorization: Bearer <CDP_ACCESS_TOKEN> (required)
 *
 * Request Body:
 * - recordingId: string (required) - ID of the recording session
 * - sessionId: string (required) - Browserbase session ID
 *
 * Response:
 * - skillId: string - Unique ID for the created skill
 * - name: string - Name of the skill
 * - recordedActions: RecordedAction[] - Actions captured during recording
 * - stagehandWorkflow: StagehandAction[] - Converted workflow
 * - testResult: { success: boolean, error?: string }
 * - metrics: SkillMetrics
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
    const { recordingId, sessionId } = body;

    // Validate input
    if (!recordingId || typeof recordingId !== 'string') {
      return Response.json(
        { error: 'recordingId is required and must be a string' },
        { status: 400 }
      );
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return Response.json(
        { error: 'sessionId is required and must be a string' },
        { status: 400 }
      );
    }

    // AUTHORIZE: Verify user owns this recording session
    const db = await connectDB();
    const recording = await db.collection('recording_sessions').findOne({
      recordingId,
    });

    if (!recording) {
      return Response.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Check ownership (recording must have been started by this user)
    if (recording.creatorAddress && recording.creatorAddress.toLowerCase() !== session.evmAddress) {
      return Response.json(
        { error: 'Forbidden: You do not own this recording session' },
        { status: 403 }
      );
    }

    const input: FinishRecordingInput = {
      recordingId,
      sessionId,
      creatorAddress: session.evmAddress, // Use server-verified address
    };

    console.log('[POST /api/skills/finish-recording] Finishing recording workflow', input);

    // Finish the recording workflow
    const workflowResult = await start(finishRecording, [input]);

    // Get the result
    const result = await workflowResult.returnValue;

    console.log('[POST /api/skills/finish-recording] Skill created:', result.skillId);

    return Response.json(result);
  } catch (error) {
    console.error('[POST /api/skills/finish-recording] Error:', error);

    return Response.json(
      {
        error: 'Failed to finish recording',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
