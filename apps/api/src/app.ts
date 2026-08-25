import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './lib/errors.js';
import { authRouter } from './modules/identity/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { personalInfoRouter } from './modules/member/personal-info/personal-info.routes.js';

export const app = express();
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/member/profile', personalInfoRouter);
app.use(errorHandler);
