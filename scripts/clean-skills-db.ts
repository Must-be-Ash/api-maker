/**
 * Script to clean all Skills-related collections in the 'test' database
 *
 * This script deletes ALL documents from:
 * - test.skill_executions
 * - test.recording_sessions
 * - test.skills
 * - test.execution_results
 *
 * Usage: npx tsx scripts/clean-skills-db.ts
 */

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

async function cleanSkillsDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = client.db('test');

    // Get counts before deletion
    const skillsCollection = db.collection('skills');
    const executionsCollection = db.collection('skill_executions');
    const recordingSessionsCollection = db.collection('recording_sessions');
    const executionResultsCollection = db.collection('execution_results');

    const skillsCount = await skillsCollection.countDocuments();
    const executionsCount = await executionsCollection.countDocuments();
    const recordingSessionsCount = await recordingSessionsCollection.countDocuments();
    const executionResultsCount = await executionResultsCollection.countDocuments();

    console.log('📊 Current collection counts:');
    console.log(`   skills: ${skillsCount}`);
    console.log(`   skill_executions: ${executionsCount}`);
    console.log(`   recording_sessions: ${recordingSessionsCount}`);
    console.log(`   execution_results: ${executionResultsCount}`);
    console.log('');

    if (skillsCount === 0 && executionsCount === 0 && recordingSessionsCount === 0 && executionResultsCount === 0) {
      console.log('✅ All collections are already empty. Nothing to clean.');
      return;
    }

    // Delete all documents from skills collection
    console.log('🗑️  Cleaning skills collection...');
    const skillsResult = await skillsCollection.deleteMany({});
    console.log(`   ✅ Deleted ${skillsResult.deletedCount} skill(s)`);

    // Delete all documents from skill_executions collection
    console.log('\n🗑️  Cleaning skill_executions collection...');
    const executionsResult = await executionsCollection.deleteMany({});
    console.log(`   ✅ Deleted ${executionsResult.deletedCount} execution(s)`);

    // Delete all documents from recording_sessions collection
    console.log('\n🗑️  Cleaning recording_sessions collection...');
    const recordingSessionsResult = await recordingSessionsCollection.deleteMany({});
    console.log(`   ✅ Deleted ${recordingSessionsResult.deletedCount} recording session(s)`);

    // Delete all documents from execution_results collection
    console.log('\n🗑️  Cleaning execution_results collection...');
    const executionResultsResult = await executionResultsCollection.deleteMany({});
    console.log(`   ✅ Deleted ${executionResultsResult.deletedCount} execution result(s)`);

    // Summary
    console.log('\n✅ Database cleanup complete!');
    console.log('\n📊 Summary:');
    console.log(`   Skills deleted: ${skillsResult.deletedCount}`);
    console.log(`   Skill executions deleted: ${executionsResult.deletedCount}`);
    console.log(`   Recording sessions deleted: ${recordingSessionsResult.deletedCount}`);
    console.log(`   Execution results deleted: ${executionResultsResult.deletedCount}`);
    console.log(`   Total documents deleted: ${skillsResult.deletedCount + executionsResult.deletedCount + recordingSessionsResult.deletedCount + executionResultsResult.deletedCount}`);

    // Verify collections are empty
    console.log('\n🔍 Verifying cleanup...');
    const finalSkillsCount = await skillsCollection.countDocuments();
    const finalExecutionsCount = await executionsCollection.countDocuments();
    const finalRecordingSessionsCount = await recordingSessionsCollection.countDocuments();
    const finalExecutionResultsCount = await executionResultsCollection.countDocuments();

    if (finalSkillsCount === 0 && finalExecutionsCount === 0 && finalRecordingSessionsCount === 0 && finalExecutionResultsCount === 0) {
      console.log('✅ All collections are now empty.');
    } else {
      console.log('⚠️  Warning: Some collections still have documents:');
      if (finalSkillsCount > 0) console.log(`   skills: ${finalSkillsCount}`);
      if (finalExecutionsCount > 0) console.log(`   skill_executions: ${finalExecutionsCount}`);
      if (finalRecordingSessionsCount > 0) console.log(`   recording_sessions: ${finalRecordingSessionsCount}`);
      if (finalExecutionResultsCount > 0) console.log(`   execution_results: ${finalExecutionResultsCount}`);
    }

  } catch (error) {
    console.error('\n❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

cleanSkillsDatabase();

