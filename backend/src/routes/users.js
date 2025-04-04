import express from 'express'
import UsersControllers from '../controllers/users.js'

const usersRouter = express.Router()

const usersControllers = new UsersControllers()

usersRouter.get('/', async (req, res) => {
    const { sucess, statusCode, body } = await usersControllers.getUsers()

    res.status(statusCode).send({ sucess, statusCode, body })
})

// Os dois pontos, indica que vamos enviar um parâmetro
usersRouter.delete('/:id', async (req, res) => {
    const { sucess, statusCode, body } = await usersControllers.deleteUser(req.params.id)

    res.status(statusCode).send({ sucess, statusCode, body })
})

export default usersRouter 



