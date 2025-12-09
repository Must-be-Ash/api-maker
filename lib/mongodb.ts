import type { MongoClient, Db } from 'mongodb';

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient> | undefined;

/**
 * Initialize MongoDB client with dynamic import
 */
async function initClient(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  const uri = process.env.MONGODB_URI;
  const options = {};

  // Dynamic import to prevent bundling in workflow compiler
  const { MongoClient: MC } = await import('mongodb');

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable to preserve the MongoClient across module reloads
    if (!global._mongoClientPromise) {
      const client = new MC(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    // In production mode, create a new MongoClient for each instance
    if (!clientPromise) {
      const client = new MC(uri, options);
      clientPromise = client.connect();
    }
  }

  return clientPromise!;
}

/**
 * Get MongoDB client
 * @returns Promise<MongoClient>
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    return initClient();
  }
  return clientPromise;
}

/**
 * Get MongoDB database instance
 * @param dbName Optional database name, defaults to database from URI
 * @returns Promise<Db>
 */
export async function connectDB(dbName?: string): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}
