import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverCheckIns } from './caregiver-check-in.service.js';

export const caregiverCheckInsRouter = Router();

caregiverCheckInsRouter.use(authenticate);
caregiverCheckInsRouter.use(allow('caregiver', 'admin'));

caregiverCheckInsRouter.get('/', async (_req, res, next) => {
  try {
    const checkIns = await getCaregiverCheckIns();
    res.json({ data: checkIns });
  } catch (error) {
    next(error);
  }
});