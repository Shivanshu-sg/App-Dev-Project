import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getCaregiverMemberDetails, getCaregiverMembers } from './caregiver-members.service.js';

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


caregiverMembersRouter.get('/:memberId', async (req, res, next) => {
  try {
    const member = await getCaregiverMemberDetails(req.params.memberId);
    res.json({ data: member });
  } catch (error) {
    next(error);
  }
});