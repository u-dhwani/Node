const Joi = require('joi');
const controller_users = require('../controller/users');

const validateData = (data, schema) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new Error(error.details.map((e) => e.message).join(', '));
  }
  return value;
};

const signupSchema = Joi.object({
  full_name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone_no: Joi.string().pattern(/^\d{10}$/).required(),
  address: Joi.string().required(),
  role: Joi.string().valid('admin', 'user', 'seller').required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const deleteByEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

const updateProfileSchema = Joi.object({
  email: Joi.string().email().required(),
  address: Joi.string().required(),
});

const deleteProductSchema = Joi.object({
  prod_id: Joi.number().integer().positive().required(),
});

module.exports = {
  handleSignup: async (req, res) => {
    try {
      const validatedData = validateData(req.body, signupSchema);
      controller_users.signUpUser(req, res, validatedData);
    } catch (error) {
      console.error('Error in signup validation:', error);
      res.status(400).json({ error: 'Validation error', details: error.message });
    }
  },

  validateLogin: (data) => validateData(data, loginSchema),
  validateDeleteByEmail: (data) => validateData(data, deleteByEmailSchema),
  validateUpdateProfile: (data) => validateData(data, updateProfileSchema),
  validateDeleteProduct: (data) => validateData(data, deleteProductSchema),
};
