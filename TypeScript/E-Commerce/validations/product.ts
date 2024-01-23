import Joi, { ValidationResult } from 'joi';

// Validate Product ID
const validateProductIdSchema = Joi.object({
  prod_id: Joi.number().required(),
});

function validateProductId(data: any): { prod_id: number } {
  const result = validateProductIdSchema.validate(data);
  if (result.error) {
    throw result.error;
  }
  return result.value;
}

// Validate Create Product
const validateCreateProductSchema = Joi.object({
  product_name: Joi.string().required(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().required(),
  discount_percentage: Joi.number().required(),
  quantity: Joi.number().required(),
});

function validateCreateProduct(data: any): {
  product_name: string;
  description: string;
  brand: string;
  price: number;
  category: string;
  discount_percentage: number;
  quantity: number;
} {
  const result = validateCreateProductSchema.validate(data);
  if (result.error) {
    throw result.error;
  }
  return result.value;
}

// Validate Category Param
const validateCategoryParamSchema = Joi.object({
  category: Joi.string().required(),
});

function validateCategoryParam(data: any): { category: string } {
  const result = validateCategoryParamSchema.validate(data);
  if (result.error) {
    throw result.error;
  }
  return result.value;
}

// Validate Update Product
const validateUpdateProductSchema = Joi.object({
  prod_id: Joi.number().required(),
  discount_percentage: Joi.number().required(),
  quantity: Joi.number().required(),
});

function validateUpdateProduct(data: any): {
  prod_id: number;
  discount_percentage: number;
  quantity: number;
} {
  const result = validateUpdateProductSchema.validate(data);
  if (result.error) {
    throw result.error;
  }
  return result.value;
}

export {
  validateProductId,
  validateCreateProduct,
  validateCategoryParam,
  validateUpdateProduct,
};






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