import { Router } from "express";
import { z } from "zod";
import { authenticate, allow } from "../../../middleware/authorize.js";
import {
  createPersonalInfo,
  getPersonalInfo,
  updatePersonalInfo,
} from "./personal-info.service.js";

const personalInfoSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  phoneNumber: z.string().max(30).optional().nullable(),
  emergencyContactName: z.string().max(150).optional().nullable(),
  emergencyContactPhone: z.string().max(30).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  disabilityType: z.string().max(100).optional().nullable(),
  mobilityLevel: z.string().max(100).optional().nullable(),
  wheelchairUser: z.boolean().optional().nullable(),
  fatigueTrigger: z.string().max(100).optional().nullable(),
  medicationRoutine: z.string().max(100).optional().nullable(),
  workStudySchedule: z.string().max(100).optional().nullable(),
  accessibilityNeeds: z.string().max(100).optional().nullable(),
});

const updatePersonalInfoSchema = personalInfoSchema.partial();

export const personalInfoRouter = Router();

personalInfoRouter.use(authenticate);

personalInfoRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const personalInfo = await getPersonalInfo(req.user.sub);
    res.json({ data: personalInfo });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

personalInfoRouter.post("/", async (req, res, next) => {
  try {
    const input = personalInfoSchema.parse(req.body);
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const personalInfo = await createPersonalInfo(req.user.sub, input);

    res.status(201).json({ data: personalInfo });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

personalInfoRouter.put("/", async (req, res, next) => {
  try {
    const input = updatePersonalInfoSchema.parse(req.body);
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const personalInfo = await updatePersonalInfo(req.user.sub, input);

    res.json({ data: personalInfo });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
