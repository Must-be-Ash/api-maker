/**
 * Query the new execution_results collection
 * This shows comprehensive data from skill executions
 */

import { config } from 'dotenv';
import { connectDB } from '../lib/mongodb';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  const db = await connectDB();

  console.log('\n========== EXECUTION RESULTS COLLECTION ==========\n');

  // Get all execution results, sorted by most recent
  const results = await db
    .collection('execution_results')
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  if (results.length === 0) {
    console.log('No execution results found yet.');
    console.log('\nRun a skill execution to populate this collection.');
    process.exit(0);
  }

  console.log(`Found ${results.length} execution(s)\n`);

  results.forEach((result, i) => {
    console.log(`\n━━━━━━━━━━ EXECUTION ${i + 1} ━━━━━━━━━━`);
    console.log(`Execution ID: ${result.executionId}`);
    console.log(`Skill: ${result.skillName} (${result.skillId})`);
    console.log(`Time: ${result.createdAt}`);

    console.log('\n--- Request ---');
    console.log('Variables:', JSON.stringify(result.request.variables, null, 2));

    console.log('\n--- Strategy Attempts ---');
    result.strategyAttempts.forEach((attempt: any, j: number) => {
      const icon = attempt.success ? '✅' : '❌';
      console.log(`${icon} ${j + 1}. ${attempt.strategy} (${attempt.executionTime}ms)`);
      if (attempt.error) {
        console.log(`   Error: ${attempt.error.message}`);
      }
      if (attempt.details) {
        console.log(`   Details:`, attempt.details);
      }
    });

    console.log('\n--- Final Result ---');
    console.log(`Success: ${result.success ? '✅ YES' : '❌ NO'}`);
    console.log(`Final Strategy: ${result.finalStrategy}`);
    console.log(`Total Time: ${result.performance.totalExecutionTime}ms`);
    console.log(`Tokens Used: ${result.performance.tokensUsed}`);

    console.log('\n--- Extracted Data ---');
    if (result.extractedData) {
      const nonEmptyFields = Object.entries(result.extractedData)
        .filter(([_, value]) => value && value !== '')
        .length;
      const totalFields = Object.keys(result.extractedData).length;

      console.log(`Fields: ${nonEmptyFields}/${totalFields} populated`);

      if (nonEmptyFields > 0) {
        console.log('\nData:');
        Object.entries(result.extractedData).forEach(([key, value]) => {
          if (value && value !== '') {
            console.log(`  ${key}: ${value}`);
          }
        });
      } else {
        console.log('⚠️  All fields are empty!');
      }
    } else {
      console.log('❌ NO DATA EXTRACTED');
    }

    console.log('\n--- Validation ---');
    console.log(`Valid: ${result.validation.valid ? '✅ YES' : '❌ NO'}`);
    if (result.validation.errors.length > 0) {
      console.log('Errors:');
      result.validation.errors.forEach((error: string) => {
        console.log(`  - ${error}`);
      });
    }

    console.log('\n--- Session ---');
    console.log(`Session URL: ${result.session.sessionUrl}`);
    console.log(`Debug URL: ${result.session.debugUrl}`);

    // Show Stagehand Action History
    if (result.stagehandHistory && result.stagehandHistory.length > 0) {
      console.log('\n--- Stagehand Action History ---');
      console.log(`Total Actions: ${result.stagehandHistory.length}`);

      if (result.actionCounts) {
        console.log('\nAction Breakdown:');
        Object.entries(result.actionCounts).forEach(([method, count]) => {
          if (typeof count === 'number' && count > 0) {
            console.log(`  ${method}: ${count}`);
          }
        });
      }

      console.log('\nFirst 5 Actions:');
      result.stagehandHistory.slice(0, 5).forEach((entry: any, j: number) => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        console.log(`  ${j + 1}. [${entry.method}] at ${time}`);

        // Show instruction if available
        if (entry.parameters?.instruction) {
          console.log(`     Instruction: "${entry.parameters.instruction}"`);
        }

        // Show result summary
        if (entry.result) {
          if (entry.method === 'act' && entry.result.selector) {
            console.log(`     Selector: ${entry.result.selector}`);
          } else if (entry.method === 'extract' && entry.result) {
            const keys = Object.keys(entry.result).slice(0, 3).join(', ');
            console.log(`     Extracted: ${keys}${Object.keys(entry.result).length > 3 ? '...' : ''}`);
          } else if (entry.method === 'observe' && entry.result?.elements) {
            console.log(`     Found: ${entry.result.elements.length} elements`);
          }
        }
      });

      if (result.stagehandHistory.length > 10) {
        console.log('\n  ... (showing first 5 and last 5) ...');

        console.log('\nLast 5 Actions:');
        result.stagehandHistory.slice(-5).forEach((entry: any, j: number) => {
          const idx = result.stagehandHistory.length - 5 + j;
          const time = new Date(entry.timestamp).toLocaleTimeString();
          console.log(`  ${idx + 1}. [${entry.method}] at ${time}`);

          if (entry.parameters?.instruction) {
            console.log(`     Instruction: "${entry.parameters.instruction}"`);
          }

          if (entry.result) {
            if (entry.method === 'act' && entry.result.selector) {
              console.log(`     Selector: ${entry.result.selector}`);
            } else if (entry.method === 'extract' && entry.result) {
              const keys = Object.keys(entry.result).slice(0, 3).join(', ');
              console.log(`     Extracted: ${keys}${Object.keys(entry.result).length > 3 ? '...' : ''}`);
            } else if (entry.method === 'observe' && entry.result?.elements) {
              console.log(`     Found: ${entry.result.elements.length} elements`);
            }
          }
        });
      } else if (result.stagehandHistory.length > 5) {
        console.log('\nRemaining Actions:');
        result.stagehandHistory.slice(5).forEach((entry: any, j: number) => {
          const time = new Date(entry.timestamp).toLocaleTimeString();
          console.log(`  ${j + 6}. [${entry.method}] at ${time}`);

          if (entry.parameters?.instruction) {
            console.log(`     Instruction: "${entry.parameters.instruction}"`);
          }
        });
      }

      console.log('\n💡 Tip: Query MongoDB directly to see full action details');
      console.log(`   db.execution_results.findOne({ executionId: "${result.executionId}" }).stagehandHistory`);
    }
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Summary stats
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.length - successCount;

  console.log('=== SUMMARY ===');
  console.log(`Total Executions: ${results.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);

  // Strategy stats
  const strategyStats: Record<string, { attempts: number; successes: number }> = {};

  results.forEach((r) => {
    r.strategyAttempts.forEach((attempt: any) => {
      if (!strategyStats[attempt.strategy]) {
        strategyStats[attempt.strategy] = { attempts: 0, successes: 0 };
      }
      strategyStats[attempt.strategy].attempts++;
      if (attempt.success) {
        strategyStats[attempt.strategy].successes++;
      }
    });
  });

  console.log('\n=== STRATEGY PERFORMANCE ===');
  Object.entries(strategyStats).forEach(([strategy, stats]) => {
    const successRate = ((stats.successes / stats.attempts) * 100).toFixed(1);
    console.log(`${strategy}: ${stats.successes}/${stats.attempts} (${successRate}%)`);
  });

  process.exit(0);
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
