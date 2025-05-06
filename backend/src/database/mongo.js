import { MongoClient } from 'mongodb';

let client;
let db;

export const Mongo = {
  async connect({ mongoConnectionString, mongoDbName }) {
    try {
      client = new MongoClient(mongoConnectionString);
      await client.connect();
      db = client.db(mongoDbName);
      console.log('✅ Successfully connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  },

  getClient() {
    return client;
  },

  getDb() {
    return db;
  }
};
