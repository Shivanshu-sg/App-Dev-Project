import { Router } from 'express';
import { z } from 'zod';
import { authenticate, allow } from '../../../middleware/authorize.js';
import { getAdminUsers, updateUserStatus } from './admin_users.service.js';

const updateStatusSchema = z.object({
  isActive: z.boolean(),
});

export const adminUsersRouter = Router();

adminUsersRouter.use(authenticate);
adminUsersRouter.use(allow('admin'));

adminUsersRouter.get('/', async (_req, res, next) => {
  try {
    const users = await getAdminUsers();
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
});

adminUsersRouter.patch('/:userId/status', async (req, res, next) => {
  try {
    const input = updateStatusSchema.parse(req.body);
    const user = await updateUserStatus(req.params.userId, input.isActive);

    res.json({
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});