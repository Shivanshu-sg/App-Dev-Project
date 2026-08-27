import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/authorize.js';
import {
  createCarePlan,
  createCarePlanAssignment,
  deleteCarePlan,
  getCarePlanById,
  getCarePlans,
  updateCarePlan,
} from './care-plans.service.js';

const emptyStringToNull = (value: unknown) => {
  return value === '' ? null : value;
};

const carePlanSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  conditionFocus: z.preprocess(
    emptyStringToNull,
    z.string().max(150).optional().nullable(),
  ),
  startDate: z.string().min(1),
  endDate: z.preprocess(emptyStringToNull, z.string().optional().nullable()),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  caregiverId: z.string(),
});

const updateCarePlanSchema = carePlanSchema.partial();

export const carePlanRouter = Router();

carePlanRouter.use(authenticate);

carePlanRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const carePlans = await getCarePlans(req.user.sub);
    res.json({ data: carePlans });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanRouter.get('/:id', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const carePlan = await getCarePlanById(req.user.sub, req.params.id);
    res.json({ data: carePlan });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanRouter.post('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = carePlanSchema.parse(req.body);
    const carePlan = await createCarePlan(req.user.sub, req.user.sub, input);
    const carePlanAssignment = await createCarePlanAssignment(
      req.user.sub,
      input.caregiverId,
      req.user.sub,
      carePlan.id,
    );

    res.status(201).json({ data: carePlan });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanRouter.put('/:id', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = updateCarePlanSchema.parse(req.body);
    const carePlan = await updateCarePlan(req.user.sub, req.params.id, input);

    res.json({ data: carePlan });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

carePlanRouter.delete('/:id', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await deleteCarePlan(req.user.sub, req.params.id);
    res.json({ data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
});