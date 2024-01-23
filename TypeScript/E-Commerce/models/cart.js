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
class CartModel {
    FindUserInCart(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM cart WHERE user_id = $1', [userId]);
                return result.rows[0];
            }
            catch (error) {
                throw error;
            }
        });
    }
    createCartQuery(userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('INSERT INTO cart(user_id, amount) VALUES($1, $2) RETURNING *', [userId, amount]);
                return result.rows;
            }
            catch (error) {
                throw error;
            }
        });
    }
    createcartitem(userId, prodId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sellerQuantityResult = yield dbConfig_1.default.query('SELECT quantity FROM seller WHERE prod_id = $1', [prodId]);
                if (!sellerQuantityResult.rows.length) {
                    throw new Error('Seller does not have this product.');
                }
                const sellerQuantity = sellerQuantityResult.rows[0].quantity;
                if (sellerQuantity >= quantity) {
                    const result = yield dbConfig_1.default.query('INSERT INTO cart_item(user_id, prod_id, quantity) VALUES($1, $2, $3) RETURNING *', [userId, prodId, quantity]);
                    return result.rows[0];
                }
                else {
                    throw new Error('Insufficient quantity in the seller table.');
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateQuantity(quantity, userId, prodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield dbConfig_1.default.query('UPDATE cart_item SET quantity = $1 WHERE user_id = $2 AND prod_id = $3', [
                    quantity,
                    userId,
                    prodId,
                ]);
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateCartAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield dbConfig_1.default.query(`
            UPDATE cart
            SET amount = (
              SELECT COALESCE(SUM(p.price * ci.quantity), 0)
              FROM products p
              JOIN cart_item ci ON p.prod_id = ci.prod_id
              WHERE ci.user_id = cart.user_id
              GROUP BY ci.user_id
            )
            WHERE EXISTS (
              SELECT 1
              FROM cart_item ci
              WHERE ci.user_id = cart.user_id
            )
          `);
            }
            catch (error) {
                console.error('Error updating cart amount:', error);
                throw error;
            }
        });
    }
    deleteProdfromCart(userId, prodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield dbConfig_1.default.query('DELETE FROM cart_item WHERE user_id = $1 AND prod_id = $2', [userId, prodId]);
            }
            catch (error) {
                console.error('Error deleting product from cart:', error);
                throw error;
            }
        });
    }
    checkProductInCartByuser_Id(userId, prodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM cart_item WHERE user_id = $1 AND prod_id = $2', [userId, prodId]);
                return result.rows;
            }
            catch (error) {
                console.error('Error checking product in cart:', error);
                throw error;
            }
        });
    }
    checkUserInCartItem(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM cart_item WHERE user_id = $1', [userId]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error checking user in cart item:', error);
                throw error;
            }
        });
    }
    updateCartAmountAfterDelete(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield dbConfig_1.default.query('UPDATE cart SET amount = 0.0 WHERE user_id = $1', [userId]);
            }
            catch (error) {
                console.error('Error updating cart amount after delete:', error);
                throw error;
            }
        });
    }
    getAllProductsInCart(userId, pageSize, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM cart JOIN cart_item ON cart.user_id = cart_item.user_id WHERE cart.user_id = $1 LIMIT $2 OFFSET $3', [userId, pageSize, offset]);
                return result.rows;
            }
            catch (error) {
                console.error('Error getting all products in cart:', error);
                throw error;
            }
        });
    }
}
exports.default = new CartModel();
