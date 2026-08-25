import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env.js";
import { User } from "../modules/identity/user.entity.js";
import { PersonalInfo } from "../modules/member/personal-info/personal-info.entity.js";

export const appDataSource = new DataSource({
  type: "postgres",
  url: env.DATABASE_URL,
  entities: [User, PersonalInfo],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: true,
});
