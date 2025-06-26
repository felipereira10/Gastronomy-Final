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
  try {
    const db = Mongo.db;

    // 🛑 Garante que o ID é válido
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    // 🔐 Impede sobrescrita de campos sensíveis
    delete userData._id;
    delete userData.acceptedTerms;

    // 🔐 Se estiver alterando senha
    if (userData.password) {
      const salt = crypto.randomBytes(16);
      const hashedPassword = await pbkdf2(userData.password, salt, 310000, 16, 'sha256');
      userData.password = hashedPassword;
      userData.salt = salt;
    }

    // Trata birthdate
    if (userData.birthdate) {
      userData.birthdate = new Date(userData.birthdate);
      if (isNaN(userData.birthdate.getTime())) {
        throw new Error("Data de nascimento inválida");
      }
    }

    const filter = ObjectId.isValid(userId) ? { _id: new ObjectId(userId) } : { _id: userId };

    const result = await db.collection(collectionName).findOneAndUpdate(
    filter,
    { $set: userData },
    { returnDocument: 'after' } // ou returnOriginal: false, dependendo da versão
    );

    if (!result.value) {
      throw new Error("Usuário não encontrado");
    }

    return result.value;
  } catch (err) {
    console.error("❌ Erro ao atualizar usuário:", err.message);
    throw err;
  }
}
}
