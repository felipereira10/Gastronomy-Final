import OrdersDataAccess from "../dataAccess/ordersDataAccess.js"
import { ok, serverError } from "../helpers/httpResponses.js"

export default class OrdersControllers {
    constructor() {
        this.dataAccess = new OrdersDataAccess()
    }

    async getOrders() {
        try {
            const orders = await this.dataAccess.getOrders()

            return ok(orders)
        } catch (error) {
            return serverError(error)
        }
    }

    async addOrder(plateData) {
        try {
            const result = await this.dataAccess.addOrder(plateData)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }

    async deleteOrder(plateId) {
        try {
            const result = await this.dataAccess.deleteOrder(plateId)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }

    async updateOrder(plateId, plateData) {
        try {
            const result = await this.dataAccess.updateOrder(plateId, plateData)

            return ok(result)
        } catch (error) {
            return serverError(error)
        }
    }
}