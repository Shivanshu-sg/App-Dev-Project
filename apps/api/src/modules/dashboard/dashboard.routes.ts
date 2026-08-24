import { Router } from 'express';
import { authenticate } from '../../middleware/authorize.js';

export const dashboardRouter = Router();
dashboardRouter.get('/summary', authenticate, async (_req, res) => {
  // Replace with a dashboard projection service backed by PostgreSQL/Redis.
  res.json({ data: { medicationsDue: 0, appointmentsToday: 0, tasksRemaining: 0 } });
});
