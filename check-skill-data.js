// Quick script to check what's actually in the skill database
const { MongoClient } = require('mongodb');

async function checkSkill() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'skills_db');

    const skillId = 'skill_1765315026786_lcr498kum';
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      console.log('❌ Skill not found!');
      return;
    }

    console.log('\n=== SKILL DATA ANALYSIS ===\n');
    console.log('Skill ID:', skill.skillId);
    console.log('Goal:', skill.goal);
    console.log('Start URL:', skill.startUrl);
    console.log('\n--- Field Existence Check ---');
    console.log('recordedActions exists:', !!skill.recordedActions);
    console.log('recordedActions count:', skill.recordedActions?.length || 0);
    console.log('stagehandWorkflow exists:', !!skill.stagehandWorkflow);
    console.log('stagehandWorkflow count:', skill.stagehandWorkflow?.length || 0);
    console.log('history exists:', !!skill.history);
    console.log('history count:', skill.history?.length || 0);

    if (skill.stagehandWorkflow && skill.stagehandWorkflow.length > 0) {
      console.log('\n--- Sample stagehandWorkflow Actions (first 3) ---');
      skill.stagehandWorkflow.slice(0, 3).forEach((action, i) => {
        console.log(`\nAction ${i + 1}:`, JSON.stringify(action, null, 2));
      });
    } else {
      console.log('\n❌ stagehandWorkflow is MISSING or EMPTY!');
      console.log('This is why Strategy 2 fails!');
    }

    if (skill.recordedActions && skill.recordedActions.length > 0) {
      console.log('\n--- Sample recordedActions (first 3) ---');
      skill.recordedActions.slice(0, 3).forEach((action, i) => {
        console.log(`\nAction ${i + 1}:`, JSON.stringify(action, null, 2));
      });
    }

    console.log('\n--- All Available Fields ---');
    console.log(Object.keys(skill).join(', '));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkSkill();
