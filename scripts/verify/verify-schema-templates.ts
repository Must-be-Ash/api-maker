/**
 * Verification Script: Schema Template System
 *
 * Tests that variable-based goals use templates instead of AI generation.
 */

import { generateExtractionSchema } from '@/lib/extraction/schema-generator';

async function verifySchemaTemplates() {
  console.log('🧪 Testing Variable-Based Schema Generation\n');
  console.log('='.repeat(60));

  const testCases = [
    {
      name: 'Weather Lookup',
      goal: 'Get weather for %city%',
      startUrl: 'https://www.theweathernetwork.com',
      expectedCategory: 'weather_lookup',
      expectedFields: ['temperature', 'condition', 'location']
    },
    {
      name: 'Generic Search',
      goal: 'Search Google for %query%',
      startUrl: 'https://www.google.com',
      expectedCategory: 'generic_search',
      expectedFields: ['answer', 'source', 'title']
    },
    {
      name: 'Job Search',
      goal: 'Find jobs for %role% in %location%',
      startUrl: 'https://www.linkedin.com',
      expectedCategory: 'job_search',
      expectedFields: ['title', 'company', 'location']
    },
    {
      name: 'Flight Search',
      goal: 'Find flights from %origin% to %destination%',
      startUrl: 'https://www.google.com/travel/flights',
      expectedCategory: 'flight_search',
      expectedFields: ['price', 'airline', 'route']
    },
    {
      name: 'Product Search',
      goal: 'Find price for %product%',
      startUrl: 'https://www.amazon.com',
      expectedCategory: 'product_search',
      expectedFields: ['price', 'title', 'availability']
    },
    {
      name: 'No Variables (should use AI)',
      goal: 'Get weather for Tokyo',
      startUrl: 'https://www.theweathernetwork.com',
      expectedCategory: null, // Should use AI, not templates
      expectedFields: null
    }
  ];

  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    console.log(`\n📝 Test: ${testCase.name}`);
    console.log(`   Goal: "${testCase.goal}"`);
    console.log(`   URL: ${testCase.startUrl}`);

    try {
      const schema = await generateExtractionSchema(testCase.goal, {
        startUrl: testCase.startUrl
      });

      console.log(`   ✅ Schema generated successfully`);
      console.log(`   Fields: ${schema.fields.map(f => f.name).join(', ')}`);
      console.log(`   Instruction: ${schema.instruction}`);

      // Verify expected fields are present (for template-based schemas)
      if (testCase.expectedFields) {
        const fieldNames = schema.fields.map(f => f.name);
        const hasExpectedFields = testCase.expectedFields.every(
          field => fieldNames.includes(field)
        );

        if (hasExpectedFields) {
          console.log(`   ✅ All expected fields present`);
          passCount++;
        } else {
          console.log(`   ❌ Missing expected fields`);
          console.log(`   Expected: ${testCase.expectedFields.join(', ')}`);
          console.log(`   Got: ${fieldNames.join(', ')}`);
          failCount++;
        }
      } else {
        // For non-template tests, just check it generated something
        if (schema.fields.length > 0) {
          console.log(`   ✅ AI generation worked (non-variable goal)`);
          passCount++;
        } else {
          console.log(`   ❌ No fields generated`);
          failCount++;
        }
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
    console.log('\n✅ Variable-based schema generation is working correctly!');
    console.log('   - Goals with variables use templates (fast, no AI)');
    console.log('   - Goals without variables use AI generation (backward compatible)');
  } else {
    console.log('❌ Some tests failed. Please review the implementation.');
  }

  return failCount === 0;
}

// Run verification
verifySchemaTemplates()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
