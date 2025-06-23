import express from 'express'
import UsersControllers from '../controllers/usersController.js'
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated.js';
import { checkTermsAccepted } from '../middlewares/checkTerms.js';

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

export default usersRouter


// Os dois pontos, indica que vamos enviar um parâmetro