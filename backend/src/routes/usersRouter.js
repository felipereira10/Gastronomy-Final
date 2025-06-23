import express from 'express'
import UsersControllers from '../controllers/usersController.js'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';
import { Mongo } from '../database/mongo.js';

const usersRouter = express.Router()
const usersControllers = new UsersControllers()

usersRouter.get(
    '/',
    ensureAuthenticated,
    checkTermsAccepted,
    async (req, res) => {
        const { body, success, statusCode } = await usersControllers.getUsers();
        res.status(statusCode).send({ body, success, statusCode });
    }
);

usersRouter.delete('/:id', async (req, res) => {
    try {
        const { body, success, statusCode } = await usersControllers.deleteUser(req.params.id)
        res.status(statusCode).send({ body, success, statusCode })
    } catch (err) {
        res.status(500).send({ success: false, statusCode: 500, body: { message: 'Internal server error' } })
    }
})

usersRouter.put('/:id', async (req, res) => {
    try {
        const { body, success, statusCode } = await usersControllers.updateUser(req.params.id, req.body)
        res.status(statusCode).send({ body, success, statusCode })
    } catch (err) {
        res.status(500).send({ success: false, statusCode: 500, body: { message: 'Internal server error' } })
    }
})

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

export default usersRouter;


// Os dois pontos, indica que vamos enviar um parâmetro