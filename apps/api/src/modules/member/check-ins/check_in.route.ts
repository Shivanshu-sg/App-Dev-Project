import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/authorize.js';
import {
  createCheckIn,
  deleteCheckIn,
  getCheckInById,
  getCheckIns,
  getCheckInsByCarePlan,
  getCheckInsByDate,
  getCheckInsByTask,
  updateCheckIn,
} from './check_in.service.js';

const emptyStringToNull = (value: unknown) => {
  return value === '' ? null : value;
};

const checkInSchema = z.object({
  carePlanId: z.string().uuid(),
  taskId: z.string().uuid(),
  checkInDate: z.coerce.date(),
  status: z.enum(['done', 'missed', 'skipped']),
  notes: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
});

const updateCheckInSchema = z.object({
  status: z.enum(['done', 'missed', 'skipped']).optional(),
  notes: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
});

export const checkInRouter = Router();

checkInRouter.use(authenticate);

checkInRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const checkIns = await getCheckIns(req.user.sub);
    console.log('checkIns:', checkIns); // Log the check-ins for debugging
    res.json({ data: checkIns });
  } catch (error) {
    next(error);
  }
});

checkInRouter.get('/date/:checkInDate', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const checkIns = await getCheckInsByDate(
      req.user.sub,
      new Date(req.params.checkInDate),
    );

    res.json({ data: checkIns });
  } catch (error) {
    next(error);
  }
});

checkInRouter.get('/care-plan/:carePlanId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const checkIns = await getCheckInsByCarePlan(
      req.user.sub,
      req.params.carePlanId,
    );

    res.json({ data: checkIns });
  } catch (error) {
    next(error);
  }
});

checkInRouter.get(
  '/care-plan/:carePlanId/task/:taskId/date/:checkInDate',
  async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      const checkIns = await getCheckInsByTask(
        req.user.sub,
        req.params.carePlanId,
        req.params.taskId,
        new Date(req.params.checkInDate),
      );

      res.json({ data: checkIns });
    } catch (error) {
      next(error);
    }
  },
);

checkInRouter.get('/:checkInId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const checkIn = await getCheckInById(req.user.sub, req.params.checkInId);
    res.json({ data: checkIn });
  } catch (error) {
    next(error);
  }
});

checkInRouter.post('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = checkInSchema.parse(req.body);
    const checkIn = await createCheckIn(req.user.sub, input);

    res.status(201).json({ data: checkIn });
  } catch (error) {
    next(error);
  }
});

checkInRouter.put('/:checkInId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = updateCheckInSchema.parse(req.body);
    const checkIn = await updateCheckIn(
      req.user.sub,
      req.params.checkInId,
      input,
    );

    res.json({ data: checkIn });
  } catch (error) {
    next(error);
  }
});

checkInRouter.delete('/:checkInId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await deleteCheckIn(req.user.sub, req.params.checkInId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});