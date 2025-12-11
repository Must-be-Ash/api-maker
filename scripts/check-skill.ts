import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const db = await connectDB();
  const skill = await db.collection('skills').findOne({
    skillId: 'skill_1765432926919_f44cmqgiw'
  });

  if (!skill) {
    console.log('Skill not found');
    return;
  }

  console.log('=== SKILL DATA ===');
  console.log('Goal:', skill.goal);
  console.log('Variable Mapping:', JSON.stringify(skill.variableMapping, null, 2));
  console.log('\n=== ALL RECORDED ACTIONS ===');
  skill.recordedActions.forEach((action: any, i: number) => {
    console.log(`${i + 1}. Type: ${action.type}`);
    console.log(`   Description: ${action.description}`);
    if (action.value) {
      console.log(`   Value: ${action.value}`);
    }
    if (action.url) {
      console.log(`   URL: ${action.url.substring(0, 100)}...`);
    }
    console.log('');
  });

  process.exit(0);
}

main();
