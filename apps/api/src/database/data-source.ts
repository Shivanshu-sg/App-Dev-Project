import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env.js";
import { User } from "../modules/identity/user.entity.js";
import { PersonalInfo } from "../modules/member/personal-info/personal-info.entity.js";
import { CarePlan } from "../modules/member/care-plans/care-plans.entity.js";
import { CarePlanTask } from "../modules/member/care-plan-tasks/care_plan_tasks.entity.js";
import { CheckIn } from "../modules/member/check-ins/check_in.entity.js";
import { CaregiverAssignment } from "../modules/member/care-plans/care-giver-assignment.entity.js";
import { CaregiverNote } from "../modules/caregiver/notes/caregiver-notes.entity.js";

export const appDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [User, PersonalInfo, CarePlan, CarePlanTask, CheckIn, CaregiverAssignment, CaregiverNote],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: true,
});
