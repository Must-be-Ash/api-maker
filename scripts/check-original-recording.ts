/**
 * Check original recording session before filtering
 */

import { config } from 'dotenv';
import { connectDB } from '@/lib/mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skillId = process.argv[2] || 'skill_1765418847811_gs5cme3de';

  // Get skill
  const skill = await db.collection('skills').findOne({ skillId });

  if (!skill) {
    console.log('❌ Skill not found');
    process.exit(1);
  }

  // Find the recording session
  const recordings = await db.collection('recording_sessions').find({}).sort({ createdAt: -1 }).limit(5).toArray();

  console.log('\n=== RECENT RECORDING SESSIONS ===\n');
  recordings.forEach((rec: any) => {
    console.log(`Recording: ${rec.recordingId}`);
    console.log(`  Created: ${rec.createdAt}`);
    console.log(`  Goal: ${rec.goal}`);
    console.log(`  Status: ${rec.status}`);
    console.log(`  Actions: ${rec.recordedActions?.length || 0}`);
    console.log('');
  });

  // Try to find the matching recording
  const recording = recordings.find((rec: any) =>
    rec.goal === skill.goal &&
    rec.startUrl === skill.startUrl &&
    Math.abs(new Date(rec.createdAt).getTime() - new Date(skill.createdAt).getTime()) < 60000
  );

  if (recording) {
    console.log('\n=== MATCHED RECORDING SESSION ===\n');
    console.log('Recording ID:', recording.recordingId);
    console.log('Created:', recording.createdAt);
    console.log('Goal:', recording.goal);

    console.log('\n--- Original Recorded Actions (BEFORE Filter) ---');
    console.log('Total:', recording.recordedActions?.length || 0);

    if (recording.recordedActions) {
      recording.recordedActions.forEach((action: any, i: number) => {
        console.log(`\nAction ${i + 1}: [${action.type}]`);
        console.log('  Timestamp:', action.timestamp);
        console.log('  Description:', action.description);
        if (action.selector) console.log('  Selector:', action.selector?.substring(0, 100));
        if (action.value) console.log('  Value:', action.value);
        if (action.url) console.log('  URL:', action.url?.substring(0, 150));
      });
    }

    console.log('\n--- Actions in Skill (AFTER Filter) ---');
    console.log('Total:', skill.recordedActions?.length || 0);

    console.log('\n--- COMPARISON ---');
    console.log(`Original: ${recording.recordedActions?.length || 0} actions`);
    console.log(`Filtered: ${skill.recordedActions?.length || 0} actions`);
    console.log(`Removed: ${(recording.recordedActions?.length || 0) - (skill.recordedActions?.length || 0)} actions`);
  } else {
    console.log('\n⚠️  Could not find matching recording session');
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
