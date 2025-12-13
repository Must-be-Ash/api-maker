/**
 * Verify Context-Aware Extraction Implementation
 *
 * Checks that:
 * 1. Skills have pageContext captured
 * 2. Schema generation received context
 * 3. Schemas are more specific (not generic fallback)
 */

import { connectDB } from '@/lib/mongodb';

async function verifyContextCapture() {
  console.log('========================================');
  console.log('CONTEXT-AWARE EXTRACTION VERIFICATION');
  console.log('========================================\n');

  const skillId = 'skill_1765495038170_jdsvyg0fb';

  try {
    const db = await connectDB();

    // 1. Load skill from MongoDB
    console.log('1. Loading skill from MongoDB...');
    const skill = await db.collection('skills').findOne({ skillId });

    if (!skill) {
      console.error('❌ Skill not found:', skillId);
      return;
    }

    console.log('✅ Skill found:', skillId);
    console.log('   Goal:', skill.goal);
    console.log('   Start URL:', skill.startUrl);
    console.log('   Created:', skill.createdAt);
    console.log('');

    // 2. Check if pageContext was captured
    console.log('2. Checking page context capture...');
    if (skill.pageContext) {
      console.log('✅ Page context captured:');
      console.log('   Final URL:', skill.pageContext.finalUrl || skill.pageContext.url);
      console.log('   Page Title:', skill.pageContext.pageTitle || skill.pageContext.title);
      console.log('   Headings:', skill.pageContext.headings?.length || 0, 'headings');
      if (skill.pageContext.headings?.length > 0) {
        skill.pageContext.headings.forEach((h: string, i: number) => {
          console.log(`     ${i + 1}. "${h}"`);
        });
      }
      console.log('   Structural Hints:', skill.pageContext.structuralHints || 'none');
      console.log('');
    } else {
      console.log('❌ No page context captured');
      console.log('   This means context capture failed or was not implemented');
      console.log('');
    }

    // 3. Check extraction schema
    console.log('3. Checking extraction schema...');
    if (skill.extractionSchema) {
      console.log('✅ Extraction schema exists:');
      console.log('   Fields:', skill.extractionSchema.fields?.length || 0);
      console.log('   Instruction:', skill.extractionSchema.instruction);
      console.log('   Description:', skill.extractionSchema.description);
      console.log('');

      if (skill.extractionSchema.fields?.length > 0) {
        console.log('   Schema fields:');
        skill.extractionSchema.fields.forEach((field: any, i: number) => {
          const optional = field.optional ? ' (optional)' : '';
          console.log(`     ${i + 1}. ${field.name}: ${field.type}${optional}`);
          console.log(`        → ${field.description}`);
        });
        console.log('');
      }

      // Check if it's a generic fallback schema
      const isGeneric =
        skill.extractionSchema.fields?.length === 1 &&
        skill.extractionSchema.fields[0].name === 'result' &&
        skill.extractionSchema.description === 'Generic extraction schema';

      if (isGeneric) {
        console.log('⚠️  Schema appears to be generic fallback');
        console.log('   This suggests schema generation failed or didn\'t use context');
        console.log('');
      } else {
        console.log('✅ Schema is specific (not generic fallback)');
        console.log('');
      }
    } else {
      console.log('❌ No extraction schema found');
      console.log('');
    }

    // 4. Check sample extraction (if Phase 3 was implemented)
    console.log('4. Checking sample extraction...');
    if (skill.sampleExtraction) {
      console.log('✅ Sample extraction exists:');
      console.log(JSON.stringify(skill.sampleExtraction, null, 2));
      console.log('');
    } else if (skill.pageContext?.sampleExtraction) {
      console.log('✅ Sample extraction exists (in pageContext):');
      console.log(JSON.stringify(skill.pageContext.sampleExtraction, null, 2));
      console.log('');
    } else {
      console.log('⚠️  No sample extraction (Phase 3 not implemented yet)');
      console.log('');
    }

    // 5. Summary
    console.log('========================================');
    console.log('SUMMARY');
    console.log('========================================');

    const hasContext = !!skill.pageContext;
    const hasSchema = !!skill.extractionSchema;
    const isGeneric =
      skill.extractionSchema?.fields?.length === 1 &&
      skill.extractionSchema?.fields[0].name === 'result' &&
      skill.extractionSchema?.description === 'Generic extraction schema';

    console.log('Context Capture:', hasContext ? '✅ Working' : '❌ Failed');
    console.log('Schema Generation:', hasSchema ? '✅ Working' : '❌ Failed');
    console.log('Schema Quality:', isGeneric ? '⚠️  Generic (needs context)' : '✅ Specific');
    console.log('');

    if (hasContext && hasSchema && !isGeneric) {
      console.log('🎉 SUCCESS! Context-aware extraction is working correctly!');
    } else if (hasContext && hasSchema && isGeneric) {
      console.log('⚠️  PARTIAL: Context captured but schema is still generic');
      console.log('   Schema generator may not be using context properly');
    } else {
      console.log('❌ FAILED: Implementation not working as expected');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run verification
verifyContextCapture()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
