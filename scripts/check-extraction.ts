// Check extraction data from the latest execution
import { connectDB } from '../lib/mongodb.js';

async function main() {
  const db = await connectDB();

  console.log('=== LATEST SKILL EXECUTION ===');
  const execution = await db.collection('skill_executions')
    .find({ skillId: 'skill_1765406668777_v33amu2up' })
    .sort({ executedAt: -1 })
    .limit(1)
    .toArray();

  if (execution[0]) {
    console.log('Execution ID:', execution[0]._id);
    console.log('Strategy:', execution[0].strategy);
    console.log('Success:', execution[0].success);
    console.log('\n=== EXTRACTED DATA ===');
    console.log(JSON.stringify(execution[0].extractedData || 'NO DATA EXTRACTED', null, 2));

    console.log('\n=== ERROR (if any) ===');
    console.log(execution[0].error || 'No errors recorded');

    console.log('\n=== FULL EXECUTION DOCUMENT ===');
    console.log(JSON.stringify(execution[0], null, 2));
  } else {
    console.log('No execution found');
  }

  process.exit(0);
}

main().catch(console.error);
