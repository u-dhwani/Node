import { Functions } from '../library/functions';
import express, { Request, Response, NextFunction } from 'express';
const functions = new Functions();
import { constants } from "../constants";
import * as Joi from 'joi';
import { sign, verify } from 'jsonwebtoken';

export interface TokenData {
  email: string;
  role: string;
  user_id: bigint;

}

export function checkAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('Authorization');

  if (!token) {

    res.send(functions.output(401, 'Unauthorized - No token provided', null));
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.send(functions.output(401, 'Unauthorized - Invalid token', null));
    return;
  }

  // Attach the decoded user information to the request
  (req as any).user = {
    user_id: decoded.user_id,
    role: decoded.role
    // Other properties from decoded if needed
  };
  console.log("req:" + (req as any).user.user_id);
  next();
}

export const checkAccess = (requiredRole: string) => async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | any> => {
  const user_role = (req as any).user.role;

  console.log(user_role);
  console.log("checkaccess" + (req as any).user.user_id);

  if (!user_role || user_role !== requiredRole) {
    return res.send(functions.output(403, 'UnAuthorized', null));


  } else {
    // User has the required role, proceed to the next middleware
    next();
  }
};


export function generateToken(data: TokenData): string {
  return sign(data, constants.secret, { expiresIn: '1h' });
}

export function verifyToken(token: string): any {
  try {
    const decoded = verify(token, constants.secret);
    return decoded;
  } catch (error) {
    return null;
  }
}


export function getPageNumber(req: any): number {
  const schema = Joi.object({
    page: Joi.number().integer().positive().optional() // Make 'page' optional
  });

  const { error, value } = schema.validate({ page: req.query.page });
  
  if (error) {
    throw new Error(error.details[0].message);
  }

  if (!value || !value.page) {
    console.log("Page number not provided, returning default value (1)");
    return 1; // Return default value if 'page' is not provided
  }

  console.log("Page number: " + value.page);
  return value.page;
}
