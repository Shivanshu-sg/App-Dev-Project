import { Router } from 'express';
import { z } from 'zod';
import { login, register } from './auth.service.js';

const credentials = z.object({ email: z.string().email(), password: z.string().min(12).max(128) });
const registration = credentials.extend({
  role: z.enum(['member', 'caregiver', 'admin']).default('member'),
  name: z.string().max(255).optional(),
  occupation: z.string().max(255).optional(),
  phoneNumber: z.string().max(20).optional()
});
export const authRouter = Router();
authRouter.post('/register', async (req, res, next) => {
  try {
    console.log(req.body);
    const { email, password, role, name, occupation, phoneNumber} = registration.parse(req.body);
    res.status(201).json({ data: await register(email, password, role, name, occupation, phoneNumber  ) });
  } catch (error) { next(error); }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = credentials.parse(req.body);
    res.json({ data: await login(email, password) });
  } catch (error) { next(error); }
});
