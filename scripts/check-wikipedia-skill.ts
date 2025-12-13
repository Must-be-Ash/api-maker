import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const db = await connectDB();
  const skill = await db.collection('skills').findOne({
    skillId: 'skill_1765649178470_zbud9gukk'
  });

  if (!skill) {
    console.log('Skill not found');
    return;
  }

  console.log('=== SKILL DATA ===');
  console.log('Skill ID:', skill.skillId);
  console.log('Name:', skill.name);
  console.log('Goal:', skill.goal);
  console.log('Original Goal:', skill.originalGoal);
  console.log('Variable Mapping:', JSON.stringify(skill.variableMapping, null, 2));
  console.log('\n=== RECORDED ACTIONS ===');
  console.log('Total Actions:', skill.recordedActions?.length);
  skill.recordedActions?.forEach((action: any, i: number) => {
    console.log(`\n${i + 1}. Type: ${action.type}`);
    console.log(`   Description: ${action.description}`);
    if (action.value) {
      console.log(`   Value: ${action.value}`);
    }
    if (action.selector) {
      console.log(`   Selector: ${action.selector}`);
    }
    if (action.semanticValue !== undefined) {
      console.log(`   SemanticValue: ${action.semanticValue}`);
    }
  });

  process.exit(0);
}

main();
