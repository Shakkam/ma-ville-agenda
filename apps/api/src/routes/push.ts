import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';

export const pushRouter = Router();

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.string().optional(),
});

const tokenSchema = z.object({ token: z.string().min(1) });

// POST /api/push/register - register an Expo push token (public; residents are anonymous)
pushRouter.post('/register', async (req, res) => {
  const { token, platform } = registerSchema.parse(req.body);
  await prisma.pushToken.upsert({
    where: { token },
    update: { platform },
    create: { token, platform },
  });
  res.status(201).json({ success: true });
});

// POST /api/push/unregister - remove a token (e.g. on logout / disable notifications)
pushRouter.post('/unregister', async (req, res) => {
  const { token } = tokenSchema.parse(req.body);
  await prisma.pushToken.deleteMany({ where: { token } });
  res.json({ success: true });
});
