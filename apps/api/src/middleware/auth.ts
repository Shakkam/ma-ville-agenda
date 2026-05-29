import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

// TODO: Implement JWT token validation
// For now, a simple placeholder that checks for Authorization header

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing authentication token');
  }

  // TODO: Validate JWT token and extract user info
  // For MVP, we'll implement basic token validation

  next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    // TODO: Validate token and attach user to req
  }

  next();
};
