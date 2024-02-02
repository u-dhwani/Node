import {Functions} from '../library/functions';
import express, {  Request, Response, NextFunction } from 'express'; 
const functions = new Functions();
import { constants } from "../constants";
import { sign, verify } from 'jsonwebtoken';

export interface TokenData {
  email: string;
  role: string;
  user_id: bigint;
  
}

export function checkAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.header('Authorization');

  if (!token) {
    res.status(401).json({ message: 'Unauthorized - No token provided' });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
    return;
  }

  // Attach the decoded user information to the request
  (req as any).user = {
    user_id: decoded.user_id,
    role:decoded.role
    // Other properties from decoded if needed
  };
  console.log("req:"+(req as any).user.user_id);
  next();
}

export const checkAccess = (requiredRole: string) => async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | any> => {
    const user_role = (req as any).user.role;
  
    console.log(user_role);
    console.log("checkaccess"+(req as any).user.user_id);

    if (!user_role || user_role !== requiredRole) {
        const errorMessage = 'Forbidden - Insufficient permissions';
        const outputData = functions.output(403, errorMessage, null);
    
        res.status(403).json(outputData);
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