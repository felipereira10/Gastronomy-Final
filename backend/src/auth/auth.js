import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId, MongoClient } from 'mongodb';

const collectionName = 'users';

// Configuração do Passport
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, callback) => {
    const db = Mongo.getDb(); // <- CORRIGIDO AQUI
    const user = await db.collection(collectionName).findOne({ email });

    if (!user) {
        return callback(null, false);
    }

    const saltBuffer = user.salt.buffer;
    crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (err, hashedPassword) => {
        if (err) {
            return callback(err, false);
        }

        const userPasswordBuffer = Buffer.from(user.password.buffer);

        if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
            return callback(null, false);
        }

        const { password, salt, ...rest } = user;
        return callback(null, rest);
    });
}));

// Rota de autenticação
const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    const { email, password, fullname } = req.body;
    const db = Mongo.getDb(); // <- CORRIGIDO AQUI

    const checkUser = await db.collection(collectionName).findOne({ email });

    if (checkUser) {
        return res.status(400).send({
            success: false,
            statusCode: 400,
            body: { text: 'User already exists!' }
        });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
        if (err) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: { text: 'Error encrypting password!', err }
            });
        }

        const result = await db.collection(collectionName).insertOne({
            fullname,
            email,
            password: hashedPassword,
            salt
        });

        if (result.insertedId) {
            const user = await db.collection(collectionName).findOne({ _id: new ObjectId(result.insertedId) });

            const payload = {
                id: user._id,
                email: user.email
            };

            const token = jwt.sign(payload, 'secret', { expiresIn: '1h' });

            return res.send({
                success: true,
                statusCode: 200,
                body: {
                    text: 'User registered successfully!',
                    token,
                    user: payload,
                    logged: true
                }
            });
        }
    });
});

authRouter.post('/login', (req, res) => {
    passport.authenticate('local', (error, user) => {
        if (error) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: { text: 'Error during authentication', error }
            });
        }

        if (!user) {
            return res.status(400).send({
                success: false,
                statusCode: 400,
                body: { text: 'User not found' }
            });
        }

        const token = jwt.sign(user, 'secret', { expiresIn: '1h' });

        return res.status(200).send({
            success: true,
            statusCode: 200,
            body: {
                text: 'User logged in successfully',
                user,
                token
            }
        });
    })(req, res);
});

export default authRouter;
