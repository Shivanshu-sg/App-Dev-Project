import { appDataSource } from '../../../database/data-source.js';
import { CarePlan } from '../../member/care-plans/care-plans.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { User } from '../../identity/user.entity.js';

export const getCaregiverTasks = async () => {
  const tasks = await appDataSource.getRepository(CarePlanTask).find({
    relations: {
      carePlan: true,
    },
    order: {
      scheduledTime: 'ASC',
      createdAt: 'DESC',
    },
  });

  return Promise.all(
    tasks.map(async (task) => {
      const member = await appDataSource.getRepository(User).findOne({
        where: { id: task.carePlan.userId },
      });

      const personalInfo = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: task.carePlan.userId } });

      const memberName =
        `${personalInfo?.firstName ?? ''} ${personalInfo?.lastName ?? ''}`.trim() ||
        member?.email ||
        'Unknown member';

      return {
        id: task.id,
        carePlanId: task.carePlanId,
        carePlanTitle: task.carePlan.title,
        memberId: task.carePlan.userId,
        memberName,
        title: task.title,
        description: task.description,
        taskType: task.taskType,
        scheduledTime: task.scheduledTime,
        frequency: task.frequency,
        nextCheckIn: task.nextCheckIn,
        priority: task.priority,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    }),
  );
};