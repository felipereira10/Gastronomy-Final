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

    const allowedFields = ['fullname', 'email', 'birthdate', 'phoneNumber', 'password', 'salt'];

    Object.keys(userData).forEach(key => {
      if (!allowedFields.includes(key)) {
        delete userData[key];
      }
    });

    if (userData.password) {
      const password = userData.password;

      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(password)) {
        throw new Error(
          "A senha deve ter pelo menos 8 caracteres, incluindo uma letra, um número e um caractere especial."
        );
      }

      const salt = crypto.randomBytes(16);
      const hashedPassword = await pbkdf2(password, salt, 310000, 16, 'sha256');
      userData.password = hashedPassword;
      userData.salt = salt;
    }

    if (userData.birthdate) {
      userData.birthdate = new Date(userData.birthdate);
      if (isNaN(userData.birthdate.getTime())) {
        throw new Error("Data de nascimento inválida");
      }
    }

    if (userData.phoneNumber) {
      const phoneRegex = /^[0-9]{9,15}$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        throw new Error("Número de telefone inválido");
      }
    }

    const filter = { _id: new ObjectId(userId) };

    const existingUser = await db.collection(collectionName).findOne(filter);

    if (!existingUser) {
      throw new Error("Usuário não encontrado");
    }

    const result = await db.collection(collectionName).findOneAndUpdate(
      filter,
      { $set: userData },
      { returnDocument: 'after' }
    );

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
