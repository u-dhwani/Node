"use strict";
// routes/users.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkAuth_1 = require("../middleware/checkAuth"); // Import checkAuth
const users_1 = __importDefault(require("../controller/users"));
const authController = new users_1.default.AuthController();
const userController = new users_1.default.UserController();
const router = (0, express_1.Router)();
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/all', checkAuth_1.checkAuth, userController.getUsers);
router.delete('/deleteUser', checkAuth_1.checkAuth, (0, checkAuth_1.role_access)('admin'), userController.deleteByEmail);
router.put('/update', checkAuth_1.checkAuth, (0, checkAuth_1.role_access)('user'), userController.updateAddressOfUserByEmail);
exports.default = router;
