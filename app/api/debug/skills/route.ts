import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

/**
 * DEBUG endpoint to see what skills production is actually querying
 * Force dynamic to bypass all caching
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await connectDB();

    const skills = await db
      .collection('skills')
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      skillsCount: skills.length,
      skills: skills.map((s: any) => ({
        skillId: s.skillId,
        name: s.name,
        createdAt: s.createdAt,
        successfulRun: s.successfulRun
      })),
      env: {
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        mongoUriDatabase: process.env.MONGODB_URI?.split('/').slice(-1)[0]?.split('?')[0] || 'unknown'
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to query database',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
