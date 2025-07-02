import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId, MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js'; // seu middleware de autenticação
import { authenticateToken } from '../middlewares/authMiddleware.js';
import dotenv from 'dotenv';
dotenv.config();

const collectionName = 'users'
const now = new Date();
const authRouter = express.Router()

// Configuração do Nodemailer para envio de e-mails
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,  // Ou 587
  secure: true, // Usar SSL/TLS
  auth: {
    user: process.env.EMAIL_USER, // Ex: suaconta@gmail.com
    pass: process.env.EMAIL_PASS, // App Password do Gmail
  },
});


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
    const { fullname, email, password, birthdate, role, phoneNumber } = req.body;
    const now = new Date();

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

      // const allRequiredAccepted = activeTerms.sections
      //   .filter(section => section.required)
      //   .every(requiredSection => 
      //     body.acceptedTerms.sections.find(s => s.title === requiredSection.title)?.accepted
      //   );

      // if (!allRequiredAccepted) {
      //   return res.status(400).json({ error: 'All required terms must be accepted.' });
      // }

      const optionalAccepted = req.body.optionalAccepted || {}; // espera que o frontend envie isso

      const sectionsAccepted = activeTerms ? activeTerms.sections.map(section => ({
        title: section.title,
        required: section.required,
        accepted: section.required || !!optionalAccepted[section.title], // obrigatório sempre true, opcional conforme front
        acceptedAt: section.required || !!optionalAccepted[section.title] ? now : null
      })) : [];

      const result = await Mongo.db.collection(collectionName).insertOne({
        fullname,
        email,
        password: hashedPassword,
        salt,
        acceptedTerms: activeTerms ? {
          version: activeTerms.version,
          acceptedAt: now,
          sections: sectionsAccepted
        } : null,
        birthdate: birthdate || null,
        phoneNumber: phoneNumber || null,
        role: role || 'user',
        createdAt: now
      });

      if (result.insertedId) {
        const user = await Mongo.db.collection(collectionName).findOne(
          { _id: new ObjectId(result.insertedId) },
          { projection: { password: 0, salt: 0 } }
        );

        const token = jwt.sign(
          {
            _id: result.insertedId.toString(),
            role: user.role,
            email: user.email,
          },
          'secret',
          { expiresIn: '1h' }
        );

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

    if (err.code === 11000) {
      // Erro de índice único (email duplicado)
      return res.status(409).send({
        success: false,
        statusCode: 409,
        body: { text: 'Email already in use' }
      });
    }
    return res.status(500).send({
      success: false,
      statusCode: 500,
      body: { text: 'Internal server error', error: err.message }
    });
  }
});

