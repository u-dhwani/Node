import * as Joi from 'joi';

export const updateProductQuantitySchema = Joi.object({
  prod_id: Joi.number().required(),
  quantity: Joi.number().required(),
});

export const productIdSchema = Joi.object({
  prod_id: Joi.number().required(),
});

export function validateUpdateProductQuantity(data: any): ValidationResult {
  const result = updateProductQuantitySchema.validate(data);

  if (result.error) {
    // If there is an error in validation, return an object with an 'error' property
    return { error: result.error };
  }

  // If validation is successful, return the validated value
  return { value: result.value };
}

export function validateProductId(data: any): ValidationResult {
  const result = productIdSchema.validate(data);

  if (result.error) {
    // If there is an error in validation, return an object with an 'error' property
    return { error: result.error };
  }

  // If validation is successful, return the validated value
  return { value: result.value };
}

interface ValidationResult {
  error?: Joi.ValidationError;
  value?: any;
};