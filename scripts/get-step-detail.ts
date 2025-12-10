import { MongoClient } from 'mongodb';

async function getStepDetail(runId: string, stepName: string) {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI is not configured');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const database = client.db('test');
    const collection = database.collection('workflow_step_logs');

    const log = await collection.findOne({ runId, stepName });

    if (!log) {
      console.log(`❌ No log found for runId: ${runId}, stepName: ${stepName}`);
      return;
    }

    console.log('================================================================================');
    console.log(`📄 FULL ${stepName.toUpperCase()} STEP DATA`);
    console.log('================================================================================\n');

    if (stepName === 'create') {
      console.log('🎯 PROMPT SENT TO V0:');
      console.log('─'.repeat(80));
      console.log(log.data.prompt);
      console.log('\n' + '─'.repeat(80));
      console.log('\n🤖 V0 GENERATED CODE (first 2000 chars):');
      console.log('─'.repeat(80));
      console.log(log.data.generatedBlogPage.slice(0, 2000));
      console.log('\n... (truncated) ...');
      console.log('\n' + '─'.repeat(80));
      console.log(`\n📊 Total Length: ${log.data.generatedBlogPage.length} characters`);

      // Check for thinking tags
      if (log.data.generatedBlogPage.includes('<Thinking>')) {
        console.log('\n⚠️  WARNING: Contains <Thinking> tags!');
      }
      if (log.data.generatedBlogPage.includes('<thinking>')) {
        console.log('\n⚠️  WARNING: Contains <thinking> tags!');
      }
      if (log.data.generatedBlogPage.startsWith('```')) {
        console.log('\n⚠️  WARNING: Starts with markdown code block!');
      }
    }

    if (stepName === 'deploy') {
      console.log('📦 DEPLOYED CODE (first 2000 chars):');
      console.log('─'.repeat(80));
      console.log(log.data.pageCode);
      console.log('\n' + '─'.repeat(80));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

const runId = process.argv[2] || 'wrun_01KBM74HC15WHY6Z9QV281VDA5';
const stepName = process.argv[3] || 'create';

getStepDetail(runId, stepName);
