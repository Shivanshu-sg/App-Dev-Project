import { appDataSource } from '../../../database/data-source.js';
import { User } from '../../identity/user.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';
import { CarePlan } from '../../member/care-plans/care-plans.entity.js';
import { CarePlanTask } from '../../member/care-plan-tasks/care_plan_tasks.entity.js';
import { CheckIn } from '../../member/check-ins/check_in.entity.js';
import { AppError } from '../../../lib/errors.js';

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

export const getCaregiverMemberDetails = async (memberId: string) => {
  const member = await appDataSource.getRepository(User).findOne({
    where: {
      id: memberId,
      role: 'member',
      isActive: true,
    },
  });

  if (!member) throw new AppError(404, 'Member not found');

  const personalInfo = await appDataSource
    .getRepository(PersonalInfo)
    .findOne({ where: { userId: member.id } });

  const carePlans = await appDataSource.getRepository(CarePlan).find({
    where: { userId: member.id },
    order: { createdAt: 'DESC' },
  });

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

  const activeCarePlans = carePlans.filter(
    (carePlan) => carePlan.status === 'active',
  ).length;

  const recentCheckIns = await appDataSource.getRepository(CheckIn).find({
    where: { userId: member.id },
    relations: {
      task: true,
      carePlan: true,
    },
    order: { checkInDate: 'DESC', createdAt: 'DESC' },
    take: 10,
  });

  return {
    id: member.id,
    email: member.email,
    role: member.role,
    firstName: personalInfo?.firstName ?? null,
    lastName: personalInfo?.lastName ?? null,
    phoneNumber: personalInfo?.phoneNumber ?? null,
    dateOfBirth: personalInfo?.dateOfBirth ?? null,
    gender: personalInfo?.gender ?? null,
    emergencyContactName: personalInfo?.emergencyContactName ?? null,
    emergencyContactPhone: personalInfo?.emergencyContactPhone ?? null,
    address: personalInfo?.address ?? null,
    city: personalInfo?.city ?? null,
    state: personalInfo?.state ?? null,
    postalCode: personalInfo?.postalCode ?? null,
    country: personalInfo?.country ?? null,
    disabilityType: personalInfo?.disabilityType ?? null,
    mobilityLevel: personalInfo?.mobilityLevel ?? null,
    wheelchairUser: personalInfo?.wheelchairUser ?? null,
    fatigueTrigger: personalInfo?.fatigueTrigger ?? null,
    medicationRoutine: personalInfo?.medicationRoutine ?? null,
    workStudySchedule: personalInfo?.workStudySchedule ?? null,
    accessibilityNeeds: personalInfo?.accessibilityNeeds ?? null,
    activeCarePlans,
    pendingTasks,
    missedCheckIns,
    carePlans,
    recentCheckIns,
  };
};