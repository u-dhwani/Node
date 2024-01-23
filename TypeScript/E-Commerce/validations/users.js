"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProfile = exports.validateDeleteByEmailSchema = exports.validateLogin = exports.validateSignup = void 0;
const joi_1 = __importDefault(require("joi"));
const validateSignup = (data) => joi_1.default.object({
    full_name: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    phone_no: joi_1.default.string().required(),
    address: joi_1.default.string().required(),
    role: joi_1.default.string().required(),
}).validate(data);
exports.validateSignup = validateSignup;
const validateLogin = (data) => joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
}).validate(data);
exports.validateLogin = validateLogin;
const validateDeleteByEmailSchema = (data) => joi_1.default.object({
    email: joi_1.default.string().email().required(),
}).validate(data);
exports.validateDeleteByEmailSchema = validateDeleteByEmailSchema;
const validateUpdateProfile = (data) => joi_1.default.object({
    email: joi_1.default.string().email().required(),
    address: joi_1.default.string().required(),
}).validate(data);
exports.validateUpdateProfile = validateUpdateProfile;
