import { connectDB } from '@/lib/mongodb';
import { NextRequest } from 'next/server';
import { validateSession } from '@/lib/auth/validate-session';
import { checkSkillOwnership } from '@/lib/auth/check-ownership';

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

/**
 * PATCH /api/skills/[skillId]
 *
 * Updates a skill's properties (e.g., name, price).
 * Only the skill creator can edit the skill.
 *
 * REQUIRES AUTHENTICATION
 *
 * Request Headers:
 * - Authorization: Bearer <CDP_ACCESS_TOKEN> (required)
 *
 * Request body:
 * - name?: string (new skill name)
 * - price?: number (new skill price)
 *
 * Response:
 * - Success message or 403 if unauthorized
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params;

    // AUTHENTICATE USER
    const session = await validateSession(request);

    if (!session.isAuthenticated) {
      return Response.json(
        { error: 'Unauthorized', message: session.error },
        { status: 401 }
      );
    }

    // Validate skillId
    if (!skillId || typeof skillId !== 'string') {
      return Response.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, price, goal } = body;
    // REMOVED: requestorAddress (was spoofable!)

    // Fetch skill from MongoDB first to check ownership
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // AUTHORIZE: Check ownership using SERVER-VERIFIED address
    if (!checkSkillOwnership(session.evmAddress, skill.creatorAddress)) {
      return Response.json(
        {
          error: 'Forbidden: Only the skill creator can edit this skill',
          creator: skill.creatorAddress,
        },
        { status: 403 }
      );
    }

    // Build update object
    const updateFields: any = {
      updatedAt: new Date().toISOString()
    };

    // Validate and add name if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return Response.json(
          { error: 'name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateFields.name = name.trim();
    }

    // Validate and add price if provided
    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0.001 || isNaN(price)) {
        return Response.json(
          { error: 'price must be at least $0.001' },
          { status: 400 }
        );
      }
      updateFields.price = price;
    }

    // Validate and add goal if provided
    if (goal !== undefined) {
      if (typeof goal !== 'string' || !goal.trim()) {
        return Response.json(
          { error: 'goal must be a non-empty string' },
          { status: 400 }
        );
      }
      updateFields.goal = goal.trim();
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 1) {
      return Response.json(
        { error: 'At least one field (name, price, or goal) must be provided' },
        { status: 400 }
      );
    }

    console.log('[PATCH /api/skills/[skillId]] Updating skill:', skillId, updateFields);

    // Update skill in MongoDB
    const result = await db.collection('skills').updateOne(
      { skillId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    console.error('[PATCH /api/skills/[skillId]] Error:', error);

    return Response.json(
      {
        error: 'Failed to update skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/[skillId]
 *
 * Deletes a skill.
 * Only the skill creator can delete the skill.
 *
 * REQUIRES AUTHENTICATION
 *
 * Request Headers:
 * - Authorization: Bearer <CDP_ACCESS_TOKEN> (required)
 *
 * Response:
 * - Success message or 403 if unauthorized
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const { skillId } = await params;

    // AUTHENTICATE USER
    const session = await validateSession(request);

    if (!session.isAuthenticated) {
      return Response.json(
        { error: 'Unauthorized', message: session.error },
        { status: 401 }
      );
    }

    // Validate skillId
    if (!skillId || typeof skillId !== 'string') {
      return Response.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    // Fetch skill from MongoDB first to check ownership
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // AUTHORIZE: Check ownership using SERVER-VERIFIED address
    if (!checkSkillOwnership(session.evmAddress, skill.creatorAddress)) {
      return Response.json(
        {
          error: 'Forbidden: Only the skill creator can delete this skill',
          creator: skill.creatorAddress,
        },
        { status: 403 }
      );
    }

    console.log('[DELETE /api/skills/[skillId]] Deleting skill:', skillId, 'by creator:', session.evmAddress);

    // Delete skill from MongoDB
    const result = await db.collection('skills').deleteOne({ skillId });

    if (result.deletedCount === 0) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('[DELETE /api/skills/[skillId]] Error:', error);

    return Response.json(
      {
        error: 'Failed to delete skill',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
