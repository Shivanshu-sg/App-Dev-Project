import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../../middleware/authorize.js';
import { sendAssistantMessage } from './assistant.service.js';

const assistantMessageSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
});

export const assistantRouter = Router();

assistantRouter.use(authenticate);

assistantRouter.post('/chat', async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const input = assistantMessageSchema.parse(req.body);
    const result = await sendAssistantMessage(input);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});