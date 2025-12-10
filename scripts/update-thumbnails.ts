import { put } from '@vercel/blob';
import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const imageFiles = [
  '/Users/ashnouruzi/Desktop/wrun_01KBXY8XPMB7TJWVTJHJ5X6NDE.png',
  '/Users/ashnouruzi/Desktop/wrun_01KBY55GSVE02TABVTE0P0QXAW.png',
  '/Users/ashnouruzi/Desktop/wrun_01KBY49BJQ0VQ7XT1AEQCFBXQV.png',
  '/Users/ashnouruzi/Desktop/wrun_01KBY210YQWSQ1C2VCCKZ6T3V1.png',
];

async function updateThumbnails() {
  const mongoUri = process.env.MONGODB_URI;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  if (!mongoUri) {
    throw new Error('MONGODB_URI not found in environment');
  }

  if (!blobToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN not found in environment');
  }

  const client = new MongoClient(mongoUri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('workflows');

    for (const filePath of imageFiles) {
      try {
        // Extract runId from filename (e.g., wrun_01KBXY8XPMB7TJWVTJHJ5X6NDE.png)
        const filename = path.basename(filePath);
        const runId = filename.replace('.png', '');

        console.log(`\n📸 Processing ${runId}...`);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
          console.error(`  ❌ File not found: ${filePath}`);
          continue;
        }

        // Read the image file
        const imageBuffer = fs.readFileSync(filePath);
        const imageBlob = new Blob([imageBuffer], { type: 'image/png' });

        console.log(`  ⬆️  Uploading to Vercel Blob...`);

        // Upload to Vercel Blob
        const blob = await put(
          `screenshots/${runId}.png`,
          imageBlob,
          {
            access: 'public',
            token: blobToken,
            allowOverwrite: true, // Allow overwriting existing files
          }
        );

        console.log(`  ✅ Uploaded: ${blob.url}`);

        // Update MongoDB record
        console.log(`  💾 Updating database...`);
        const result = await collection.updateOne(
          { runId: runId },
          { $set: { screenshotUrl: blob.url } }
        );

        if (result.matchedCount === 0) {
          console.log(`  ⚠️  No workflow found with runId: ${runId}`);
        } else if (result.modifiedCount === 0) {
          console.log(`  ℹ️  Workflow found but already had this URL`);
        } else {
          console.log(`  ✅ Database updated successfully`);
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error);
      }
    }

    console.log('\n✨ All done!');
  } catch (error) {
    console.error('❌ Script error:', error);
    throw error;
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
updateThumbnails().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
