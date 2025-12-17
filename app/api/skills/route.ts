import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * GET /api/skills
 *
 * Returns all available skills for LLM discovery in chat
 * Public endpoint - no authentication required
 */
export async function GET() {
  try {
    const db = await connectDB();

    // Fetch all skills with relevant fields for LLM
    const skills = await db.collection('skills')
      .find({})
      .project({
        skillId: 1,
        name: 1,
        goal: 1,
        price: 1,
        variables: 1,
        successfulRun: 1,
        createdAt: 1,
        _id: 0
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('[GET /api/skills] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
