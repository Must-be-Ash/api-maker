import { start } from 'workflow/api';
import { finishRecording } from '@/workflows/finish-recording';
import type { FinishRecordingInput } from '@/lib/types/skills';
import { NextRequest } from 'next/server';

/**
 * POST /api/skills/finish-recording
 *
 * Finishes a recording session, validates the workflow, and creates a skill.
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

    const input: FinishRecordingInput = {
      recordingId,
      sessionId,
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
