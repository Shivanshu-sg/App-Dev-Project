import type { ErrorRequestHandler } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) { super(message); }
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error instanceof AppError ? error.statusCode : 500;
  res.status(status).json({ error: status === 500 ? 'Internal server error' : error.message });
};
