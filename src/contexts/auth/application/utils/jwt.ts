import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface TokenPayload {
  sub: string;
  jti?: string;
}

export function generateAccessToken(userId: string): string {
  const payload: TokenPayload = { sub: userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string): string {
  const payload: TokenPayload = { sub: userId, jti: uuidv4() };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken<T extends object>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
