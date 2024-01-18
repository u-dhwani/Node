const Joi = require('joi');

const updateProductQuantitySchema = Joi.object({
    prod_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
  });
  
  const validateUpdateProductQuantity = (data) => {
    const { error, value } = updateProductQuantitySchema.validate(data);
    if (error) {
      throw new Error(error.details.map((e) => e.message).join(', '));
    }
    return value;
  };
  

module.exports = {
 
  updateProductQuantitySchema,
  
  
};
