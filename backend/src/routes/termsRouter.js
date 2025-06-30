import express from 'express';
import { Mongo } from '../database/mongo.js';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';

const termsRouter = express.Router();

// Listar todos os termos
termsRouter.get('/', ensureAuthenticated, async (req, res) => {
  const terms = await Mongo.db.collection('terms').find().toArray();
  res.send({ terms });
});

//  Buscar termo ativo
termsRouter.get('/active', async (req, res) => {
  const term = await Mongo.db.collection('terms').findOne({ active: true });

  if (!term) {
    return res.status(404).send({
      success: false,
      message: 'Nenhum termo ativo encontrado.'
    });
  }

  res.status(200).send({
    success: true,
    term
  });
});


// Criar novo termo (Admin)
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

// Desativar termo
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

// Editar um termo existente (Admin)
// Criar uma nova versão do termo existente (Admin)
termsRouter.put('/:id', ensureAuthenticated, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).send({ message: 'Acesso negado. Admin apenas.' });
  }

  const { id } = req.params;
  const { version, sections } = req.body;

  try {
    const existingTerm = await Mongo.db.collection('terms').findOne({ _id: new Mongo.ObjectId(id) });

    if (!existingTerm) {
      return res.status(404).send({ message: 'Termo não encontrado.' });
    }

    // Desativar o termo atual
    await Mongo.db.collection('terms').updateOne(
      { _id: new Mongo.ObjectId(id) },
      { $set: { active: false, updatedAt: new Date() } }
    );

    // Criar um novo termo como ativo
    const newTerm = {
      version,
      sections,
      active: true,
      createdAt: new Date(),
    };

    const insertResult = await Mongo.db.collection('terms').insertOne(newTerm);

    res.status(201).send({
      message: 'Nova versão criada com sucesso.',
      termId: insertResult.insertedId
    });

  } catch (error) {
    console.error('Erro ao atualizar termo:', error);
    res.status(500).send({ message: 'Erro interno no servidor.' });
  }
});



export default termsRouter;
