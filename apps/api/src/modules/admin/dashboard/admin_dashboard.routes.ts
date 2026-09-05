import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getAdminDashboard } from './admin_dashboard.service.js';

export const adminDashboardRouter = Router();

adminDashboardRouter.use(authenticate);
adminDashboardRouter.use(allow('admin'));

adminDashboardRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const dashboard = await getAdminDashboard();
    res.json({ data: dashboard });
  } catch (error) {
    next(error);
  }
});