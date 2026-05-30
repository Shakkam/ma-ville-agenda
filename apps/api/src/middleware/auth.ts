import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma.js';
import { AppError } from './errorHandler.js';

// MVP token format: base64("<userId>:<email>"), generated in routes/auth.ts.
// Real signed JWT is deferred to Epic 5 (Auth & Security).
const decodeToken = (token: string): { userId: string; email: string } | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const idx = decoded.indexOf(':');
    if (idx === -1) return null;
    const userId = decoded.slice(0, idx);
    const email = decoded.slice(idx + 1);
    if (!userId || !email) return null;
    return { userId, email };
  } catch {
    return null;
  }
};

const resolveUser = async (token: string) => {
  const payload = decodeToken(token);
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
