import { In } from 'typeorm';
import { appDataSource } from '../../../database/data-source.js';
import { User } from '../../identity/user.entity.js';
import { CarePlan } from '../../member/care-plans/care-plans.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';
import { CaregiverAssignment } from '../../member/care-plans/care-giver-assignment.entity.js';
import { CaregiverNote } from '../../caregiver/notes/caregiver-notes.entity.js';

export const getAdminDashboard = async () => {
  const users = await appDataSource.getRepository(User).find();

  const totalUsers = users.length;
  const members = users.filter((user) => user.role === 'member');
  const caregivers = users.filter((user) => user.role === 'caregiver');
  const admins = users.filter((user) => user.role === 'admin');
  const activeUsers = users.filter((user) => user.isActive).length;

  const memberIds = members.map((member) => member.id);

  const totalCarePlans = await appDataSource.getRepository(CarePlan).count();
  const activeCarePlans = await appDataSource.getRepository(CarePlan).count({
    where: { status: 'active' },
  });

  const totalTasks = await appDataSource.getRepository(CarePlanTask).count();
  const pendingTasks = await appDataSource.getRepository(CarePlanTask).count({
    where: { status: 'pending' },
  });
  const missedTasks = await appDataSource.getRepository(CarePlanTask).count({
    where: { status: 'missed' },
  });

  const totalCheckIns = await appDataSource.getRepository(CheckIn).count();
  const missedCheckIns = await appDataSource.getRepository(CheckIn).count({
    where: { status: 'missed' },
  });

  const totalAssignments = await appDataSource
    .getRepository(CaregiverAssignment)
    .count();

  const unassignedMembers =
    memberIds.length === 0
      ? 0
      : members.length -
        new Set(
          (
            await appDataSource.getRepository(CaregiverAssignment).find({
              where: { userId: In(memberIds) },
            })
          ).map((assignment) => assignment.userId),
        ).size;

  const totalCaregiverNotes = await appDataSource
    .getRepository(CaregiverNote)
    .count();

  const recentUsers = await appDataSource.getRepository(User).find({
    order: { createdAt: 'DESC' },
    take: 6,
  });

  const recentCheckIns = await appDataSource.getRepository(CheckIn).find({
    relations: {
      carePlan: true,
      task: true,
      user: true,
    },
    order: {
      checkInDate: 'DESC',
      createdAt: 'DESC',
    },
    take: 6,
  });

  return {
    totalUsers,
    totalMembers: members.length,
    totalCaregivers: caregivers.length,
    totalAdmins: admins.length,
    activeUsers,
    totalCarePlans,
    activeCarePlans,
    totalTasks,
    pendingTasks,
    missedTasks,
    totalCheckIns,
    missedCheckIns,
    totalAssignments,
    unassignedMembers,
    totalCaregiverNotes,
    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    })),
    recentCheckIns: recentCheckIns.map((checkIn) => ({
      id: checkIn.id,
      memberEmail: checkIn.user?.email ?? 'Unknown member',
      carePlanTitle: checkIn.carePlan?.title ?? 'Care plan',
      taskTitle: checkIn.task?.title ?? 'Task',
      status: checkIn.status,
      checkInDate: checkIn.checkInDate,
    })),
  };
};