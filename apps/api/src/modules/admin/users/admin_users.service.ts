import { appDataSource } from '../../../database/data-source.js';
import { AppError } from '../../../lib/errors.js';
import { User } from '../../identity/user.entity.js';
import { PersonalInfo } from '../../member/personal-info/personal-info.entity.js';

export const getAdminUsers = async () => {
  const users = await appDataSource.getRepository(User).find({
    order: {
      createdAt: 'DESC',
    },
  });

  return Promise.all(
    users.map(async (user) => {
      const personalInfo = await appDataSource
        .getRepository(PersonalInfo)
        .findOne({ where: { userId: user.id } });

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        firstName: personalInfo?.firstName ?? null,
        lastName: personalInfo?.lastName ?? null,
        phoneNumber: personalInfo?.phoneNumber ?? null,
        caregiverName: user.name ?? null,
        caregiverPhoneNumber: user.phoneNumber ?? null,
      };
    }),
  );
};

export const updateUserStatus = async (
  userId: string,
  isActive: boolean,
) => {
  const userRepo = appDataSource.getRepository(User);

  const user = await userRepo.findOne({
    where: {
      id: userId,
    },
  });

  if (!user) throw new AppError(404, 'User not found');

  user.isActive = isActive;

  return userRepo.save(user);
};