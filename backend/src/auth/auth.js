import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId, MongoClient } from 'mongodb';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js'; // seu middleware de autenticação
import usersRouter from '../routes/usersRouter.js';

const collectionName = 'users'

const authRouter = express.Router()

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, callback) => {
    const user = await Mongo.db
      .collection('users')
      .findOne({ email: email });



    if(!user) {
        return callback(null, false)
    }

    const saltBuffer = Buffer.from(user.salt.buffer);

    crypto.pbkdf2(password, saltBuffer, 310000, 16, 'sha256', (error, hashedPassword) => {
        if(error) {
            return callback(error)
        }

        const userPasswordBuffer = Buffer.from(user.password.buffer);

        if(!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
            return callback(null, false)
        }

        const { password, salt, ...rest } = user

        return callback(null, rest)
    })
}))

authRouter.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password, birthdate, role } = req.body;

    const checkUser = await Mongo.db.collection(collectionName).findOne({ email });
    if (checkUser) {
      return res.status(409).send({
        success: false,
        statusCode: 409,
        body: { text: 'User already exists' }
      });
    }

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 16, 'sha256', async (error, hashedPassword) => {
      if (error) {
        return res.status(500).send({
          success: false,
          statusCode: 500,
          body: { text: 'Internal error while encrypting password' }
        });
      }

      const activeTerms = await Mongo.db.collection('terms').findOne({ active: true });

      const sectionsAccepted = activeTerms ? activeTerms.sections.map(section => ({
        title: section.title,
        required: section.required,
        acceptedAt: section.required ? new Date() : null
      })) : [];

      const result = await Mongo.db.collection(collectionName).insertOne({
        fullname,
        email,
        password: hashedPassword,
        salt,
        acceptedTerms: activeTerms ? {
          version: activeTerms.version,
          acceptedAt: new Date(),
          sections: sectionsAccepted
        } : null,
        birthdate: birthdate || null,
        role: role || 'user',
        createdAt: new Date()
      });

      if (result.insertedId) {
        const user = await Mongo.db.collection(collectionName).findOne(
          { _id: new ObjectId(result.insertedId) },
          { projection: { password: 0, salt: 0 } }
        );

        const token = jwt.sign(user, 'secret');

        return res.status(201).send({
          success: true,
          statusCode: 201,
          body: {
            text: 'User registered',
            user,
            token
          }
        });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      statusCode: 500,
      body: { text: 'Internal server error', error: err.message }
    });
  }
});


authRouter.post('/terms', async (req, res) => {
  const { version, content } = req.body;

  if (!version || !content) {
    return res.status(400).send({
      success: false,
      message: 'Version and content are required'
    });
  }

  try {
    // Desativa todos os termos ativos
    await Mongo.db.collection('terms').updateMany(
      { active: true },
      { $set: { active: false } }
    );

    // Insere novo termo
    const result = await Mongo.db.collection('terms').insertOne({
      version,
      content,
      createdAt: new Date(),
      active: true
    });

    res.status(201).send({
      success: true,
      message: 'New terms created successfully',
      termId: result.insertedId
    });
  } catch (err) {
    res.status(500).send({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
});


// Histórico dos termos de uso
authRouter.get('/terms', async (req, res) => {
    const terms = await Mongo.db.collection('terms')
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

    res.status(200).send({
        success: true,
        terms
    });
});

// Termos de uso ativos
authRouter.get('/terms/active', async (req, res) => {
    const term = await Mongo.db.collection('terms').findOne({ active: true });

    if (!term) {
        return res.status(404).send({
            success: false,
            message: 'No active terms found'
        });
    }

    res.status(200).send({
        success: true,
        term
    });
});


// Middleware para verificar se o usuário aceitou os termos
authRouter.post('/accept-terms', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({
      success: false,
      statusCode: 401,
      body: { text: 'Unauthorized' }
    });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    const optionalAccepted = req.body.optionalAccepted || {}; // vem do front

    const activeTerm = await Mongo.db.collection('terms').findOne({ active: true });

    if (!activeTerm) {
      return res.status(404).send({
        success: false,
        message: 'No active terms found'
      });
    }

    // Monta o array de seções aceitas
    const sectionsAccepted = activeTerm.sections.map(section => ({
      title: section.title,
      required: section.required,
      acceptedAt: section.required 
        ? new Date() // obrigatórios sempre tem data de aceite
        : (optionalAccepted[section.title] ? new Date() : null) // opcionais dependem do que veio do front
    }));

    // Atualiza o usuário no banco
    await Mongo.db.collection('users').updateOne(
      { _id: new ObjectId(decoded._id) },
      {
        $set: {
          acceptedTerms: {
            version: activeTerm.version,
            acceptedAt: new Date(),
            sections: sectionsAccepted
          }
        }
      }
    );

    return res.status(200).send({
      success: true,
      statusCode: 200,
      message: 'Terms accepted successfully',
      acceptedTerms: {
        version: activeTerm.version,
        acceptedAt: new Date(),
        sections: sectionsAccepted
      }
    });


  } catch (err) {
    console.error(err);
    return res.status(401).send({
      success: false,
      statusCode: 401,
      body: { text: 'Invalid token' }
    });
  }
});


authRouter.post('/login', async (req, res) => {
  passport.authenticate('local', async (error, user) => {
    if (error) {
      return res.status(500).send({
        success: false,
        statusCode: 500,
        body: {
          text: 'Error during authentication',
          error,
        },
      });
    }

    if (!user) {
      return res.status(400).send({
        success: false,
        statusCode: 400,
        body: {
          text: 'Credentials are not correct',
        },
      });
    }

    const activeTerm = await Mongo.db.collection('terms').findOne({ active: true });

    const mustAcceptTerms =
      activeTerm &&
      (!user.acceptedTerms || user.acceptedTerms.version !== activeTerm.version);

    // Remove campos sensíveis
    const { password, salt, ...cleanUser } = user;

    // Garante que o campo acceptedTerms seja enviado mesmo se ausente
    cleanUser.acceptedTerms = cleanUser.acceptedTerms || {
      version: null,
      acceptedAt: null,
      sections: []
    };

    const token = jwt.sign(cleanUser, 'secret');

    return res.status(200).send({
      success: true,
      statusCode: 200,
      body: {
        text: 'User logged in correctly',
        user: cleanUser,
        token,
        mustAcceptTerms,
        currentTerms: mustAcceptTerms ? activeTerm : null,
      },
    });
  })(req, res);
});

authRouter.post('/update-terms', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, 'secret');
    const { optionalAccepted = {} } = req.body;

    const user = await Mongo.db.collection('users').findOne({ _id: new ObjectId(decoded._id) });
    const existingSections = user?.acceptedTerms?.sections || [];

    const updatedSections = existingSections.map(section => ({
      ...section,
      acceptedAt: section.required ? section.acceptedAt : (optionalAccepted[section.title] ? new Date() : null)
    }));

    await Mongo.db.collection('users').updateOne(
      { _id: new ObjectId(decoded._id) },
      { $set: { 'acceptedTerms.sections': updatedSections } }
    );

    // Buscar novamente o usuário atualizado para enviar no response
    const updatedUser = await Mongo.db.collection('users').findOne({ _id: new ObjectId(decoded._id) });

    return res.status(200).send({
      success: true,
      message: 'Preferences updated',
      acceptedTerms: updatedUser.acceptedTerms
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({ success: false, message: 'Server error', error: err.message });
  }
});



export default authRouter
