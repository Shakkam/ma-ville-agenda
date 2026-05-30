import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { signToken, verifyToken } from '../utils/jwt.js';

export const authRouter = Router();

const BCRYPT_ROUNDS = 10;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// POST /api/auth/login - Super-admin login
authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Always run a comparison to avoid leaking whether the email exists via timing.
  const hash = user?.password ?? '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
  const passwordOk = await bcrypt.compare(password, hash);

  if (!user || !passwordOk) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const token = signToken({ userId: user.id, email: user.email });

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
  const { email, password } = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError(400, 'USER_EXISTS', 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/verify - Verify a JWT and return the current user
authRouter.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(401, 'NO_TOKEN', 'Token required');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.email !== payload.email) {
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
