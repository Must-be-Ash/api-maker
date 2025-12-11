/**
 * Analyze skill recording and latest execution
 */

import { config } from 'dotenv';
import { connectDB } from '@/lib/mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skillId = process.argv[2] || 'skill_1765418415462_ayepayb4k';

  const skill = await db.collection('skills').findOne({ skillId });

  if (!skill) {
    console.log('❌ Skill not found');
    process.exit(1);
  }

  console.log('\n=== SKILL RECORDING ANALYSIS ===\n');
  console.log('Skill ID:', skill.skillId);
  console.log('Goal:', skill.goal);
  console.log('Start URL:', skill.startUrl);

  console.log('\n--- Recorded Actions (After Filtering) ---');
  console.log('Total Actions:', skill.recordedActions?.length || 0);

  if (skill.recordedActions) {
    skill.recordedActions.forEach((action: any, i: number) => {
      console.log(`\nAction ${i + 1}: [${action.type}]`);
      console.log('   Description:', action.description);
      if (action.selector) console.log('   Selector:', action.selector?.substring(0, 100));
      if (action.value) console.log('   Value:', action.value);
      if (action.url) console.log('   URL:', action.url?.substring(0, 150));
    });
  }

  console.log('\n--- Variable Mapping ---');
  console.log(JSON.stringify(skill.variableMapping, null, 2));

  const execution = await db.collection('execution_results').findOne(
    { skillId },
    { sort: { createdAt: -1 } }
  );

  if (execution) {
    console.log('\n\n=== LATEST EXECUTION ANALYSIS ===\n');
    console.log('Execution ID:', execution.executionId);
    console.log('Variables:', JSON.stringify(execution.variables, null, 2));
    console.log('Strategy:', execution.strategy);
    console.log('Success:', execution.success);
    console.log('Session URL:', execution.sessionUrl);

    console.log('\n--- Executed Actions ---');
    if (execution.actions) {
      execution.actions.forEach((action: any, i: number) => {
        console.log(`\nAction ${i + 1}: [${action.type}]`);
        console.log('   Description:', action.description?.substring(0, 100));
        if (action.value) console.log('   Value:', action.value);
        if (action.url) console.log('   URL:', action.url?.substring(0, 150));
      });
    }

    console.log('\n--- Extracted Data ---');
    console.log(JSON.stringify(execution.extractedData, null, 2));
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
