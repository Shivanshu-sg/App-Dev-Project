import { appDataSource } from '../../../database/data-source.js';
import { CaregiverAssignment } from '../../member/care-plans/care-giver-assignment.entity.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { User } from '../../identity/user.entity.js';

export const getCaregiverCheckIns = async (userId: string) => {
  const assignments = await appDataSource
    .getRepository(CaregiverAssignment)
    .find({
      where: { caregiverId: userId },
    });

  const memberIds = assignments.map((assignment) => assignment.userId);

  if (memberIds.length === 0) {
    return [];
  }

  const checkIns = await appDataSource
    .getRepository(CheckIn)
    .createQueryBuilder('checkIn')
    .leftJoinAndSelect('checkIn.carePlan', 'carePlan')
    .leftJoinAndSelect('checkIn.task', 'task')
    .where('checkIn.user_id IN (:...memberIds)', { memberIds })
    .orderBy('checkIn.check_in_date', 'DESC')
    .addOrderBy('checkIn.created_at', 'DESC')
    .getMany();

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