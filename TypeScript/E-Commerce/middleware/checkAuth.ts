import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwttoken';

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


export const role_access = (requiredRole: string) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user_role = (req as any).user.role;

  console.log(user_role);
  if (!user_role || user_role !== requiredRole) {
    res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
    return;
  }

  // User has the required role, proceed to the next middleware
  next();
};

