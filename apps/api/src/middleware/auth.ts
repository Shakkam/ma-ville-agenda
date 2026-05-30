import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from './errorHandler.js';
import { verifyToken } from '../utils/jwt.js';

// Resolves the authenticated user from a signed JWT, confirming the user
// still exists and the embedded email matches the current record.
const resolveUser = async (token: string) => {
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.email !== payload.email) return null;
  return user;
};

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing authentication token');
  }

  const user = await resolveUser(token);
  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  req.user = { userId: user.id, email: user.email };
  next();
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const user = await resolveUser(token);
    if (user) {
      req.user = { userId: user.id, email: user.email };
    }
  }

  next();
};
