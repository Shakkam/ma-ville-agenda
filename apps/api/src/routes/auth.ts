import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/login - Super-admin login
authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // TODO: Compare password with bcrypt
  // For now, just check if password matches (INSECURE - for development only)
  if (user.password !== password) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  // TODO: Generate JWT token
  const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/register - Create super-admin (dev only)
authRouter.post('/register', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError(400, 'USER_EXISTS', 'User already exists');
  }

  // TODO: Hash password with bcrypt
  const user = await prisma.user.create({
    data: {
      email,
      password, // INSECURE - for development only
      role: 'SUPER_ADMIN',
    },
  });

  const token = Buffer.from(`${user.id}:${user.email}`).toString('base64');

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/verify - Verify token
authRouter.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(401, 'NO_TOKEN', 'Token required');
  }

  // TODO: Verify JWT token
  const decoded = Buffer.from(token, 'base64').toString('utf-8');
  const [userId, email] = decoded.split(':');

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid token');
  }

  res.json({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});
