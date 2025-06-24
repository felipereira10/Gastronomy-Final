import express from 'express';
import { Mongo } from '../database/mongo.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';

const termsRouter = express.Router();

// 🔥 Listar todos os termos
termsRouter.get('/', ensureAuthenticated, async (req, res) => {
  const terms = await Mongo.db.collection('terms').find().toArray();
  res.send({ terms });
});

// 🔥 Buscar termo ativo
termsRouter.get('/active', async (req, res) => {
  const term = await Mongo.db.collection('terms').findOne({ active: true });
  res.send({ term });
});

// 🔥 Criar novo termo (Admin)
termsRouter.post('/', ensureAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Acesso negado. Admin apenas.' });
  }

  const { version, content } = req.body;

  const existing = await Mongo.db.collection('terms').findOne({ version });

  if (existing) {
    return res.status(400).send({ message: 'Versão já existe.' });
  }

  await Mongo.db.collection('terms').insertOne({
    version,
    content,
    createdAt: new Date(),
    active: true
  });

  res.send({ message: 'Termo criado com sucesso.' });
});

// 🔥 Desativar termo
termsRouter.patch('/:id/disable', ensureAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Acesso negado. Admin apenas.' });
  }

  const { id } = req.params;
  await Mongo.db.collection('terms').updateOne(
    { _id: new Mongo.ObjectId(id) },
    { $set: { active: false } }
  );

  res.send({ message: 'Termo desativado.' });
});

// 🔥 Editar um termo existente (Admin)
termsRouter.put('/:id', ensureAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Acesso negado. Admin apenas.' });
  }

  const { id } = req.params;
  const { version, sections } = req.body;

  try {
    const updateResult = await Mongo.db.collection('terms').updateOne(
      { _id: new Mongo.ObjectId(id) },
      {
        $set: {
          version,
          sections,
          updatedAt: new Date(),
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).send({ message: 'Termo não encontrado.' });
    }

    res.send({ message: 'Termo atualizado com sucesso.' });
  } catch (error) {
    console.error('Erro ao atualizar termo:', error);
    res.status(500).send({ message: 'Erro interno no servidor.' });
  }
});


export default termsRouter;
