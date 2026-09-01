import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverTasks } from './caregiver-tasks.service.js';

export const caregiverTasksRouter = Router();

caregiverTasksRouter.use(authenticate);
caregiverTasksRouter.use(allow('caregiver', 'admin'));

caregiverTasksRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const tasks = await getCaregiverTasks(req.user.sub);
    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});