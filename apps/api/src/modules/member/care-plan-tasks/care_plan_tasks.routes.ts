import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/authorize.js';
import {
  createCarePlanTask,
  deleteCarePlanTask,
  getCarePlanTaskById,
  getCarePlanTasks,
  updateCarePlanTask,
} from './care_plan_tasks.service.js';

const emptyStringToNull = (value: unknown) => {
  return value === '' ? null : value;
};

const carePlanTaskSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  taskType: z.enum(['exercise', 'routine', 'therapy', 'selfcare', 'other']),
  scheduledTime: z.preprocess(
    emptyStringToNull,
    z.coerce.date().optional().nullable(),
  ),
  frequency: z.preprocess(
    emptyStringToNull,
    z.string().max(100).optional().nullable(),
  ),
  priority: z.enum(['low', 'med', 'high']).default('med'),
  status: z.enum(['pending', 'done', 'missed', 'skipped']).default('pending'),
});

const updateCarePlanTaskSchema = carePlanTaskSchema.partial();

export const carePlanTaskRouter = Router();

carePlanTaskRouter.use(authenticate);

carePlanTaskRouter.get('/:carePlanId/tasks', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const tasks = await getCarePlanTasks(req.user.sub, req.params.carePlanId);
    res.json({ data: tasks });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanTaskRouter.get('/:carePlanId/tasks/:taskId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const task = await getCarePlanTaskById(
      req.user.sub,
      req.params.carePlanId,
      req.params.taskId,
    );

    res.json({ data: task });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanTaskRouter.post('/:carePlanId/tasks', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = carePlanTaskSchema.parse(req.body);
    const task = await createCarePlanTask(
      req.user.sub,
      req.params.carePlanId,
      input,
    );

    res.status(201).json({ data: task });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanTaskRouter.put('/:carePlanId/tasks/:taskId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = updateCarePlanTaskSchema.parse(req.body);
    const task = await updateCarePlanTask(
      req.user.sub,
      req.params.carePlanId,
      req.params.taskId,
      input,
    );

    res.json({ data: task });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanTaskRouter.delete('/:carePlanId/tasks/:taskId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await deleteCarePlanTask(
      req.user.sub,
      req.params.carePlanId,
      req.params.taskId,
    );

    res.json({ data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
});