import { appDataSource } from '../../../database/data-source.js';
import { User } from '../../identity/user.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { CarePlan } from '../../member/care-plans/care-plans.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';

export const getCaregiverMembers = async () => {
  const members = await appDataSource.getRepository(User).find({
    where: { role: 'member', isActive: true },
    order: { createdAt: 'DESC' },
  });

  return Promise.all(
    members.map(async (member) => {
      const personalInfo = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: member.id } });

      const activeCarePlans = await appDataSource
        .getRepository(CarePlan)
        .count({ where: { userId: member.id, status: 'active' } });

      const carePlans = await appDataSource
        .getRepository(CarePlan)
        .find({ where: { userId: member.id } });

      const carePlanIds = carePlans.map((carePlan) => carePlan.id);

      let pendingTasks = 0;
      let missedCheckIns = 0;

      if (carePlanIds.length > 0) {
        pendingTasks = await appDataSource
          .getRepository(CarePlanTask)
          .createQueryBuilder('task')
          .where('task.care_plan_id IN (:...carePlanIds)', { carePlanIds })
          .andWhere('task.status = :status', { status: 'pending' })
          .getCount();

        missedCheckIns = await appDataSource
          .getRepository(CheckIn)
          .createQueryBuilder('checkIn')
          .where('checkIn.user_id = :userId', { userId: member.id })
          .andWhere('checkIn.status = :status', { status: 'missed' })
          .getCount();
      }

      return {
        id: member.id,
        email: member.email,
        role: member.role,
        firstName: personalInfo?.firstName ?? null,
        lastName: personalInfo?.lastName ?? null,
        phoneNumber: personalInfo?.phoneNumber ?? null,
        disabilityType: personalInfo?.disabilityType ?? null,
        mobilityLevel: personalInfo?.mobilityLevel ?? null,
        activeCarePlans,
        pendingTasks,
        missedCheckIns,
      };
    }),
  );
};