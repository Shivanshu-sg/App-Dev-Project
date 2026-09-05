// import { Router } from 'express';
// import { authenticate, allow } from '../../../middleware/authorize.js';
// import { getAdminDashboard } from '../dashboard/admin_dashboard.service.js';


// export const adminCheckInRouter = Router();

// adminCheckInRouter.use(authenticate);
// adminCheckInRouter.use(allow('admin'));

// adminCheckInRouter.get('/', async (req, res, next) => {
//   try {
//     if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

//     const checkIns = await getCheckIns();
//     res.json({ data: checkIns });
//   } catch (error) {
//     next(error);
//   }
// });