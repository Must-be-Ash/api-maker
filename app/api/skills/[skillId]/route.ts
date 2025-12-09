import { connectDB } from '@/lib/mongodb';
import { NextRequest } from 'next/server';

/**
 * GET /api/skills/[skillId]
 *
 * Retrieves a skill by ID.
 *
 * Response:
 * - Skill object with all details
 */
export async function GET(
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

    console.log('[GET /api/skills/[skillId]] Fetching skill:', skillId);

    // Fetch skill from MongoDB
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Remove MongoDB _id field
    const { _id, ...skillData } = skill;

    return Response.json(skillData);
  } catch (error) {
    console.error('[GET /api/skills/[skillId]] Error:', error);

    return Response.json(
      {
        error: 'Failed to fetch skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
