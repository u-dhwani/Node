"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbConfig_1 = __importDefault(require("../dbConfig"));
class UserModel extends dbConfig_1.default {
    constructor() {
        super('users');
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = this.addRecord(user);
                if (!result) {
                    return {
                        error: true,
                        message: "Something went wrong while inserting",
                        data: null
                    };
                }
                else {
                    // console.log("Model : " , (await result).data);
                    return {
                        error: false,
                        message: "User inserted successfully",
                        data: result
                    };
                }
            }
            catch (error) {
                return { error: "true",
                    message: error,
                    data: null };
            }
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
                return {
                    error: "false",
                    message: "User Data Successfully",
                    data: result.rows
                };
                // if (result.rows.length === 0) {
                //   // If user not found
                //   return null;
                // } else {
                //   // If user found, return the user data
                //   return result.rows[0];
                // }
            }
            catch (error) {
                // If an error occurs during the query
                console.error(`Error fetching user by email ${email}:`, error);
                return { error: "true",
                    message: error,
                    data: null };
            }
        });
    }
    getAllUsers(pageSize, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.pool.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
                return result;
            }
            catch (error) {
                console.error('Error executing getAllUsers query:', error);
                throw error;
            }
        });
    }
    removeUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //const result = await this.pool.query('DELETE FROM users WHERE email = $1 returning *', [email]);
                const conditions = [
                    { columnName: 'email', value: email },
                ];
                const result = this.deleteRecord(conditions);
                return result;
            }
            catch (error) {
                console.error('Error executing removeUserByEmail query:', error);
                throw error;
            }
        });
    }
    updateAddressOfUserByEmail(address, email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = this.updateRecord(['email'], [email], { address: address });
                return result;
            }
            catch (error) {
                console.error('Error executing updateAddressOfUserByEmail query:', error);
                throw error;
            }
        });
    }
}
exports.default = new UserModel();
