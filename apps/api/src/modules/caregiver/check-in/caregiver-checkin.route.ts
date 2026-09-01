import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverCheckIns } from './caregiver-check-in.service.js';

export const caregiverCheckInsRouter = Router();

caregiverCheckInsRouter.use(authenticate);
caregiverCheckInsRouter.use(allow('caregiver', 'admin'));

caregiverCheckInsRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const checkIns = await getCaregiverCheckIns(req.user.sub);
    res.json({ data: checkIns });
  } catch (error) {
    next(error);
  }
});