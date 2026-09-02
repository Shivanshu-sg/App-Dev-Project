import { Router } from 'express';
import { z } from 'zod';
import { authenticate, allow } from '../../../middleware/authorize.js';
import {
  createCaregiverNote,
  deleteCaregiverNote,
  getCaregiverNotes,
  updateCaregiverNote,
} from './caregiver-notes.service.js';

const caregiverNoteSchema = z.object({
  note: z.string().min(1),
  category: z
    .enum(['general', 'health', 'medication', 'mood', 'task', 'emergency'])
    .default('general'),
  isImportant: z.boolean().default(false),
});

const updateCaregiverNoteSchema = caregiverNoteSchema.partial();

export const caregiverNoteRouter = Router();

caregiverNoteRouter.use(authenticate);
caregiverNoteRouter.use(allow('caregiver', 'admin'));

caregiverNoteRouter.get('/:memberId/notes', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const notes = await getCaregiverNotes(req.user.sub, req.params.memberId);
    res.json({ data: notes });
  } catch (error) {
    next(error);
  }
});

caregiverNoteRouter.post('/:memberId/notes', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = caregiverNoteSchema.parse(req.body);
    const note = await createCaregiverNote(
      req.user.sub,
      req.params.memberId,
      input,
    );

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
});

caregiverNoteRouter.put('/:memberId/notes/:noteId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = updateCaregiverNoteSchema.parse(req.body);

    const note = await updateCaregiverNote(
      req.user.sub,
      req.params.memberId,
      req.params.noteId,
      input,
    );

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
});

caregiverNoteRouter.delete('/:memberId/notes/:noteId', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const result = await deleteCaregiverNote(
      req.user.sub,
      req.params.memberId,
      req.params.noteId,
    );

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});