import { sign, verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface TokenData {
  email: string;
  role: string;
  user_id: bigint;
  
}

const secret='qwertyuiopasdfghjklzxcvbnm'

export function generateToken(data: TokenData): string {
  return sign(data, secret, { expiresIn: '1h' });
}

export function verifyToken(token: string): any {
  try {
    const decoded = verify(token, secret);
    return decoded;
  } catch (error) {
    return null;
  }
}
