import { MongoClient, ServerApiVersion } from 'mongodb';

export const Mongo = {
  async connect({ mongoConnectionString, mongoDbName }) {
    try {
      const client = new MongoClient(mongoConnectionString, {
        tls: true,
        serverApi: ServerApiVersion.v1,
      });

      await client.connect();
      const db = client.db(mongoDbName);

      this.client = client;
      this.db = db;

      return '✅ Conectado ao MongoDB com sucesso!';
    } catch (error) {
      console.error('❌ Erro ao conectar ao MongoDB:', error.message);
      return { text: 'Error during mongo connection', error };
    }
  }
}
