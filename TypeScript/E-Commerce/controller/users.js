"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const users_1 = __importDefault(require("../models/users"));
const jwttoken_1 = require("../utils/jwttoken");
const bcrypt = __importStar(require("bcrypt"));
const pagination_1 = require("../utils/pagination");
class AuthController {
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const validationResult = validateSignup(req.body);
                // if (validationResult.error) {
                //   return res.status(400).json({ message: validationResult.error.details[0].message, error:true, data:null});
                // }
                const { full_name, email, password, phone_no, address, role } = req.body;
                // Check if the user already exists
                const result = yield users_1.default.getUserByEmail(email);
                if (result.error) {
                    return res.status(400).json({ error: true, message: result.message, data: result.data });
                }
                if (result.data.length > 0) {
                    return res.status(400).json({ error: true, message: "User already exist", data: null });
                }
                const hashedPassword = yield bcrypt.hash(password, 10);
                const newUser = {
                    full_name,
                    email,
                    password: hashedPassword,
                    phone_no,
                    address,
                    role,
                };
                const user_id_query = yield users_1.default.createUser(newUser);
                if (user_id_query.error) {
                    return {
                        error: true,
                        message: user_id_query.message,
                        data: null
                    };
                }
                const token = (0, jwttoken_1.generateToken)({ email, role: newUser.role, user_id: user_id_query.user_id });
                return res.json({ error: false, message: 'Signup successful', data: { token } });
            }
            catch (error) {
                console.error('Error in signup:', error);
                return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
            }
        });
    }
    // Response<any, Record<string, any>>
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const validationResult=validateLogin(req.body);
                // if (validationResult.error) {
                //   return res.status(400).json({ message: validationResult.error.details[0].message });
                // }
                const { email, password } = req.body;
                const user = yield users_1.default.getUserByEmail(email);
                if (!user) {
                    return res.status(404).json({ error: true, message: 'User not found', data: null });
                }
                console.log(user);
                console.log('user.password:', user.password);
                console.log('password:', password);
                //Compare hashed password
                const isMatch = yield bcrypt.compare(password, user.password);
                if (isMatch) {
                    const token = (0, jwttoken_1.generateToken)({ email, role: user.role, user_id: user.user_id });
                    return res.json({ error: false, message: 'Login successful', data: { token } });
                }
                else {
                    return res.status(401).json({ error: true, message: 'Password is incorrect', data: null });
                }
            }
            catch (error) {
                console.error('Error in login:', error);
                return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
            }
        });
    }
}
class UserController {
    getUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const pageSize = 5;
                // Assuming paginate returns an object with an offset property
                const { offset } = (0, pagination_1.paginate)(page, pageSize);
                // Assuming getAllUsers returns a promise with a rows property
                const results = yield users_1.default.getAllUsers(pageSize, offset);
                return res.status(200).json({
                    error: false,
                    message: 'Users retrieved successfully',
                    data: results.rows
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
            }
        });
    }
    ;
    deleteByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const validationResult= validateDeleteByEmailSchema(req.body);
                const { email } = req.body;
                // Check if the email exists
                const checkForUser = yield users_1.default.getUserByEmail(email);
                if (!checkForUser) {
                    return res.status(404).json({ error: "User not found in the database", data: null });
                }
                // User found, proceed with the deletion
                const deleteResult = yield users_1.default.removeUserByEmail(email);
                if (deleteResult) {
                    return res.status(200).json({ message: "User removed successfully", data: deleteResult });
                }
                else {
                    return res.status(404).json({ error: "User not found or not deleted", message: "Custom error message", data: null });
                }
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
            }
        });
    }
    ;
    updateAddressOfUserByEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const validationResult = validateUpdateProfile(req.body);
                const { email, address } = req.body;
                // Check if the email exists
                const checkResult = yield users_1.default.getUserByEmail(email);
                if (!checkResult) {
                    return res.status(404).json({ error: "User not found in the database", data: null });
                }
                // User found, proceed with the update
                yield users_1.default.updateAddressOfUserByEmail(address, email);
                return res.status(200).json({ error: null, message: 'User Updated Successfully!!!', data: null });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: true, message: 'Internal Server Error', data: null });
            }
        });
    }
    ;
}
exports.default = { AuthController, UserController };
