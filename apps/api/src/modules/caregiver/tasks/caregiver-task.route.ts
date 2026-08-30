import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverTasks } from './caregiver-tasks.service.js';

export const caregiverTasksRouter = Router();

caregiverTasksRouter.use(authenticate);
caregiverTasksRouter.use(allow('caregiver', 'admin'));

caregiverTasksRouter.get('/', async (_req, res, next) => {
  try {
    const tasks = await getCaregiverTasks();
    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
});