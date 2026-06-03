import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from './errorHandler.js';
import { verifyToken } from '../utils/jwt.js';
import { UserRole } from '../types/index.js';

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

  req.user = { userId: user.id, email: user.email, role: user.role as UserRole };
  next();
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    const user = await resolveUser(token);
    if (user) {
      req.user = { userId: user.id, email: user.email, role: user.role as UserRole };
    }
  }

  next();
};

// Gate a route to specific roles. Must run after authMiddleware (which sets req.user).
export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', 'Insufficient permissions for this action');
    }
    next();
  };
