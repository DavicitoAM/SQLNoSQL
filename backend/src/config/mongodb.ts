import { Db, MongoClient } from 'mongodb';
import { env } from './env.js';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (database) return database;

  client = new MongoClient(env.mongo.uri, {
    serverSelectionTimeoutMS: 2500
  });
  await client.connect();
  database = client.db(env.mongo.database);
  return database;
}

export async function closeMongo(): Promise<void> {
  if (client) await client.close();
  client = null;
  database = null;
}
