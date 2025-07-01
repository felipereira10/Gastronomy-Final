import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId, MongoClient } from 'mongodb';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js'; // seu middleware de autenticação
import { authenticateToken } from '../middlewares/authMiddleware.js';



const collectionName = 'users'
const now = new Date();
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
        _id: user._id.toString(),  // 🔑 sempre como string
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

  const user = await Mongo.db.collection('users').findOne({ email });
  if (!user) return res.status(404).send({ message: 'Usuário não encontrado' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

  // Enviar token por e-mail ou SMS (você escolhe)
  // Exemplo: await sendEmail(user.email, `http://localhost:3000/reset-password?token=${token}`);

  res.send({ message: 'Link de redefinição enviado com sucesso' });
});

// Rota para redefinir senha
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const hashed = await bcrypt.hash(newPassword, 10);
    await Mongo.db.collection('users').updateOne(
      { _id: new Mongo.ObjectId(userId) },
      { $set: { password: hashed } }
    );

    res.send({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    res.status(400).send({ message: 'Token inválido ou expirado' });
  }
});





export default authRouter
