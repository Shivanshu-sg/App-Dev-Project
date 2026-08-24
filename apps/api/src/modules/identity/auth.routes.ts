import { Router } from 'express';
import { z } from 'zod';
import { login, register } from './auth.service.js';

const credentials = z.object({ email: z.string().email(), password: z.string().min(12).max(128) });
export const authRouter = Router();
authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    res.status(201).json({ data: await register(email, password) });
  } catch (error) { next(error); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    res.json({ data: await login(email, password) });
  } catch (error) { next(error); }
});
