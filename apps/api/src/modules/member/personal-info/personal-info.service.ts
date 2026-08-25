import { appDataSource } from "../../../database/data-source.js";
import { AppError } from "../../../lib/errors.js";
import { User } from "../../identity/user.entity.js";
import { PersonalInfo } from "./personal-info.entity.js";

type PersonalInfoInput = {
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  phoneNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  disabilityType?: string | null;
  mobilityLevel?: string | null;
  wheelchairUser?: boolean | null;
  fatigueTrigger?: string | null;
  medicationRoutine?: string | null;
  workStudySchedule?: string | null;
  accessibilityNeeds?: string | null;
};

export const getPersonalInfo = async (userId: string) => {
  return appDataSource.getRepository(PersonalInfo).findOne({
    where: { userId },
  });
};

export const createPersonalInfo = async (
  userId: string,
  input: PersonalInfoInput,
) => {
  const userRepo = appDataSource.getRepository(User);
  const personalInfoRepo = appDataSource.getRepository(PersonalInfo);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) throw new AppError(404, "User not found");

  const existingInfo = await personalInfoRepo.findOne({ where: { userId } });
  if (existingInfo) throw new AppError(409, "Personal info already exists");

  try {
    const personalInfo = personalInfoRepo.create({
      ...input,
      userId,
      user,
    });
    return personalInfoRepo.save(personalInfo);
  } catch (error) {
    console.error(error);
    throw new AppError(500, "Failed to create personal info");
  }
};

export const updatePersonalInfo = async (
  userId: string,
  input: Partial<PersonalInfoInput>,
) => {
  const personalInfoRepo = appDataSource.getRepository(PersonalInfo);

  const personalInfo = await personalInfoRepo.findOne({ where: { userId } });
  if (!personalInfo) throw new AppError(404, "Personal info not found");

  personalInfoRepo.merge(personalInfo, input);

  return personalInfoRepo.save(personalInfo);
};
