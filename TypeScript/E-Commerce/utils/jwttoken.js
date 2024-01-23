"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = 'qwertyuiopasdfghjklzxcvbnm';
function generateToken(data) {
    return (0, jsonwebtoken_1.sign)(data, secret, { expiresIn: '1h' });
}
exports.generateToken = generateToken;
function verifyToken(token) {
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, secret);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
exports.verifyToken = verifyToken;