authRouter.post('/terms', async (req, res) => {
  const { version, sections } = req.body;  // supondo que seu React envia 'sections'

  if (!version || !sections) {
    return res.status(400).send({
      success: false,
      message: 'Version and sections are required'
    });
  }

  try {
    // Verifica se a versão já existe antes de inserir
    const existingVersion = await Mongo.db.collection('terms').findOne({ version });
    if (existingVersion) {
      return res.status(400).send({
        success: false,
        message: 'A terms version with this identifier already exists'
      });
    }

    // Desativa todos os termos ativos
    await Mongo.db.collection('terms').updateMany(
      { active: true },
      { $set: { active: false } }
    );

    // Insere novo termo
    const result = await Mongo.db.collection('terms').insertOne({
      version,
      sections,
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

authRouter.put('/terms/:id', async (req, res) => {
  const { id } = req.params;
  const { version, sections } = req.body;

  if (!version || !sections) {
    return res.status(400).send({
      success: false,
      message: 'Version and sections are required'
    });
  }

  try {
    // Verifica se outra versão com o mesmo número existe (excluindo este id)
    const existingVersion = await Mongo.db.collection('terms').findOne({ version, _id: { $ne: Mongo.ObjectId(id) } });
    if (existingVersion) {
      return res.status(400).send({
        success: false,
        message: 'A terms version with this identifier already exists'
      });
    }

    await Mongo.db.collection('terms').updateOne(
      { _id: Mongo.ObjectId(id) },
      {
        $set: {
          version,
          sections,
          updatedAt: new Date()
        }
      }
    );

    res.status(200).send({
      success: true,
      message: 'Term updated successfully'
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
    const optionalAccepted = req.body.optionalAccepted || {};

    const activeTerm = await Mongo.db.collection('terms').findOne({ active: true });

    if (!activeTerm) {
      return res.status(404).send({
        success: false,
        message: 'No active terms found'
      });
    }

    const now = new Date();

    const sectionsAccepted = activeTerm.sections.map(section => {
      const isAccepted = section.required ? true : !!optionalAccepted[section.title];

      return {
        title: section.title,
        required: section.required,
        accepted: isAccepted,
        acceptedAt: isAccepted ? now : null
      };
    });

    await Mongo.db.collection('users').updateOne(
      { _id: new ObjectId(decoded._id) },
      {
        $set: {
          acceptedTerms: {
            version: activeTerm.version,
            acceptedAt: now,
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
        acceptedAt: now,
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

    const token = jwt.sign(
      {
        _id: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      'secret',
      { expiresIn: '1h' } // ou o tempo que quiser
    );


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

    if (!user) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    const acceptedTerms = user.acceptedTerms;

    if (!acceptedTerms) {
      return res.status(400).send({ success: false, message: 'No accepted terms found for user' });
    }

    const updatedSections = acceptedTerms.sections.map(section => {
      if (section.required) {
        return {
          ...section,
          accepted: true,
          acceptedAt: section.acceptedAt || new Date() // garante que tenha data
        };
      } else {
        const isAccepted = !!optionalAccepted[section.title];
        return {
          ...section,
          accepted: isAccepted,
          acceptedAt: isAccepted ? new Date() : null
        };
      }
    });

    await Mongo.db.collection('users').updateOne(
      { _id: new ObjectId(decoded._id) },
      { $set: { 'acceptedTerms.sections': updatedSections } }
    );

    const updatedUser = await Mongo.db.collection('users').findOne(
      { _id: new ObjectId(decoded._id) },
      { projection: { password: 0, salt: 0 } }
    );

    return res.status(200).send({
      success: true,
      message: 'Preferences updated successfully',
      acceptedTerms: updatedUser.acceptedTerms
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
});

// Rota para solicitar redefinição de senha
// authRouter.js
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await Mongo.db.collection(collectionName).findOne({ email });

  if (!user) {
    return res.status(404).send({ success: false, message: 'Usuário não encontrado' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  try {
    console.log('Tentando enviar o e-mail...');
    // Enviar email real
    await transporter.sendMail({
      from: `"Equipe do Sistema" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Redefinição de Senha',
      html: `
        <p>Olá, ${user.fullname || 'usuário'}!</p>
        <p>Você solicitou a redefinição de senha. Clique no botão abaixo:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
        <p>Ou copie e cole o link no navegador:</p>
        <p>${resetLink}</p>
        <p>Este link é válido por 15 minutos.</p>
      `,
    });

    // Retorna o link também na resposta para fallback local
    return res.send({
      success: true,
      message: 'Email enviado com sucesso!',
      resetLink,
    });

  } catch (err) {
    console.error('Erro ao enviar email:', err);
    return res.status(500).send({
      success: false,
      message: 'Erro ao enviar o email de redefinição',
      resetLink, // fallback ainda disponível
    });
  }
});

// Rota para redefinir senha
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(newPassword, salt, 310000, 16, 'sha256', async (err, hashedPassword) => {
      if (err) {
        return res.status(500).send({ message: 'Error while encrypting password' });
      }

      const result = await Mongo.db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            password: hashedPassword,
            salt: salt
          }
        }
      );

      if (result.modifiedCount === 1) {
        return res.send({ message: 'Password reset successfully' });
      } else {
        return res.status(404).send({ message: 'User not found' });
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: 'Invalid or expired token' });
  }
});

export default authRouter
