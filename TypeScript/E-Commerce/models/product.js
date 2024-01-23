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
class ProductModel {
    addProducts(product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('INSERT INTO products(product_name, description, brand, price, category, seller_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *', [product.product_name, product.description, product.brand, product.price, product.category, product.seller_id]);
                yield dbConfig_1.default.query('INSERT INTO seller(seller_id, prod_id, discount_percentage, quantity) VALUES($1, $2, $3, $4)', [
                    product.seller_id,
                    result.rows[0].prod_id,
                    product.discount_percentage,
                    product.quantity
                ]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error adding product:', error);
                throw error;
            }
        });
    }
    getAllProducts(pageSize, offset) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT p.*, ' +
                    'p.price * ((100 - s.discount_percentage) / 100) AS final_amount, ' +
                    'p.price AS initial_amount ' +
                    'FROM products p ' +
                    'LEFT JOIN seller s ON p.prod_id = s.prod_id ' +
                    'WHERE p.status = \'active\' ' +
                    'ORDER BY p.prod_id ' +
                    'LIMIT $1 OFFSET $2', [pageSize, offset]);
                return result;
            }
            catch (error) {
                console.error('Error executing getAllProducts query:', error);
                throw error;
            }
        });
    }
    getProductById(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM products WHERE prod_id = $1', [productId]);
                if (result.rows.length === 0) {
                    throw null;
                }
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error retrieving product with ID ${productId}:`, error);
                throw error;
            }
        });
    }
    getProductByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM products WHERE category = $1', [category]);
                return result.rows || [];
            }
            catch (error) {
                console.error('Error retrieving products by category:', error);
                throw error;
            }
        });
    }
    deleteProduct(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`Deleting product with ID ${productId}`);
                const result = yield dbConfig_1.default.query('UPDATE products SET status=\'inactive\' WHERE prod_id = $1 returning *', [productId]);
                if (result.rows.length === 0) {
                    throw new Error('Product not found');
                }
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error deleting product with ID ${productId}:`, error);
                throw error;
            }
        });
    }
    updateProductsByDiscountQuantity(quantity, sellerId, productId, discount_percentage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('UPDATE seller SET quantity=$1,discount_percentage=$4 WHERE seller_id=$2 AND prod_id=$3 RETURNING *', [quantity, sellerId, productId, discount_percentage]);
                if (result.rows.length === 0) {
                    throw new Error('Seller or product not found');
                }
                return result.rows[0];
            }
            catch (error) {
                console.error(`Error updating product quantity for seller ${sellerId} and product ${productId}:`, error);
                throw error;
            }
        });
    }
    finalPrice(productId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount ' +
                    'FROM products p ' +
                    'JOIN seller s ON p.prod_id = s.prod_id ' +
                    'WHERE p.prod_id = $1', [productId]);
                return result;
            }
            catch (error) {
                console.error(`Error calculating final price for product with ID ${productId}:`, error);
                throw error;
            }
        });
    }
    existingProduct(productName, brand, sellerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield dbConfig_1.default.query('SELECT * FROM products WHERE product_name = $1 AND brand = $2 AND seller_id = $3', [
                    productName,
                    brand,
                    sellerId
                ]);
                return result.rows;
            }
            catch (error) {
                console.error('Error checking existing product:', error);
                throw error;
            }
        });
    }
}
exports.default = new ProductModel();
