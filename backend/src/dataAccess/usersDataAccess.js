import { Mongo } from "../database/mongo.js"
import { ObjectId } from 'mongodb'
import crypto from 'crypto'
import { promisify } from 'util'

const collectionName = 'users'
const pbkdf2 = promisify(crypto.pbkdf2) // <- isso aqui converte pra Promise

export default class UsersDataAccess {
    async getUsers() {
        const result = await Mongo.getDb()
            .collection(collectionName)
            .find({})
            .toArray()

        return result
    }

    async deleteUser(userId) {
        const result = await Mongo.getDb()
            .collection(collectionName)
            .findOneAndDelete({ _id: new ObjectId(userId) })

        return result
    }

    async updateUser(userId, userData) {
        const db = Mongo.getDb()

        if (userData.password) {
            const salt = crypto.randomBytes(16)
            const hashedPassword = await pbkdf2(userData.password, salt, 310000, 16, 'sha256')

            userData = {
                ...userData,
                password: hashedPassword,
                salt
            }
        }

        const result = await db
            .collection(collectionName)
            .findOneAndUpdate(
                { _id: new ObjectId(userId) },
                { $set: userData },
                { returnDocument: 'after' }
            )

        return result
    }
}