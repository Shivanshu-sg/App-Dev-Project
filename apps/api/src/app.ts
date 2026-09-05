import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './lib/errors.js';
import { authRouter } from './modules/identity/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { personalInfoRouter } from './modules/member/personal-info/personal-info.routes.js';
import { carePlanRouter } from './modules/member/care-plans/care-plans.routes.js';
import { carePlanTaskRouter } from './modules/member/care-plan-tasks/care_plan_tasks.routes.js';
import { checkInRouter } from './modules/member/check-ins/check_in.route.js';
import CareGiverRouter from './modules/caregiver/caregiver.routes.js';
import { caregiverMembersRouter } from './modules/caregiver/members/caregiver-members.route.js';
import { caregiverTasksRouter } from './modules/caregiver/tasks/caregiver-task.route.js';
import { caregiverCheckInsRouter } from './modules/caregiver/check-in/caregiver-checkin.route.js';
import { caregiverDashboardRouter } from './modules/caregiver/dashboard/caregiver-dashboard.routes.js';
import { caregiverNoteRouter } from './modules/caregiver/notes/caregiver-notes.route.js';
import { memberCaregiverNotesRouter } from './modules/member/notes/member-notes.route.js';
import { assistantRouter } from './modules/member/assistant/assistant.routes.js';
import { adminDashboardRouter } from './modules/admin/dashboard/admin_dashboard.routes.js';
import { adminUsersRouter } from './modules/admin/users/admin_users.routes.js';

export const app = express();
app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/member/profile', personalInfoRouter);
app.use('/api/v1/member/care-plans', carePlanRouter);
app.use('/api/v1/member/care-plans-tasks', carePlanTaskRouter);
app.use('/api/v1/member/check-ins', checkInRouter);
app.use('/api/v1/member/caregiver-notes', memberCaregiverNotesRouter);
app.use('/api/v1/assistant', assistantRouter);

app.use('/api/v1/caregiver', CareGiverRouter);
app.use('/api/v1/caregiver/dashboard', caregiverDashboardRouter);
app.use('/api/v1/caregiver/members', caregiverMembersRouter);
app.use('/api/v1/caregiver/tasks', caregiverTasksRouter);
app.use('/api/v1/caregiver/check-ins', caregiverCheckInsRouter);
app.use('/api/v1/caregiver/notes', caregiverNoteRouter);

app.use('/api/v1/admin/dashboard', adminDashboardRouter);
app.use('/api/v1/admin/users', adminUsersRouter);

app.use(errorHandler);
