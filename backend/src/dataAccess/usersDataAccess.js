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
    const db = Mongo.getDb();

    console.log("userId recebido:", userId);
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    delete userData._id;
    delete userData.acceptedTerms;

    console.log("userData após remoção de _id e acceptedTerms:", userData);


    if (userData.password) {
      const salt = crypto.randomBytes(16);
      const hashedPassword = await pbkdf2(userData.password, salt, 310000, 16, 'sha256');
      userData.password = hashedPassword;
      userData.salt = salt;
    }

    if (userData.birthdate) {
      userData.birthdate = new Date(userData.birthdate);
      if (isNaN(userData.birthdate.getTime())) {
        throw new Error("Data de nascimento inválida");
      }
    }

    console.log("Dados para update:", userData);


    const filter = { _id: new ObjectId(userId) };
    console.log("Filtro usado no update:", filter); 

    const existingUser = await db.collection(collectionName).findOne(filter);
    console.log('Usuário encontrado antes update:', existingUser);

    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

const result = await db.collection(collectionName).findOneAndUpdate(
  filter,
  { $set: userData },
  { returnDocument: 'after' }
);

console.log('🟢 Documento atualizado:', result);

if (!result) {
  throw new Error("Usuário não encontrado após update");
}

return result;
  } catch (err) {
    console.error("❌ Erro ao atualizar usuário:", err.message);
    throw err;
  }
}
}
