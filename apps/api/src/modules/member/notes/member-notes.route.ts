import { Router } from 'express';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getMemberCaregiverNotes } from './member-notes.service.js';

export const memberCaregiverNotesRouter = Router();

memberCaregiverNotesRouter.use(authenticate);
memberCaregiverNotesRouter.use(allow('member', 'admin'));

memberCaregiverNotesRouter.get('/', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const notes = await getMemberCaregiverNotes(req.user.sub);
    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
});