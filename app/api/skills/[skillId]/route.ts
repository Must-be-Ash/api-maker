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

/**
 * PATCH /api/skills/[skillId]
 *
 * Updates a skill's properties (e.g., name, price).
 * Only the skill creator can edit the skill.
 *
 * Request body:
 * - name?: string (new skill name)
 * - price?: number (new skill price)
 * - requestorAddress?: string (EVM wallet address of requestor for ownership validation)
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

    // Validate skillId
    if (!skillId || typeof skillId !== 'string') {
      return Response.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, price, requestorAddress } = body;

    // Fetch skill from MongoDB first to check ownership
    const db = await connectDB();
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      return Response.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check ownership: if skill has a creator, only they can edit
    if (skill.creatorAddress) {
      if (!requestorAddress) {
        return Response.json(
          { error: 'Unauthorized: Authentication required to edit this skill' },
          { status: 401 }
        );
      }

      // Case-insensitive address comparison
      if (skill.creatorAddress.toLowerCase() !== requestorAddress.toLowerCase()) {
        return Response.json(
          { error: 'Unauthorized: Only the skill creator can edit this skill' },
          { status: 403 }
        );
      }
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
      if (typeof price !== 'number' || price < 0 || isNaN(price)) {
        return Response.json(
          { error: 'price must be a non-negative number' },
          { status: 400 }
        );
      }
      updateFields.price = price;
    }

    // Ensure at least one field is being updated
    if (Object.keys(updateFields).length === 1) {
      return Response.json(
        { error: 'At least one field (name or price) must be provided' },
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
