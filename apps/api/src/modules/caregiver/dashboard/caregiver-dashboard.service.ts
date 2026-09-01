import { In } from 'typeorm';
import { appDataSource } from '../../../database/data-source.js';
import { CaregiverAssignment } from '../../member/care-plans/care-giver-assignment.entity.js';
import { CarePlan } from '../../member/care-plans/care-plans.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';

const todayString = () => new Date().toISOString().slice(0, 10);

export const getCaregiverDashboard = async (caregiverId: string) => {
  const assignments = await appDataSource
    .getRepository(CaregiverAssignment)
    .find({
      where: { caregiverId },
      relations: { user: true },
    });

  const uniqueMemberIds = [
    ...new Set(assignments.map((assignment) => assignment.userId)),
  ];

  if (uniqueMemberIds.length === 0) {
    return {
      assignedMembers: 0,
      activeCarePlans: 0,
      pendingTasks: 0,
      missedCheckIns: 0,
      todayCheckIns: 0,
      membersNeedingAttention: [],
      recentCheckIns: [],
      highPriorityTasks: [],
    };
  }

  const carePlans = await appDataSource.getRepository(CarePlan).find({
    where: { userId: In(uniqueMemberIds) },
  });

  const carePlanIds = carePlans.map((carePlan) => carePlan.id);

  const activeCarePlans = carePlans.filter(
    (carePlan) => carePlan.status === 'active',
  ).length;

  let pendingTasks = 0;
  let highPriorityTasks: CarePlanTask[] = [];

  if (carePlanIds.length > 0) {
    pendingTasks = await appDataSource.getRepository(CarePlanTask).count({
      where: {
        carePlanId: In(carePlanIds),
        status: 'pending',
      },
    });

    highPriorityTasks = await appDataSource.getRepository(CarePlanTask).find({
      where: {
        carePlanId: In(carePlanIds),
        priority: 'high',
        status: 'pending',
      },
      relations: {
        carePlan: true,
      },
      order: {
        scheduledTime: 'ASC',
        createdAt: 'DESC',
      },
      take: 6,
    });
  }

  const missedCheckIns = await appDataSource.getRepository(CheckIn).count({
    where: {
      userId: In(uniqueMemberIds),
      status: 'missed',
    },
  });

  const todayCheckIns = await appDataSource.getRepository(CheckIn).count({
    where: {
      userId: In(uniqueMemberIds),
      checkInDate: new Date(todayString()),
    },
  });

  const recentCheckIns = await appDataSource.getRepository(CheckIn).find({
    where: {
      userId: In(uniqueMemberIds),
    },
    relations: {
      task: true,
      carePlan: true,
    },
    order: {
      checkInDate: 'DESC',
      createdAt: 'DESC',
    },
    take: 6,
  });

  const membersNeedingAttention = await Promise.all(
    uniqueMemberIds.map(async (memberId) => {
      const memberCarePlans = carePlans.filter(
        (carePlan) => carePlan.userId === memberId,
      );

      const memberCarePlanIds = memberCarePlans.map((carePlan) => carePlan.id);

      let memberPendingTasks = 0;

      if (memberCarePlanIds.length > 0) {
        memberPendingTasks = await appDataSource
          .getRepository(CarePlanTask)
          .count({
            where: {
              carePlanId: In(memberCarePlanIds),
              status: 'pending',
            },
          });
      }

      const memberMissedCheckIns = await appDataSource
        .getRepository(CheckIn)
        .count({
          where: {
            userId: memberId,
            status: 'missed',
          },
        });

      const personalInfo = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: memberId } });

      const assignment = assignments.find((item) => item.userId === memberId);

      const memberName =
        `${personalInfo?.firstName ?? ''} ${personalInfo?.lastName ?? ''}`.trim() ||
        assignment?.user?.email ||
        'Unknown member';

      return {
        id: memberId,
        name: memberName,
        email: assignment?.user?.email ?? null,
        pendingTasks: memberPendingTasks,
        missedCheckIns: memberMissedCheckIns,
      };
    }),
  );

  return {
    assignedMembers: uniqueMemberIds.length,
    activeCarePlans,
    pendingTasks,
    missedCheckIns,
    todayCheckIns,
    membersNeedingAttention: membersNeedingAttention.filter(
      (member) => member.pendingTasks > 0 || member.missedCheckIns > 0,
    ),
    recentCheckIns: recentCheckIns.map((checkIn) => ({
      id: checkIn.id,
      memberId: checkIn.userId,
      carePlanTitle: checkIn.carePlan?.title ?? 'Care plan',
      taskTitle: checkIn.task?.title ?? 'Task',
      status: checkIn.status,
      checkInDate: checkIn.checkInDate,
      notes: checkIn.notes,
    })),
    highPriorityTasks: highPriorityTasks.map((task) => ({
      id: task.id,
      carePlanId: task.carePlanId,
      carePlanTitle: task.carePlan?.title ?? 'Care plan',
      memberId: task.carePlan?.userId,
      title: task.title,
      scheduledTime: task.scheduledTime,
      priority: task.priority,
      status: task.status,
    })),
  };
};