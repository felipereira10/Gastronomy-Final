import { MongoClient } from 'mongodb'

let client
let db

export const Mongo = {
  async connect({ mongoConnectionString, mongoDbName }) {
    try {
      client = new MongoClient(mongoConnectionString)
      await client.connect()
      db = client.db(mongoDbName)
      console.log('✅ MongoDB conectado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao conectar ao MongoDB:', error)
      throw error
    }
  },

  getClient() {
    return client
  },

  getDb() {
    return this.db;
  }
}
