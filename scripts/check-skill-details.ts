/**
 * Check skill details from MongoDB
 */

import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';
import { ObjectId } from 'mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skillId = process.argv[2] || 'skill_1765414197643_4mbs74d63';

  // First, list all skills
  const allSkills = await db.collection('skills').find({}).toArray();
  console.log('\n=== ALL SKILLS IN DATABASE ===');
  console.log('Total:', allSkills.length);
  allSkills.forEach((s: any) => {
    console.log(`- ${s._id}: ${s.name || 'Unnamed'}`);
  });
  console.log('');

  // Try to find by ObjectId or string ID
  let skill = await db.collection('skills').findOne({ _id: skillId as any });

  if (!skill && skillId.length === 24) {
    // Try as ObjectId
    try {
      skill = await db.collection('skills').findOne({ _id: new ObjectId(skillId) });
    } catch (e) {
      // Not a valid ObjectId
    }
  }

  if (!skill) {
    console.log('❌ Skill not found:', skillId);
    console.log('Use one of the IDs above\n');
    process.exit(1);
  }

  console.log('\n=== SKILL DETAILS ===\n');
  console.log('Skill ID:', skill._id);
  console.log('Skill Name:', skill.name);
  console.log('Start URL:', skill.startUrl);
  console.log('Goal:', skill.goal);

  console.log('\n--- Recorded Actions ---');
  console.log('Total Actions:', skill.recordedActions?.length || 0);

  if (skill.recordedActions) {
    skill.recordedActions.forEach((action: any, i: number) => {
      console.log(`\n${i + 1}. [${action.type}]`);
      console.log('   Description:', action.description);
      if (action.selector) console.log('   Selector:', action.selector);
      if (action.value) console.log('   Value:', action.value);
      if (action.url) console.log('   URL:', action.url);
    });
  }

  console.log('\n--- Stagehand Workflow ---');
  console.log('Total Steps:', skill.stagehandWorkflow?.length || 0);

  if (skill.stagehandWorkflow) {
    skill.stagehandWorkflow.forEach((step: any, i: number) => {
      console.log(`\n${i + 1}. [${step.method}]`);
      console.log('   Instruction:', step.instruction);
    });
  }

  console.log('\n--- Extraction Schema ---');
  if (skill.extractionSchema) {
    console.log('Instruction:', skill.extractionSchema.instruction);
    console.log('Fields:', Object.keys(skill.extractionSchema.schema).join(', '));
    console.log('\nField Details:');
    Object.entries(skill.extractionSchema.schema).forEach(([field, schema]: [string, any]) => {
      console.log(`  ${field}: ${schema.type} - ${schema.description}`);
    });
  }

  console.log('\n');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
