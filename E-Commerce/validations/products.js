const Joi = require('joi');

const validateData = (data, schema) => {
  const { error, value } = schema.validate(data);
  if (error) {
    throw new Error(error.details.map((e) => e.message).join(', '));
  }
  return value;
};

const deleteProductSchema = Joi.object({
  prod_id: Joi.number().integer().positive().required(),
});

const createProductSchema = Joi.object({
  product_name: Joi.string().required(),
  description: Joi.string().required(),
  brand: Joi.string().required(),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  discount_percentage: Joi.number().min(0).max(100).required(),
  quantity: Joi.number().integer().positive().required(),
});

const categoryParamSchema = Joi.object({
  category: Joi.string().required(),
});

const updateProductSchema = Joi.object({
  prod_id: Joi.number().integer().positive().required(),
  discount_percentage: Joi.number().min(0).max(100).required(),
  quantity: Joi.number().integer().positive().required(),
});

module.exports = {
  validateProductId: (data) => validateData(data, deleteProductSchema),
  validateCreateProduct: (data) => validateData(data, createProductSchema),
  validateCategoryParam: (data) => validateData(data, categoryParamSchema),
  validateUpdateProduct: (data) => validateData(data, updateProductSchema),
};
