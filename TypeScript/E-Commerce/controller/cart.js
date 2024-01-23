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
const pagination_1 = require("../utils/pagination");
const cart_1 = require("../validations/cart");
const cart_2 = __importDefault(require("../models/cart"));
class CartController {
    addProductsInCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationResult = (0, cart_1.validateUpdateProductQuantity)(req.body);
            const { prod_id, quantity } = validationResult.value;
            try {
                const user_Id = req.user_id;
                const user_found = yield cart_2.default.FindUserInCart(user_Id);
                yield cart_2.default.createcartitem(user_Id, prod_id, quantity);
                if (!user_found) {
                    const amount = 0.0;
                    yield cart_2.default.createCartQuery(user_Id, amount);
                }
                yield cart_2.default.updateCartAmount();
                const cart_details = yield cart_2.default.FindUserInCart(user_Id);
                if (cart_details)
                    return res.status(200).json(cart_details);
            }
            catch (_a) {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    deleteProdfromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { prod_id } = ((0, cart_1.validateProductId)(req.body)).value;
            try {
                const user_Id = req.user_id;
                const results = yield cart_2.default.checkProductInCartByuser_Id(user_Id, prod_id);
                if (results) {
                    yield cart_2.default.deleteProdfromCart(user_Id, prod_id);
                    const presentInCartItem = yield cart_2.default.checkUserInCartItem(user_Id);
                    yield cart_2.default.updateCartAmount();
                    if (!presentInCartItem) {
                        yield cart_2.default.updateCartAmountAfterDelete(user_Id);
                    }
                    else {
                        yield cart_2.default.updateCartAmount();
                    }
                    const cartResult = yield cart_2.default.FindUserInCart(user_Id);
                    return res.status(200).json(cartResult);
                }
                else {
                    return res.status(404).send('No product');
                }
            }
            catch (error) {
                console.error('Error deleting product from cart:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    getAllProductsInCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user_Id = req.user_id;
                const page = Number(req.query.page) || 1;
                const pageSize = 5;
                // Assuming paginate returns an object with an offset property
                const { offset } = (0, pagination_1.paginate)(page, pageSize);
                yield cart_2.default.updateCartAmount();
                const results = yield cart_2.default.getAllProductsInCart(user_Id, pageSize, offset);
                res.status(200).json(results);
            }
            catch (error) {
                console.error('Error getting all products in cart:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    updateByQuantity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const validationResult = (0, cart_1.validateUpdateProductQuantity)(req.body);
            const { prod_id, quantity } = validationResult.value;
            try {
                const user_Id = req.user_id;
                yield cart_2.default.updateQuantity(quantity, user_Id, prod_id);
                yield cart_2.default.updateCartAmount();
                const page = Number(req.query.page) || 1;
                const pageSize = 5;
                // Assuming paginate returns an object with an offset property
                const { offset } = (0, pagination_1.paginate)(page, pageSize);
                const results = yield cart_2.default.getAllProductsInCart(user_Id, pageSize, offset);
                res.status(200).json(results);
            }
            catch (error) {
                console.error('Error updating quantity in cart:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.default = new CartController();
