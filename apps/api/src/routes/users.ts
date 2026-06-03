import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const usersRouter = Router();

const BCRYPT_ROUNDS = 10;

// Every route here requires an authenticated SUPER_ADMIN.
usersRouter.use(authMiddleware, requireRole('SUPER_ADMIN'));

const roleSchema = z.enum(['SUPER_ADMIN', 'MODERATOR']);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: roleSchema,
});

const updateRoleSchema = z.object({
  role: roleSchema,
});

const publicUser = (u: { id: string; email: string; role: string; createdAt: Date; updatedAt: Date }) => ({
  id: u.id,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const countSuperAdmins = () => prisma.user.count({ where: { role: 'SUPER_ADMIN' } });

// GET /api/users - list all users (no password)
usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(users.map(publicUser));
});

// POST /api/users - create a user
usersRouter.post('/', async (req, res) => {
  const { email, password, role } = createUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(400, 'USER_EXISTS', 'A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: { email, password: hashedPassword, role },
  });

  res.status(201).json(publicUser(user));
});

// PATCH /api/users/:id/role - change a user's role
usersRouter.patch('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = updateRoleSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  // Don't allow demoting the last remaining super-admin.
  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const admins = await countSuperAdmins();
    if (admins <= 1) {
      throw new AppError(400, 'LAST_SUPER_ADMIN', 'Cannot demote the last super-admin');
    }
  }

  const updated = await prisma.user.update({ where: { id }, data: { role } });
  res.json(publicUser(updated));
});

// DELETE /api/users/:id - delete a user
usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (id === req.user!.userId) {
    throw new AppError(400, 'CANNOT_DELETE_SELF', 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  if (user.role === 'SUPER_ADMIN') {
    const admins = await countSuperAdmins();
    if (admins <= 1) {
      throw new AppError(400, 'LAST_SUPER_ADMIN', 'Cannot delete the last super-admin');
    }
  }

  await prisma.user.delete({ where: { id } });
  res.json({ success: true });
});
