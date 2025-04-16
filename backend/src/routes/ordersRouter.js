import express from 'express'
import OrdersControllers from '../controllers/ordersController.js'

const ordersRouter = express.Router()
const ordersControllers = new OrdersControllers()

ordersRouter.get('/', async (req, res) => {
    const { body, success, statusCode } = await ordersControllers.getOrders()

    res.status(statusCode).send({ body, success, statusCode })
})

ordersRouter.post('/', async (req, res) => {
    const { body, success, statusCode } = await ordersControllers.addOrders(req.body)

    res.status(statusCode).send({ body, success, statusCode })
})

ordersRouter.delete('/:id', async (req, res) => {
    const { body, success, statusCode } = await ordersControllers.deleteOrders(req.params.id)

    res.status(statusCode).send({ body, success, statusCode })
})

// Os dois pontos, indica que vamos enviar um parâmetro
ordersRouter.put('/:id', async (req, res) => {
    const { body, success, statusCode } = await ordersControllers.updateOrders(req.params.id, req.body)

    res.status(statusCode).send({ body, success, statusCode })
})

export default ordersRouter

