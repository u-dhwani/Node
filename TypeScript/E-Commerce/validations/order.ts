import * as Joi from 'joi';

const orderIdSchema = Joi.object({
  order_id: Joi.number().required(),
});

function validateGetOrderDetails(data: any): {
   order_id: number 
} {
  const result = orderIdSchema.validate(data);
  if (result.error) {
    throw result.error;
  }
  return result.value;
}

export { validateGetOrderDetails };
