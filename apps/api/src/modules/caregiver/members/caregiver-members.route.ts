import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverMembers } from './caregiver-members.service.js';

export const caregiverMembersRouter = Router();

caregiverMembersRouter.use(authenticate);
caregiverMembersRouter.use(allow('caregiver', 'admin'));

caregiverMembersRouter.get('/', async (_req, res, next) => {
  try {
    const members = await getCaregiverMembers();
    res.json({ data: members });
  } catch (error) {
    next(error);
  }
});