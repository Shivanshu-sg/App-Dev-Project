import { appDataSource } from "../../../database/data-source.js";
import { AppError } from "../../../lib/errors.js";
import { CarePlan } from "../care-plans/care-plans.entity.js";
import {
  CarePlanTask,
  CarePlanTaskPriority,
  CarePlanTaskStatus,
  CarePlanTaskType,
} from "./care_plan_tasks.entity.js";

type CarePlanTaskInput = {
  title: string;
  description?: string | null;
  taskType: CarePlanTaskType;
  scheduledTime?: Date | null;
  frequency?: string | null;
  priority?: CarePlanTaskPriority;
  status?: CarePlanTaskStatus;
};

const getOwnedCarePlan = async (userId: string, carePlanId: string) => {
  const carePlan = await appDataSource.getRepository(CarePlan).findOne({
    where: { id: carePlanId, userId },
  });

  if (!carePlan) throw new AppError(404, "Care plan not found");

  return carePlan;
};

export const getCarePlanTasks = async (userId: string, carePlanId: string) => {
  try {
    await getOwnedCarePlan(userId, carePlanId);

    return appDataSource.getRepository(CarePlanTask).find({
      where: { carePlanId },
      order: { createdAt: "DESC" },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCarePlanTaskById = async (
  userId: string,
  carePlanId: string,
  taskId: string,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  const task = await appDataSource.getRepository(CarePlanTask).findOne({
    where: { id: taskId, carePlanId },
  });

  if (!task) throw new AppError(404, "Care plan task not found");

  return task;
};

export const createCarePlanTask = async (
  userId: string,
  carePlanId: string,
  input: CarePlanTaskInput,
) => {
  const carePlan = await getOwnedCarePlan(userId, carePlanId);
  const taskRepo = appDataSource.getRepository(CarePlanTask);

  const task = taskRepo.create({
    ...input,
    carePlan,
    carePlanId,
    priority: input.priority ?? "med",
    status: input.status ?? "pending",
    nextCheckIn: input.scheduledTime ?? new Date(),
  });

  return taskRepo.save(task);
};

export const updateCarePlanTask = async (
  userId: string,
  carePlanId: string,
  taskId: string,
  input: Partial<CarePlanTaskInput>,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  const taskRepo = appDataSource.getRepository(CarePlanTask);
  const task = await taskRepo.findOne({
    where: { id: taskId, carePlanId },
  });

  if (!task) throw new AppError(404, "Care plan task not found");

  taskRepo.merge(task, input);

  return taskRepo.save(task);
};

export const deleteCarePlanTask = async (
  userId: string,
  carePlanId: string,
  taskId: string,
) => {
  await getOwnedCarePlan(userId, carePlanId);

  const taskRepo = appDataSource.getRepository(CarePlanTask);
  const task = await taskRepo.findOne({
    where: { id: taskId, carePlanId },
  });

  if (!task) throw new AppError(404, "Care plan task not found");

  await taskRepo.remove(task);

  return { deleted: true };
};
