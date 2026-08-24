import jwt from 'jsonwebtoken';
import type { Role } from '@lifely/contracts';
import { env } from '../config/env.js';

export interface TokenPayload { sub: string; email: string; role: Role; }
export const signToken = (payload: TokenPayload) => jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as TokenPayload;
