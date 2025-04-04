import express from 'express';
import cors from 'cors';
import { Mongo } from './database/mongo.js';
import { config } from 'dotenv'
import authRouter from './auth/auth.js';
import usersRouter from './routes/users.js';

config()

// Declaração da função
async function main () {
    const hostname = 'localhost';
    const port = 3000;

    // Construção da aplicação
    const app = express();

    const mongoConnection = await Mongo.connect({
        mongoConnectionString: process.env.MONGO_CS, 
        mongoDbName: process.env.MONGO_DB_NAME
    })
    console.log(mongoConnection)

    // Arruma a resposta do servidor, quando enviado
    app.use(express.json());
    app.use(cors());

    // Um pedido
    app.get('/', (req, res) => {
        res.send({
            sucess: true,
            statusCode: 200,
            body: 'Welcome to MyGastronomy!'
        })
    })

    // Routes
    app.use('/auth', authRouter)
    app.use('/users', usersRouter)
    
    app.listen(port, () => {
        console.log(`Server running on: http://${hostname}:${port}`)
    })
}

// Faz a função rodar
main ()