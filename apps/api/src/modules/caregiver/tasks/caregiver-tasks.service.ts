import { appDataSource } from '../../../database/data-source.js';
import { CaregiverAssignment } from '../../member/care-plans/care-giver-assignment.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { User } from '../../identity/user.entity.js';

export const getCaregiverTasks = async (userId: string) => {
  const assignments = await appDataSource
    .getRepository(CaregiverAssignment)
    .find({
      where: { caregiverId: userId },
    });

  const memberIds = assignments.map((assignment) => assignment.userId);

  if (memberIds.length === 0) {
    return [];
  }

  const tasks = await appDataSource
    .getRepository(CarePlanTask)
    .createQueryBuilder('task')
    .innerJoinAndSelect('task.carePlan', 'carePlan')
    .where('carePlan.user_id IN (:...memberIds)', { memberIds })
    .orderBy('task.scheduled_time', 'ASC')
    .addOrderBy('task.created_at', 'DESC')
    .getMany();

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