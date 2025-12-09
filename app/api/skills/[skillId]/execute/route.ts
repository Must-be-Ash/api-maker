import { start } from 'workflow/api';
import { executeSkill } from '@/workflows/execute-skill';
import { connectDB } from '@/lib/mongodb';
import type { ExecuteSkillInput } from '@/lib/types/skills';
import { NextRequest } from 'next/server';

/**
 * POST /api/skills/[skillId]/execute
 *
 * Executes a skill using the triple replay strategy.
 *
 * Request Body:
 * - variables: Record<string, any> (optional) - Variables to substitute in the workflow
 *
 * Response:
 * - success: boolean
 * - data: any - Result data from the execution
 * - strategy: 'exact_replay' | 'natural_language' | 'ai_relearn'
 * - executionTime: number - Duration in milliseconds
 * - tokensUsed: number - LLM tokens used
 * - sessionId: string - Browserbase session ID
 * - sessionUrl: string - URL to view session replay
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params;

    // Validate skillId
    if (!skillId || typeof skillId !== 'string') {
      return Response.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { variables } = body;

    const input: ExecuteSkillInput = {
      skillId,
      variables,
    };

    console.log('[POST /api/skills/[skillId]/execute] Executing skill', input);

    // Execute the skill workflow
    const workflowResult = await start(executeSkill, [input]);

    // Get the result
    const result = await workflowResult.returnValue;

    console.log('[POST /api/skills/[skillId]/execute] Skill executed:', {
      skillId,
      strategy: result.strategy,
      success: result.success,
    });

    // Log execution for analytics
    const db = await connectDB();
    await db.collection('skill_executions').insertOne({
      executionId: workflowResult.runId,
      skillId,
      variables,
      ...result,
      createdAt: new Date().toISOString(),
    });

    return Response.json(result);
  } catch (error) {
    console.error('[POST /api/skills/[skillId]/execute] Error:', error);

    return Response.json(
      {
        error: 'Failed to execute skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
