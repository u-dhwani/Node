"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProfileMiddleware = exports.validateDeleteByEmailMiddleware = exports.validateLoginMiddleware = exports.validateSignupMiddleware = exports.validateUpdateProfile = exports.validateDeleteByEmailSchema = exports.validateLogin = exports.validateSignup = void 0;
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
const validateSignupMiddleware = (req, res, next) => {
    const result = (0, exports.validateSignup)(req.body);
    if (result.error) {
        res.status(400).json({ error: result.error.details[0].message });
    }
    next();
};
exports.validateSignupMiddleware = validateSignupMiddleware;
const validateLoginMiddleware = (req, res, next) => {
    const result = (0, exports.validateLogin)(req.body);
    if (result.error) {
        res.status(400).json({ error: result.error.details[0].message });
    }
    next();
};
exports.validateLoginMiddleware = validateLoginMiddleware;
const validateDeleteByEmailMiddleware = (req, res, next) => {
    const result = (0, exports.validateDeleteByEmailSchema)(req.body);
    if (result.error) {
        res.status(400).json({ error: result.error.details[0].message });
    }
    next();
};
exports.validateDeleteByEmailMiddleware = validateDeleteByEmailMiddleware;
const validateUpdateProfileMiddleware = (req, res, next) => {
    const result = (0, exports.validateUpdateProfile)(req.body);
    if (result.error) {
        res.status(400).json({ error: result.error.details[0].message });
    }
    next();
};
exports.validateUpdateProfileMiddleware = validateUpdateProfileMiddleware;
