import UsersDataAccess from "../dataAccess/users.js";
import { ok, serverError } from '../helpers/httpResponse.js';

export default class UsersControllers {
    constructor() {
        this.dataAccess = new UsersDataAccess();
    }

    async getUsers() {
        try {
            const users = await this.dataAccess.getUsers();
            console.log(users)

            return ok(users);
        } catch (error) {
            return serverError(error);
        }
    }

    async deleteUser(UserId) {
        try {
            const users = await this.dataAccess.deteleUser(UserId);
            console.log(users)

            return ok(users);
        } catch (error) {
            return serverError(error);
        }
    }
}
