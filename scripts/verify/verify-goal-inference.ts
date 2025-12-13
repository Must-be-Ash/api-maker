/**
 * Verification Script: Goal Inference System
 *
 * Tests that vague user intents are correctly inferred into structured goals.
 */

import { inferGoalFromIntent } from '@/lib/ai/goal-inference';

async function verifyGoalInference() {
  console.log('🧪 Testing Goal Inference System\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: 'Vague: "doing google search"',
      userIntent: 'doing google search',
      demoQuery: 'how old is brad pitt',
      startUrl: 'https://www.google.com',
      actions: [
        { type: 'navigate', description: 'Navigate to google.com' },
        { type: 'fill', description: 'Fill search with "how old is brad pitt"' },
        { type: 'submit', description: 'Submit search' }
      ],
      expectedGoal: /search.*%query%/i,
      expectedCategory: 'generic_search',
      expectedVariables: ['%query%'],
      minConfidence: 0.8
    },
    {
      name: 'Vague: "get weather"',
      userIntent: 'get weather',
      demoQuery: 'Tokyo',
      startUrl: 'https://www.theweathernetwork.com',
      actions: [
        { type: 'navigate', description: 'Navigate to weather site' },
        { type: 'fill', description: 'Fill location with "Tokyo"' }
      ],
      expectedGoal: /weather.*%city%/i,
      expectedCategory: 'weather_lookup',
      expectedVariables: ['%city%'],
      minConfidence: 0.7
    },
    {
      name: 'Vague: "find jobs"',
      userIntent: 'find jobs',
      demoQuery: 'software engineer in San Francisco',
      startUrl: 'https://www.linkedin.com',
      actions: [
        { type: 'navigate', description: 'Navigate to LinkedIn' },
        { type: 'fill', description: 'Fill job title' },
        { type: 'fill', description: 'Fill location' }
      ],
      expectedGoal: /job.*%role%.*%location%/i,
      expectedCategory: 'job_search',
      expectedVariables: ['%role%', '%location%'],
      minConfidence: 0.7
    },
    {
      name: 'Just variable: "%query%"',
      userIntent: '%query%',
      demoQuery: 'Brad Pitt age',
      startUrl: 'https://www.google.com',
      actions: [
        { type: 'navigate', description: 'Navigate to google.com' },
        { type: 'fill', description: 'Fill search' }
      ],
      expectedGoal: /search.*%query%/i,
      expectedCategory: 'generic_search',
      expectedVariables: ['%query%'],
      minConfidence: 0.8
    },
    {
      name: 'Vague: "doing a search"',
      userIntent: 'doing a search',
      demoQuery: "what's the weather in New York",
      startUrl: 'https://www.google.com',
      actions: [
        { type: 'navigate', description: 'Navigate to google.com' },
        { type: 'fill', description: 'Fill search' }
      ],
      expectedGoal: /search.*%query%/i,
      expectedCategory: 'generic_search',
      expectedVariables: ['%query%'],
      minConfidence: 0.7
    }
  ];

  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Intent: "${testCase.userIntent}"`);
    console.log(`   Demo: "${testCase.demoQuery}"`);
    console.log(`   URL: ${testCase.startUrl}`);

    try {
      const result = await inferGoalFromIntent(
        testCase.userIntent,
        testCase.demoQuery,
        testCase.startUrl,
        testCase.actions
      );

      console.log(`   ✅ Inference completed`);
      console.log(`   Inferred Goal: "${result.structuredGoal}"`);
      console.log(`   Variables: ${result.variables.join(', ')}`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Confidence: ${result.confidence}`);

      // Verify goal matches expected pattern
      const goalMatches = testCase.expectedGoal.test(result.structuredGoal);
      const categoryMatches = result.category === testCase.expectedCategory;
      const hasVariables = testCase.expectedVariables.every(v => result.variables.includes(v));
      const confidenceOk = result.confidence >= testCase.minConfidence;

      if (goalMatches && categoryMatches && hasVariables && confidenceOk) {
        console.log(`   ✅ ALL CHECKS PASSED`);
        passCount++;
      } else {
        console.log(`   ❌ SOME CHECKS FAILED`);
        if (!goalMatches) console.log(`      - Goal pattern doesn't match`);
        if (!categoryMatches) console.log(`      - Category: expected ${testCase.expectedCategory}, got ${result.category}`);
        if (!hasVariables) console.log(`      - Missing expected variables: ${testCase.expectedVariables.join(', ')}`);
        if (!confidenceOk) console.log(`      - Confidence too low: ${result.confidence} < ${testCase.minConfidence}`);
        failCount++;
      }

    } catch (error) {
      console.log(`   ❌ Error: ${(error as Error).message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Results: ${passCount} passed, ${failCount} failed`);

  if (failCount === 0) {
    console.log('✅ All tests passed!');
    console.log('\n✅ Goal inference system is working correctly!');
    console.log('   - Vague intents are transformed into structured goals');
    console.log('   - Variables are correctly identified');
    console.log('   - Categories are properly detected');
    console.log('   - Confidence scores are appropriate');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }

  return failCount === 0;
}

// Run verification
verifyGoalInference()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
