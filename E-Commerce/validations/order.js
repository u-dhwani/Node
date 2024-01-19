const Joi = require('joi');
const getOrderDetailsSchema = Joi.object({
    orderId: Joi.string().alphanum().length(24).hex().required(),
  });
  
  const validateGetOrderDetails = (data) => {
    const { error, value } = getOrderDetailsSchema.validate(data);
    if (error) {
      throw new Error(error.details.map((e) => e.message).join(', '));
    }
    return value;
  };
  
module.exports = {
    validateGetOrderDetails,
 
  
};
