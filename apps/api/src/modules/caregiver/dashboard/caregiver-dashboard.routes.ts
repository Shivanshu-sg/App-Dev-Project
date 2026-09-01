import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverDashboard } from './caregiver-dashboard.service.js';

export const caregiverDashboardRouter = Router();

caregiverDashboardRouter.use(authenticate);
caregiverDashboardRouter.use(allow('caregiver', 'admin'));

caregiverDashboardRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const dashboard = await getCaregiverDashboard(req.user.sub);
    res.json({ data: dashboard });
  } catch (error) {
    next(error);
  }
});