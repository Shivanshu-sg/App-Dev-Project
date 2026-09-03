import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/authorize.js';
import {
  getAssistantHistory,
  sendAssistantMessage,
} from './assistant.service.js';

const assistantMessageSchema = z.object({
  message: z.string().min(1),
});

export const assistantRouter = Router();

assistantRouter.use(authenticate);

assistantRouter.get('/history', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const history = await getAssistantHistory(req.user.sub);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

assistantRouter.post('/chat', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = assistantMessageSchema.parse(req.body);
    const result = await sendAssistantMessage(req.user.sub, input);

    res.json({ data: result });
  } catch (error) {
    console.error(error);
    next(error);
  }
});