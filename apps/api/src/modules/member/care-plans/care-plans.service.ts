import { appDataSource } from '../../../database/data-source.js';
import { AppError } from '../../../lib/errors.js';
import { User } from '../../identity/user.entity.js';
import { CarePlan, CarePlanStatus } from './care-plans.entity.js';

type CarePlanInput = {
  title: string;
  description?: string | null;
  conditionFocus?: string | null;
  startDate: string;
  endDate?: string | null;
  status?: CarePlanStatus;
};

export const getCarePlans = async (userId: string) => {
  return appDataSource.getRepository(CarePlan).find({
    where: { userId },
    order: { createdAt: 'DESC' },
  });
};

export const getCarePlanById = async (userId: string, carePlanId: string) => {
  const carePlan = await appDataSource.getRepository(CarePlan).findOne({
    where: { id: carePlanId, userId },
  });

  if (!carePlan) throw new AppError(404, 'Care plan not found');

  return carePlan;
};

export const createCarePlan = async (
  userId: string,
  createdById: string,
  input: CarePlanInput,
) => {
  const userRepo = appDataSource.getRepository(User);
  const carePlanRepo = appDataSource.getRepository(CarePlan);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  const createdBy = await userRepo.findOne({ where: { id: createdById } });
  if (!createdBy) throw new AppError(404, 'Creator not found');

  const carePlan = carePlanRepo.create({
    ...input,
    userId,
    user,
    createdById,
    createdBy,
    status: input.status ?? 'active',
  });

  return carePlanRepo.save(carePlan);
};

export const updateCarePlan = async (
  userId: string,
  carePlanId: string,
  input: Partial<CarePlanInput>,
) => {
  const carePlanRepo = appDataSource.getRepository(CarePlan);

  const carePlan = await carePlanRepo.findOne({
    where: { id: carePlanId, userId },
  });

  if (!carePlan) throw new AppError(404, 'Care plan not found');

  carePlanRepo.merge(carePlan, input);

  return carePlanRepo.save(carePlan);
};

export const deleteCarePlan = async (userId: string, carePlanId: string) => {
  const carePlanRepo = appDataSource.getRepository(CarePlan);

  const carePlan = await carePlanRepo.findOne({
    where: { id: carePlanId, userId },
  });

  if (!carePlan) throw new AppError(404, 'Care plan not found');

  await carePlanRepo.remove(carePlan);

  return { deleted: true };
};