import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { signToken, verifyToken } from '../utils/jwt.js';

export const authRouter = Router();

const BCRYPT_ROUNDS = 10;

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
});

// POST /api/auth/login - Super-admin login
authRouter.post('/login', async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // A pending invitation has no password yet — guide the user to activate.
  if (user && user.status === 'INVITED') {
    throw new AppError(403, 'ACCOUNT_NOT_ACTIVE', 'Compte non activé — utilisez votre lien d\'invitation');
  }

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

// POST /api/auth/accept-invite - set password from an invitation token, activate, auto-login
authRouter.post('/accept-invite', async (req, res) => {
  const { token, password } = acceptInviteSchema.parse(req.body);

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const user = await prisma.user.findFirst({
    where: {
      inviteTokenHash: tokenHash,
      status: 'INVITED',
      inviteExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    throw new AppError(400, 'INVALID_INVITE', 'Invitation invalide ou expirée');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      status: 'ACTIVE',
      inviteTokenHash: null,
      inviteExpiresAt: null,
    },
  });

  const jwt = signToken({ userId: updated.id, email: updated.email });
  res.json({
    token: jwt,
    user: { id: updated.id, email: updated.email, role: updated.role },
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
