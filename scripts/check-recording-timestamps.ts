/**
 * Check recording session timestamps to debug filter
 */

import { config } from 'dotenv';
import { connectDB } from '@/lib/mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skillId = 'skill_1765418415462_ayepayb4k';

  // Get skill
  const skill = await db.collection('skills').findOne({ skillId });

  if (!skill) {
    console.log('❌ Skill not found');
    process.exit(1);
  }

  console.log('\n=== RECORDED ACTIONS WITH TIMESTAMPS ===\n');

  if (skill.recordedActions) {
    skill.recordedActions.forEach((action: any, i: number) => {
      console.log(`Action ${i + 1}: [${action.type}]`);
      console.log('  Timestamp:', action.timestamp, new Date(action.timestamp).toISOString());
      console.log('  Description:', action.description);
      if (action.value) console.log('  Value:', action.value);
      if (action.url) console.log('  URL:', action.url?.substring(0, 100));

      if (i > 0) {
        const prevAction = skill.recordedActions[i - 1];
        const timeDiff = action.timestamp - prevAction.timestamp;
        console.log(`  ⏱️  Time since previous action: ${timeDiff}ms (${(timeDiff / 1000).toFixed(2)}s)`);

        if (
          action.type === 'navigate' &&
          (prevAction.type === 'type' || prevAction.type === 'fill' || prevAction.type === 'click') &&
          timeDiff < 3000
        ) {
          console.log('  🔥 SHOULD HAVE BEEN FILTERED!');
        }
      }
      console.log('');
    });
  }

  // Also check the original recording session
  const recording = await db.collection('recording_sessions').findOne({
    recordingId: skill.sessionId || skill.recordingSessionUrl?.split('/').pop()
  });

  if (recording) {
    console.log('\n=== ORIGINAL RECORDING SESSION ===\n');
    console.log('Recording ID:', recording.recordingId);
    console.log('Status:', recording.status);
    console.log('Created:', recording.createdAt);

    console.log('\n--- Original Recorded Actions (Before Filter) ---');
    if (recording.recordedActions) {
      recording.recordedActions.forEach((action: any, i: number) => {
        console.log(`Action ${i + 1}: [${action.type}]`);
        console.log('  Timestamp:', action.timestamp);
        if (action.url) console.log('  URL:', action.url?.substring(0, 100));
        console.log('');
      });
    }
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
