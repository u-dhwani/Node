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
class ProductModel extends dbConfig_1.default {
    constructor() {
        super('products');
        this.sellerModel = new dbConfig_1.default('seller');
    }
    addProducts(product) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const partialproduct = {
                    product_name: product.product_name,
                    description: product.description,
                    brand: product.brand,
                    price: product.price,
                    category: product.category,
                    seller_id: product.seller_id,
                };
                // Insert product data into 'products' table
                const newProduct = yield this.addRecord(partialproduct);
                // Insert seller data into 'seller' table
                if (newProduct && newProduct.prod_id !== undefined) {
                    const sellerModel = new dbConfig_1.default('seller');
                    // Insert seller data into 'seller' table
                    const seller = {
                        seller_id: product.seller_id,
                        prod_id: newProduct.prod_id,
                        discount_percentage: product.discount_percentage,
                        quantity: product.quantity,
                        // Access prod_id only if it's defined
                    };
                    yield this.sellerModel.addRecord(seller);
                }
                else {
                    // Handle the case where newProduct.prod_id is undefined
                    throw new Error('Unable to retrieve prod_id from newProduct');
                }
                return newProduct;
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
                const result = yield this.pool.query('SELECT p.*, ' +
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
                const result = yield this.pool.query('SELECT * FROM products WHERE prod_id = $1', [productId]);
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
                const result = yield this.pool.query('SELECT * FROM products WHERE category = $1', [category]);
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
                //const result = await this.pool.query('UPDATE products SET status=\'inactive\' WHERE prod_id = $1 returning *', [productId]);
                const result = this.updateRecord(['prod_id'], [productId], { status: 'inactive' });
                if (!result) {
                    throw new Error('Product not found');
                }
                return result;
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
                // const result = await this.pool.query(
                //   'UPDATE seller SET quantity=$1,discount_percentage=$4 WHERE seller_id=$2 AND prod_id=$3 RETURNING *',
                //   [quantity, sellerId, productId, discount_percentage]
                // );
                const result = this.sellerModel.updateRecord(['seller_id', 'prod_id'], // Array of column names for the WHERE clause
                [sellerId, productId], // Array of corresponding values
                { quantity: quantity, discount_percentage: discount_percentage } // Updated data
                );
                if (!result) {
                    throw new Error('Seller or product not found');
                }
                return result;
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
                const result = yield this.pool.query('SELECT p.price * ((100 - s.discount_percentage) / 100) AS final_amount, p.price as initial_amount ' +
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
                const result = yield this.pool.query('SELECT * FROM products WHERE product_name = $1 AND brand = $2 AND seller_id = $3', [
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
