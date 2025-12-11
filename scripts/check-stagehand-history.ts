/**
 * Check if Stagehand history is being captured
 */

import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';

config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  const result = await db.collection('execution_results')
    .findOne({}, { sort: { createdAt: -1 } as any });

  if (!result) {
    console.log('No executions found');
    process.exit(0);
  }

  console.log('\n=== CHECKING STAGEHAND HISTORY ===\n');
  console.log('Execution ID:', result.executionId);
  console.log('Has stagehandHistory field?', 'stagehandHistory' in result);
  console.log('stagehandHistory length:', result.stagehandHistory?.length || 0);
  console.log('Has actionCounts?', 'actionCounts' in result);

  if (result.stagehandHistory && result.stagehandHistory.length > 0) {
    console.log('\n✅ Stagehand history WAS captured!');
    console.log('\nFirst 5 actions:');
    result.stagehandHistory.slice(0, 5).forEach((entry: any, i: number) => {
      console.log(`\n${i + 1}. [${entry.method}] at ${new Date(entry.timestamp).toLocaleTimeString()}`);
      if (entry.parameters?.instruction) {
        console.log('   Instruction:', entry.parameters.instruction);
      }
      if (entry.parameters?.url) {
        console.log('   URL:', entry.parameters.url);
      }
      if (entry.result) {
        const resultStr = JSON.stringify(entry.result).substring(0, 150);
        console.log('   Result:', resultStr + (resultStr.length >= 150 ? '...' : ''));
      }
    });

    if (result.actionCounts) {
      console.log('\n\nAction Counts:');
      Object.entries(result.actionCounts).forEach(([method, count]) => {
        console.log(`  ${method}: ${count}`);
      });
    }
  } else {
    console.log('\n❌ No Stagehand history was captured!');
    console.log('\nPossible reasons:');
    console.log('1. stagehand.history was empty');
    console.log('2. The capture code failed silently');
    console.log('3. The history API is not available in this Stagehand version');
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
