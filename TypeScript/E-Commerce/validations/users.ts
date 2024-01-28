import Joi,{ValidationResult} from 'joi';
import { Request, Response, NextFunction } from 'express';

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


export const validateSignupMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result: ValidationResult = validateSignup(req.body);

  if (result.error) {
    res.status(400).json({ error: result.error.details[0].message });
  }

  next();
};

export const validateLoginMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result: ValidationResult = validateLogin(req.body);

  if (result.error) {
    res.status(400).json({ error: result.error.details[0].message });
  }

  next();
};

export const validateDeleteByEmailMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result: ValidationResult = validateDeleteByEmailSchema(req.body);

  if (result.error) {
    res.status(400).json({ error: result.error.details[0].message });
  }

  next();
};

export const validateUpdateProfileMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const result: ValidationResult = validateUpdateProfile(req.body);

  if (result.error) {
    res.status(400).json({ error: result.error.details[0].message });
  }

  next();
};

