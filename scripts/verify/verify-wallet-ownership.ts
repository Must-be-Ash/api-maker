import { config } from 'dotenv';
import { connectDB } from '../../lib/mongodb';

// Load environment variables
config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const skill = await db.collection('skills').findOne({
    skillId: 'skill_1765653224044_2tf5sfnz5'
  });

  if (!skill) {
    console.log('❌ Skill not found');
    process.exit(1);
  }

  console.log('✅ SKILL FOUND IN DATABASE\n');
  console.log('=== BASIC INFO ===');
  console.log('Skill ID:', skill.skillId);
  console.log('Name:', skill.name);
  console.log('Goal:', skill.goal);
  console.log('Original Goal:', skill.originalGoal);

  console.log('\n=== 🔐 OWNERSHIP INFO ===');
  console.log('Creator Address:', skill.creatorAddress || '❌ NOT SET');
  console.log('Price:', `$${skill.price}`);

  console.log('\n=== TIMESTAMPS ===');
  console.log('Created:', skill.createdAt);
  console.log('Updated:', skill.updatedAt);

  console.log('\n=== VERIFICATION ===');
  if (skill.creatorAddress) {
    console.log('✅ Wallet ownership tracking is ACTIVE');
    console.log('   Address format:', skill.creatorAddress.startsWith('0x') ? 'Valid Ethereum address' : 'Invalid format');
    console.log('   Address length:', skill.creatorAddress.length, '(should be 42 for Ethereum)');
  } else {
    console.log('❌ No creator address found - ownership tracking NOT working');
  }

  process.exit(0);
}

main();
