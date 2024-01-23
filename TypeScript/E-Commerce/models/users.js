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
class UserModel {
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { full_name, email, password, phone_no, address, role } = data;
            const result = yield dbConfig_1.default.query('INSERT INTO users (full_name, email, password, phone_no, address, role) VALUES ($1, $2, $3, $4, $5, $6) returning user_id', [full_name, email, password, phone_no, address, role]);
            return result.rows[0];
        });
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield dbConfig_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
            return result.rows[0];
        });
    }
    getAllUsers(pageSize, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM users LIMIT $1 OFFSET $2', [pageSize, offset]);
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
                const result = yield dbConfig_1.default.query('DELETE FROM users WHERE email = $1 returning *', [email]);
                if (result.rowCount === 0) {
                    return { success: false, message: 'User not found or not deleted' };
                }
                console.log('Deleted user:', result);
                return { success: true, deletedUser: result.rows[0] };
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
                const result = yield dbConfig_1.default.query('UPDATE users SET address = $1 WHERE email = $2', [address, email]);
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
