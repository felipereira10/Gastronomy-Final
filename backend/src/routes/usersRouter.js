import express from 'express'
import UsersControllers from '../controllers/usersController.js'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';
import { Mongo } from '../database/mongo.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const usersRouter = express.Router()
const usersControllers = new UsersControllers()

// Lista todos os usuários com informações de termos
usersRouter.get('/admin/users-terms', async (req, res) => {
  try {
    const users = await Mongo.db
      .collection('users')
      .find({})
      .project({
        _id: 1,
        fullname: 1,
        email: 1,
        role: 1,
        birthdate: 1,
        acceptedTerms: 1,
        acceptedTermsAt: 1
      })
      .toArray();

    return res.status(200).send({
      success: true,
      users
    });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: 'Erro ao buscar usuários',
      error: err.message
    });
  }
});

usersRouter.get(
    '/',
    ensureAuthenticated,
    checkTermsAccepted,
    async (req, res) => {
        const { body, success, statusCode } = await usersControllers.getUsers();
        res.status(statusCode).send({ body, success, statusCode });
    }
);

usersRouter.delete('/:id', authenticateToken, async (req, res) => {
  const userIdToDelete = req.params.id;
  const requester = req.user; // do authenticateToken

  // Converte para string para garantir comparação correta
  const requesterIdStr = requester._id.toString();
  const userIdToDeleteStr = userIdToDelete.toString();

  // Se o usuário não é admin e está tentando deletar outra conta que não a dele
  if (requester.role !== 'admin' && requesterIdStr !== userIdToDeleteStr) {
    return res.status(403).send({ 
      success: false, 
      message: 'Forbidden: só pode deletar sua própria conta' 
    });
  }

  try {
    const { body, success, statusCode } = await usersControllers.deleteUser(userIdToDelete);
    res.status(statusCode).send({ body, success, statusCode });
  } catch (err) {
    res.status(500).send({ success: false, statusCode: 500, body: { message: 'Internal server error' } });
  }
});

usersRouter.put('/:id', authenticateToken, async (req, res) => {
  try {
    // ⚠️ Segurança: garantir que o usuário só edite a si mesmo, a menos que seja admin
    const requester = req.user;
    const requesterId = requester._id.toString();
    const targetId = req.params.id;

    if (requester.role !== 'admin' && requesterId !== targetId) {
      return res.status(403).send({
        success: false,
        statusCode: 403,
        body: { message: 'Você só pode editar seu próprio perfil' },
      });
    }

    if (req.body.birthdate) {
      req.body.birthdate = new Date(req.body.birthdate);
    }

    const { body, success, statusCode } = await usersControllers.updateUser(req.params.id, req.body);
    res.status(statusCode).send({ body, success, statusCode });

  } catch (err) {
    res.status(500).send({
      success: false,
      statusCode: 500,
      body: { message: 'Internal server error' }
    });
  }
});



export default usersRouter;


// Os dois pontos, indica que vamos enviar um parâmetro