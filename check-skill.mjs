import 'dotenv/config';
import { connectDB } from './lib/mongodb.ts';

const db = await connectDB();
const skill = await db.collection('skills').findOne({ skillId: 'skill_1765940830652_af2p89t9b' });

console.log('=== SKILL DETAILS ===');
console.log('Name:', skill.name);
console.log('Goal:', skill.goal);
console.log('\n=== RECORDED ACTIONS (' + skill.recordedActions.length + ') ===');
console.log(JSON.stringify(skill.recordedActions, null, 2));
console.log('\n=== STAGEHAND WORKFLOW (' + skill.stagehandWorkflow.length + ') ===');
console.log(JSON.stringify(skill.stagehandWorkflow, null, 2));

process.exit(0);
