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
const product_1 = __importDefault(require("../models/product"));
//import validate from '../validations/product';
const product_2 = require("../validations/product");
class ProductController {
    getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const pageSize = 5;
                // Assuming paginate returns an object with an offset property
                const { offset } = (0, pagination_1.paginate)(page, pageSize);
                const results = yield product_1.default.getAllProducts(pageSize, offset);
                res.status(200).json(results.rows);
            }
            catch (error) {
                console.error('Error retrieving all products:', error);
                res.status(500).send('Internal Server Error');
            }
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prod_id } = (0, product_2.validateProductId)({ prod_id: parseInt(req.params.id) });
                // Check if the product exists
                const checkResult = yield product_1.default.getProductById(prod_id);
                if (!checkResult) {
                    return res.status(404).send('Product does not exist in the database');
                }
                // Product exists, proceed to delete
                yield product_1.default.deleteProduct(prod_id);
                res.status(200).send('Product removed Successfully!!!');
            }
            catch (error) {
                console.error('Error in deleteProduct:', error);
                res.status(500).send('Internal Server Error');
            }
        });
    }
    addProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { product_name, description, brand, price, category, discount_percentage, quantity } = (0, product_2.validateCreateProduct)(req.body);
            try {
                const seller_id = req.user.user_id;
                console.log("welcome:" + seller_id);
                const existingProduct = yield product_1.default.existingProduct(product_name, brand, seller_id);
                if (existingProduct.length > 0) {
                    return res.status(409).json({ message: 'Product already exists. Update the quantity.' });
                }
                const newProduct = {
                    product_name,
                    description,
                    brand,
                    price,
                    category,
                    seller_id,
                    discount_percentage,
                    quantity
                };
                yield product_1.default.addProducts(newProduct);
                return res.status(201).json({ message: 'Product added successfully.' });
            }
            catch (error) {
                console.error('Error adding product:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prod_id } = (0, product_2.validateProductId)({ prod_id: parseInt(req.params.id) });
                const result = yield product_1.default.getProductById(prod_id);
                if (result) {
                    return res.status(200).json({ product: result });
                }
                else {
                    return res.status(404).json({ error: 'Product not found' });
                }
            }
            catch (error) {
                console.error('Error fetching product by ID:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    getProductByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category } = (0, product_2.validateCategoryParam)({ category: req.params.category });
                console.log(category);
                const products = yield product_1.default.getProductByCategory(category);
                if (products.length === 0) {
                    return res.status(404).json({ message: 'Product not found' });
                }
                return res.status(200).json({ products });
            }
            catch (error) {
                console.error('Error fetching product by category:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    updateProductsByDiscountQuantity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { prod_id, discount_percentage, quantity } = (0, product_2.validateUpdateProduct)(req.body);
                const seller_id = req.user.user_id;
                console.log("update" + seller_id);
                const existingProduct = yield product_1.default.getProductById(prod_id);
                if (existingProduct) {
                    yield product_1.default.updateProductsByDiscountQuantity(quantity, seller_id, prod_id, discount_percentage);
                    return res.status(200).json({ message: 'Product updated successfully.' });
                }
                else {
                    return res.status(404).json({ message: 'Your product does not exist.' });
                }
            }
            catch (error) {
                console.error('Error updating product by quantity:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
    finalPrice(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //   const { productId } = validateProductId({ prod_id: parseInt(req.params.id) });
                //   const finalPriceInfo = await ProductModel.finalPrice(productId);
                const { prod_id } = (0, product_2.validateProductId)({ prod_id: parseInt(req.params.id) });
                const finalPriceInfo = yield product_1.default.finalPrice(prod_id);
                if (Array.isArray(finalPriceInfo) && finalPriceInfo.length > 0) {
                    return res.status(200).json({ finalPrice: finalPriceInfo[0] });
                }
                else {
                    return res.status(404).json({ message: 'Product not found or discount information not available.' });
                }
            }
            catch (error) {
                console.error('Error fetching final price:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    }
}
exports.default = new ProductController();
