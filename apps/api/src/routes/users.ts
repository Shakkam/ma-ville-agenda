import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendEmail, inviteEmailHtml } from '../utils/email.js';

export const usersRouter = Router();

const INVITE_TTL_DAYS = 7;

// Every route here requires an authenticated SUPER_ADMIN.
usersRouter.use(authMiddleware, requireRole('SUPER_ADMIN'));

const roleSchema = z.enum(['SUPER_ADMIN', 'MODERATOR']);

const inviteSchema = z.object({
  email: z.string().email(),
  role: roleSchema,
});

const updateRoleSchema = z.object({ role: roleSchema });

const publicUser = (u: {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: u.id,
  email: u.email,
  role: u.role,
  status: u.status,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const countSuperAdmins = () =>
  prisma.user.count({ where: { role: 'SUPER_ADMIN', status: 'ACTIVE' } });

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

const backofficeUrl = () => {
  if (process.env.BACKOFFICE_URL) return process.env.BACKOFFICE_URL.replace(/\/$/, '');
  const firstOrigin = process.env.CORS_ORIGINS?.split(',')[0]?.trim();
  return (firstOrigin || 'http://localhost:3000').replace(/\/$/, '');
};

// GET /api/users - list all users (incl. pending invitations)
usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  res.json(users.map(publicUser));
});

// POST /api/users/invite - invite a user by email (creates a pending account)
usersRouter.post('/invite', async (req, res) => {
  const { email, role } = inviteSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.status === 'ACTIVE') {
    throw new AppError(400, 'USER_EXISTS', 'A user with this email already exists');
  }

  // Generate a single-use token; store only its hash.
  const rawToken = crypto.randomBytes(32).toString('hex');
  const inviteTokenHash = sha256(rawToken);
  const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const data = { role, status: 'INVITED', password: null, inviteTokenHash, inviteExpiresAt };
  const user = existing
    ? await prisma.user.update({ where: { email }, data })
    : await prisma.user.create({ data: { email, ...data } });

  const inviteUrl = `${backofficeUrl()}/accept-invite?token=${rawToken}`;
  const email_result = await sendEmail(
    email,
    'Invitation — Ma Ville Agenda',
    inviteEmailHtml(inviteUrl, role)
  );

  res.status(201).json({
    user: publicUser(user),
    inviteUrl,
    emailSent: email_result.sent,
    emailError: email_result.sent ? undefined : email_result.error,
  });
});

// PATCH /api/users/:id/role - change a user's role
usersRouter.patch('/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = updateRoleSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && user.status === 'ACTIVE') {
    const admins = await countSuperAdmins();
    if (admins <= 1) {
      throw new AppError(400, 'LAST_SUPER_ADMIN', 'Cannot demote the last super-admin');
    }
  }

  const updated = await prisma.user.update({ where: { id }, data: { role } });
  res.json(publicUser(updated));
});

// DELETE /api/users/:id - delete a user (or revoke a pending invitation)
usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (id === req.user!.userId) {
    throw new AppError(400, 'CANNOT_DELETE_SELF', 'You cannot delete your own account');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

  if (user.role === 'SUPER_ADMIN' && user.status === 'ACTIVE') {
    const admins = await countSuperAdmins();
    if (admins <= 1) {
      throw new AppError(400, 'LAST_SUPER_ADMIN', 'Cannot delete the last super-admin');
    }
  }

  await prisma.user.delete({ where: { id } });
  res.json({ success: true });
});
