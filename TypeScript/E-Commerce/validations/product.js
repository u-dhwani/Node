"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProduct = exports.validateCategoryParam = exports.validateCreateProduct = exports.validateProductId = void 0;
const joi_1 = __importDefault(require("joi"));
// Validate Product ID
const validateProductIdSchema = joi_1.default.object({
    prod_id: joi_1.default.number().required(),
});
function validateProductId(data) {
    const result = validateProductIdSchema.validate(data);
    if (result.error) {
        throw result.error;
    }
    return result.value;
}
exports.validateProductId = validateProductId;
// Validate Create Product
const validateCreateProductSchema = joi_1.default.object({
    product_name: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    brand: joi_1.default.string().required(),
    price: joi_1.default.number().required(),
    category: joi_1.default.string().required(),
    discount_percentage: joi_1.default.number().required(),
    quantity: joi_1.default.number().required(),
});
function validateCreateProduct(data) {
    const result = validateCreateProductSchema.validate(data);
    if (result.error) {
        throw result.error;
    }
    return result.value;
}
exports.validateCreateProduct = validateCreateProduct;
// Validate Category Param
const validateCategoryParamSchema = joi_1.default.object({
    category: joi_1.default.string().required(),
});
function validateCategoryParam(data) {
    const result = validateCategoryParamSchema.validate(data);
    if (result.error) {
        throw result.error;
    }
    return result.value;
}
exports.validateCategoryParam = validateCategoryParam;
// Validate Update Product
const validateUpdateProductSchema = joi_1.default.object({
    prod_id: joi_1.default.number().required(),
    discount_percentage: joi_1.default.number().required(),
    quantity: joi_1.default.number().required(),
});
function validateUpdateProduct(data) {
    const result = validateUpdateProductSchema.validate(data);
    if (result.error) {
        throw result.error;
    }
    return result.value;
}
exports.validateUpdateProduct = validateUpdateProduct;
// import * as Joi from 'joi';
// import { Product } from '../models/product'; // Import the Product interface
// interface ValidateProductIdResult {
//   prod_id: number;
// }
// const validateProductIdSchema = Joi.object({
//   prod_id: Joi.number().required(),
// });
// function validateProductId(data: any): ValidateProductIdResult {
//   const result = validateProductIdSchema.validate(data);
//   if (result.error) {
//     throw result.error;
//   }
//   return result.value;
// }
// // Use the Product interface directly
// const validateCreateProductSchema = Joi.object<Product>({
//   product_name: Joi.string().required(),
//   description: Joi.string().required(),
//   brand: Joi.string().required(),
//   price: Joi.number().required(),
//   category: Joi.string().required(),
//   discount_percentage: Joi.number().required(),
//   quantity: Joi.number().required(),
// });
// function validateCreateProduct(data: any): Product {
//   const result = validateCreateProductSchema.validate(data);
//   if (result.error) {
//     throw result.error;
//   }
//   return result.value;
// }
// interface ValidateCategoryParamResult {
//   category: string;
// }
// const validateCategoryParamSchema = Joi.object({
//   category: Joi.string().required(),
// });
// function validateCategoryParam(data: any): ValidateCategoryParamResult {
//   const result = validateCategoryParamSchema.validate(data);
//   if (result.error) {
//     throw result.error;
//   }
//   return result.value;
// }
// // Use the Product interface directly
// interface ValidateUpdateProductResult extends Product {
//   prod_id:number
// }
// const validateUpdateProductSchema = Joi.object<ValidateUpdateProductResult>({
//   prod_id: Joi.number().required(),
//   discount_percentage: Joi.number().required(),
//   quantity: Joi.number().required(),
// });
// function validateUpdateProduct(data: any): ValidateUpdateProductResult {
//   const result = validateUpdateProductSchema.validate(data);
//   if (result.error) {
//     throw result.error;
//   }
//   return result.value;
// }
