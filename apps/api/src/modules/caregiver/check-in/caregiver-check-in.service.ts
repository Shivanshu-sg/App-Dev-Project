import { appDataSource } from '../../../database/data-source.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { User } from '../../identity/user.entity.js';

export const getCaregiverCheckIns = async () => {
  const checkIns = await appDataSource.getRepository(CheckIn).find({
    relations: {
      carePlan: true,
      task: true,
    },
    order: {
      checkInDate: 'DESC',
      createdAt: 'DESC',
    },
  });

  return Promise.all(
    checkIns.map(async (checkIn) => {
      const member = await appDataSource.getRepository(User).findOne({
        where: { id: checkIn.userId },
      });

      const personalInfo = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: checkIn.userId } });

      const memberName =
        `${personalInfo?.firstName ?? ''} ${personalInfo?.lastName ?? ''}`.trim() ||
        member?.email ||
        'Unknown member';

      return {
        id: checkIn.id,
        userId: checkIn.userId,
        memberName,
        carePlanId: checkIn.carePlanId,
        carePlanTitle: checkIn.carePlan?.title ?? 'Care plan',
        taskId: checkIn.taskId,
        taskTitle: checkIn.task?.title ?? 'Task',
        checkInDate: checkIn.checkInDate,
        status: checkIn.status,
        notes: checkIn.notes,
        completedAt: checkIn.completedAt,
        createdAt: checkIn.createdAt,
        updatedAt: checkIn.updatedAt,
      };
    }),
  );
};