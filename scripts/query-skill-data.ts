// Query skill execution data from MongoDB
import { connectDB } from '../lib/mongodb';

async function main() {
  const db = await connectDB();

  console.log('=== SKILL DOCUMENT ===');
  const skill = await db.collection('skills').findOne({
    skillId: 'skill_1765406668777_v33amu2up'
  });
  console.log(JSON.stringify(skill, null, 2));

  console.log('\n\n=== LATEST EXECUTION ===');
  const executions = await db.collection('skill_executions')
    .find({ skillId: 'skill_1765406668777_v33amu2up' })
    .sort({ executedAt: -1 })
    .limit(1)
    .toArray();
  console.log(JSON.stringify(executions, null, 2));

  console.log('\n\n=== RECORDING SESSION ===');
  const recording = await db.collection('recording_sessions')
    .findOne({ skillId: 'skill_1765406668777_v33amu2up' });
  console.log(JSON.stringify(recording, null, 2));

  process.exit(0);
}

main().catch(console.error);
