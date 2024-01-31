import {Functions} from '../library/functions';
import express, {  Request, Response, NextFunction } from 'express'; 
const functions = new Functions();

const checkAccess = (requiredRole: string) => async (req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | any> => {
    const user_role = (req as any).user.role;
  
    console.log(user_role);
    

    if (!user_role || user_role !== requiredRole) {
        const errorMessage = 'Forbidden - Insufficient permissions';
        const outputData = functions.output(403, errorMessage, null);
    
        res.status(403).json(outputData);
      } else {
        // User has the required role, proceed to the next middleware
        next();
      }
    };