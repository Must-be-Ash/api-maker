/**
 * Fix hardcoded value in skill to use variable placeholder
 */

import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skillId = '693a1535a2a04254a59ab8ab';

  console.log('\n=== FIXING SKILL VARIABLE ===\n');
  console.log('Skill ID:', skillId);

  // Get current skill
  const skill = await db.collection('skills').findOne({ _id: new ObjectId(skillId) });

  if (!skill) {
    console.log('❌ Skill not found');
    process.exit(1);
  }

  console.log('\n--- BEFORE ---');
  console.log('recordedActions[3].value:', skill.recordedActions[3].value);
  console.log('stagehandWorkflow[3].instruction:', skill.stagehandWorkflow[3].instruction);

  // Update the skill
  const result = await db.collection('skills').updateOne(
    { _id: new ObjectId(skillId) },
    {
      $set: {
        'recordedActions.3.value': 'how much does a %object% cost?',
        'stagehandWorkflow.3.instruction': 'Fill Search with value "how much does a %object% cost?"',
        'recordedActions.3.description': 'Fill Search',
        'stagehandWorkflow.3.value': 'how much does a %object% cost?'
      }
    }
  );

  console.log('\n--- UPDATE RESULT ---');
  console.log('Matched:', result.matchedCount);
  console.log('Modified:', result.modifiedCount);

  // Get updated skill
  const updatedSkill = await db.collection('skills').findOne({ _id: new ObjectId(skillId) });

  if (!updatedSkill) {
    console.log('❌ Failed to fetch updated skill');
    process.exit(1);
  }

  console.log('\n--- AFTER ---');
  console.log('recordedActions[3].value:', updatedSkill.recordedActions[3].value);
  console.log('stagehandWorkflow[3].instruction:', updatedSkill.stagehandWorkflow[3].instruction);

  console.log('\n✅ Skill updated successfully!');
  console.log('\nNow test with:');
  console.log('curl -X POST http://localhost:3000/api/skills/skill_1765414197643_4mbs74d63/execute \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{ "variables": { "object": "Nintendo Switch OLED" } }\'');
  console.log('');

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
