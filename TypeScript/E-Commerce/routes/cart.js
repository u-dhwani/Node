"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkAuth_1 = require("../middleware/checkAuth"); // Import checkAuth
const cart_1 = __importDefault(require("../controller/cart"));
const router = (0, express_1.Router)();
router.post('/add', checkAuth_1.checkAuth, cart_1.default.addProductsInCart);
router.delete('/delete', checkAuth_1.checkAuth, cart_1.default.deleteProdfromCart);
router.get('/all', checkAuth_1.checkAuth, cart_1.default.getAllProductsInCart);
router.put('/update', checkAuth_1.checkAuth, cart_1.default.updateByQuantity);
exports.default = router;
