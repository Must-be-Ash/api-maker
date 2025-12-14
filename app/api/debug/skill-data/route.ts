import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

/**
 * DEBUG ENDPOINT - DISABLED IN PRODUCTION
 * This endpoint exposes skill internal structure for debugging purposes.
 * Only available in development environment.
 */
export async function GET(request: NextRequest) {
  // SECURITY: Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  const skillId = request.nextUrl.searchParams.get('skillId') || 'skill_1765315026786_lcr498kum';

  try {
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    const analysis = {
      skillId: skill.skillId,
      goal: skill.goal,
      startUrl: skill.startUrl,
      fields: {
        recordedActions: {
          exists: !!skill.recordedActions,
          count: skill.recordedActions?.length || 0,
          sample: skill.recordedActions?.slice(0, 2) || [],
        },
        stagehandWorkflow: {
          exists: !!skill.stagehandWorkflow,
          count: skill.stagehandWorkflow?.length || 0,
          sample: skill.stagehandWorkflow?.slice(0, 2) || [],
        },
        history: {
          exists: !!skill.history,
          count: skill.history?.length || 0,
        },
      },
      allFieldNames: Object.keys(skill),
      diagnosis: {
        strategy1Ready: !!(skill.recordedActions && skill.recordedActions.length > 0),
        strategy2Ready: !!(skill.stagehandWorkflow && skill.stagehandWorkflow.length > 0),
        strategy3Ready: !!(skill.goal && skill.startUrl),
      }
    };

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error('[GET /api/debug/skill-data] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
