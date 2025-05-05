import express from 'express';
import cors from 'cors';
import { Mongo } from './database/mongo.js';
import { config } from 'dotenv';
import authRouter from './auth/auth.js';
import usersRouter from './routes/usersRouter.js';
import platesRouter from './routes/platesRouter.js';
import ordersRouter from './routes/ordersRouter.js';

config();

async function main () {
  const hostname = 'localhost';
  const port = 3000;

  try {
    // Conecta ao MongoDB
    await Mongo.connect({
      mongoConnectionString: process.env.MONGO_CS, 
      mongoDbName: process.env.MONGO_DB_NAME
    });
    console.log('✅ MongoDB conectado com sucesso');

    // Inicia o servidor só depois da conexão
    const app = express();
    app.use(express.json());

    // Antes das suas rotas, adicione a configuração CORS
    app.use(cors({
        origin: 'http://localhost:5173', // Substitua pelo seu frontend, se for diferente
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }));


    app.get('/', (req, res) => {
      res.send({
        success: true,
        statusCode: 200,
        body: 'Welcome to MyGastronomy!'
      });
    });

    // Rotas
    app.use('/auth', authRouter);
    app.use('/users', usersRouter);
    app.use('/plates', platesRouter);
    app.use('/orders', ordersRouter);

    app.listen(port, () => {
      console.log(`🚀 Server running on: http://${hostname}:${port}`);
    });

  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra o processo
  }
}

main();