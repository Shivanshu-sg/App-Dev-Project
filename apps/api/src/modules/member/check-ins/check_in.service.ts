import { appDataSource } from '../../../database/data-source.js';
import { AppError } from '../../../lib/errors.js';
import { CarePlan } from '../care-plans/care-plans.entity.js';
import { CarePlanTask } from '../care-plan-tasks/care_plan_tasks.entity.js';
import { CheckIn, DailyCheckInStatus } from './check_in.entity.js';
import { LessThanOrEqual } from 'typeorm';
import { response } from 'express';


type CheckInInput = {
  carePlanId: string;
  taskId: string;
  checkInDate: Date;
  status: DailyCheckInStatus;
  notes?: string | null;
};

type UpdateCheckInInput = {
  status?: DailyCheckInStatus;
  notes?: string | null;
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfToday = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const getNextCheckInDate = (currentDate: Date, frequency: string | null) => {
  if (frequency === 'Daily') return addDays(currentDate, 1);
  if (frequency === 'Weekly') return addDays(currentDate, 7);
  return null;
};

export const generateDueCheckIns = async (userId: string) => {
  const taskRepo = appDataSource.getRepository(CarePlanTask);
  const checkInRepo = appDataSource.getRepository(CheckIn);

  const today = startOfToday();
  const todayEnd = endOfToday();

  await checkInRepo
    .createQueryBuilder()
    .update(CheckIn)
    .set({ status: 'missed' })
    .where('user_id = :userId', { userId })
    .andWhere('status = :status', { status: 'pending' })
    .andWhere('check_in_date < :today', { today })
    .execute();

  const dueTasks = await taskRepo.find({
    where: {
      nextCheckIn: LessThanOrEqual(todayEnd),
    },
    relations: {
      carePlan: true,
    },
  });

  const userDueTasks = dueTasks.filter((task) => {
    return task.carePlan.userId === userId;
  });

  for (const task of userDueTasks) {
    if (!task.nextCheckIn) continue;

    const checkInDate = startOfToday();

    const existingCheckIn = await checkInRepo.findOne({
      where: {
        taskId: task.id,
        checkInDate,
      },
    });

    if (existingCheckIn) continue;

    const checkIn = checkInRepo.create({
      userId,
      carePlanId: task.carePlanId,
      taskId: task.id,
      checkInDate,
      status: 'pending',
      notes: null,
      completedAt: null,
    });

    await checkInRepo.save(checkIn);

    task.nextCheckIn = getNextCheckInDate(task.nextCheckIn, task.frequency);
    await taskRepo.save(task);
  }
};

const getOwnedCarePlan = async (userId: string, carePlanId: string) => {
  const carePlan = await appDataSource.getRepository(CarePlan).findOne({
    where: { id: carePlanId, userId },
  });

  if (!carePlan) throw new AppError(404, 'Care plan not found');

  return carePlan;
};

const getOwnedTask = async (
  userId: string,
  carePlanId: string,
  taskId: string,
  checkInDate: Date,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  const task = await appDataSource.getRepository(CarePlanTask).findOne({
  where: { id: taskId, carePlanId },
  relations: {
    carePlan: true,
  },
});

  if (!task) throw new AppError(404, 'Care plan task not found');

 
  return task;
};

export const getCheckIns = async (userId: string) => {
    await generateDueCheckIns(userId);

  return appDataSource.getRepository(CheckIn).find({
    where: { userId },
    relations: {
      carePlan: true,
      task: true,
    },
    order: { checkInDate: 'DESC', createdAt: 'DESC' },
  });
};

export const getCheckInsByDate = async (
  userId: string,
  checkInDate: Date,
) => {
    await generateDueCheckIns(userId);

  return appDataSource.getRepository(CheckIn).find({
    where: { userId, checkInDate },
    relations: {
        carePlan: true,
        task: true
    },
    order: { createdAt: 'DESC' },
  });
};

export const getCheckInsByCarePlan = async (
  userId: string,
  carePlanId: string,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  return appDataSource.getRepository(CheckIn).find({
    where: { userId, carePlanId },
    order: { checkInDate: 'DESC', createdAt: 'DESC' },
  });
};

export const getCheckInsByTask = async (
  userId: string,
  carePlanId: string,
  taskId: string,
  checkInDate: Date,
) => {
  await getOwnedTask(userId, carePlanId, taskId, checkInDate);

  return appDataSource.getRepository(CheckIn).find({
    where: { userId, carePlanId, taskId },
    order: { checkInDate: 'DESC', createdAt: 'DESC' },
  });
};

export const getCheckInById = async (userId: string, checkInId: string) => {
  const checkIn = await appDataSource.getRepository(CheckIn).findOne({
    where: { id: checkInId, userId },
  });

  if (!checkIn) throw new AppError(404, 'Check-in not found');

  return checkIn;
};

export const createCheckIn = async (
  userId: string,
  input: CheckInInput,
) => {
  await getOwnedTask(userId, input.carePlanId, input.taskId, input.checkInDate);

  const checkInRepo = appDataSource.getRepository(CheckIn);

  const existingCheckIn = await checkInRepo.findOne({
    where: {
      taskId: input.taskId,
      checkInDate: input.checkInDate,
    },
  });

  if (existingCheckIn) {
    throw new AppError(409, 'Task already checked in for this date');
  }

  const checkIn = checkInRepo.create({
    ...input,
    userId,
    completedAt: input.status === 'done' ? new Date() : null,
  });

  return checkInRepo.save(checkIn);

  const task = await getOwnedTask(userId, input.carePlanId, input.taskId, input.checkInDate);
  
  if (task.frequency === 'Daily') {
    task.nextCheckIn = new Date(new Date(input.checkInDate).getTime() + 24 * 60 * 60 * 1000);
    await appDataSource.getRepository(CarePlanTask).save(task);
  }
  else if (task.frequency === 'Weekly') {
    task.nextCheckIn = new Date(new Date(input.checkInDate).getTime() + 7 * 24 * 60 * 60 * 1000);
    await appDataSource.getRepository(CarePlanTask).save(task);
  }
};

export const updateCheckIn = async (
  userId: string,
  checkInId: string,
  input: UpdateCheckInInput,
) => {
  const checkInRepo = appDataSource.getRepository(CheckIn);

  const checkIn = await checkInRepo.findOne({
    where: { id: checkInId, userId },
  });

  if (!checkIn) throw new AppError(404, 'Check-in not found');

  checkInRepo.merge(checkIn, {
    ...input,
    completedAt: input.status === 'done' ? new Date() : null,
  });

  return checkInRepo.save(checkIn);
};

export const deleteCheckIn = async (userId: string, checkInId: string) => {
  const checkInRepo = appDataSource.getRepository(CheckIn);

  const checkIn = await checkInRepo.findOne({
    where: { id: checkInId, userId },
  });

  if (!checkIn) throw new AppError(404, 'Check-in not found');

  await checkInRepo.remove(checkIn);

  return { deleted: true };
};