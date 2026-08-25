import bcrypt from "bcryptjs";
import { appDataSource } from "../../database/data-source.js";
import { AppError } from "../../lib/errors.js";
import { signToken } from "../../lib/auth.js";
import { User } from "./user.entity.js";
import type { Role } from "@lifely/contracts";

export const register = async (
  email: string,
  password: string,
  role: Role = "member",
) => {
  const repo = appDataSource.getRepository(User);
  if (await repo.existsBy({ email }))
    throw new AppError(409, "Email is already registered");
  const user = await repo.save(
    repo.create({ email, passwordHash: await bcrypt.hash(password, 12), role }),
  );
  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken: signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    }),
  };
};

export const login = async (email: string, password: string) => {
  const user = await appDataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .addSelect("user.passwordHash")
    .where("user.email = :email", { email })
    .getOne();
  if (
    !user ||
    !user.isActive ||
    !(await bcrypt.compare(password, user.passwordHash))
  )
    throw new AppError(401, "Invalid email or password");
  return {
    user: { id: user.id, email: user.email, role: user.role },
    accessToken: signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    }),
  };
};
