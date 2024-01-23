import Joi from 'joi';

export const validateSignup = (data: any): Joi.ValidationResult => Joi.object({
  full_name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone_no: Joi.string().required(),
  address: Joi.string().required(),
  role: Joi.string().required(),
}).validate(data);

export const validateLogin = (data: any): Joi.ValidationResult => Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).validate(data);

export const validateDeleteByEmailSchema = (data: any): Joi.ValidationResult => Joi.object({
  email: Joi.string().email().required(),
}).validate(data);

export const validateUpdateProfile = (data: any): Joi.ValidationResult => Joi.object({
  email: Joi.string().email().required(),
  address: Joi.string().required(),
}).validate(data);

