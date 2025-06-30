import { MongoClient, ObjectId } from 'mongodb'

export const Mongo = {
  ObjectId,

  async connect({ mongoConnectionString, mongoDbName }) {
    try {
      const client = new MongoClient(mongoConnectionString)
      await client.connect()
      const db = client.db(mongoDbName)

      this.client = client
      this.db = db

      await db.collection('users').createIndex(
        { email: 1 },
        { unique: true }
      )

      console.log('Connected to MongoDB and ensured indexes!')
      return 'Connected to mongo!'
    } catch (error) {
      console.error('Error during mongo connection:', error)
      return { text: 'Error during mongo connection', error }
    }
  },

  getDb() {
    if (!this.db) {
      throw new Error("Banco de dados não conectado ainda");
    }
    return this.db;
  }
}
