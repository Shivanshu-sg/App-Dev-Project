import type { RequestHandler } from "express";
import type { Role } from "@lifely/contracts";
import { AppError } from "../lib/errors.js";
import { verifyToken, type TokenPayload } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return next(new AppError(401, "Authentication required"));
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
};

export const allow =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) =>
    req.user && roles.includes(req.user.role)
      ? next()
      : next(new AppError(403, "Insufficient permissions"));
