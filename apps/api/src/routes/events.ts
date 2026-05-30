import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { EventCategory } from '../types/index.js';

export const eventsRouter = Router();

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  category: z.enum(['CULTURE', 'SPORT', 'ANIMATION', 'COMMERCE', 'AUTRE']),
  location: z.string().min(1),
  externalUrl: z.string().url().optional(),
});

// GET /api/events - List all published events
eventsRouter.get('/', async (req, res) => {
  const { category, startDate, endDate } = req.query;

  const where: any = {
    status: 'PUBLISHED',
  };

  if (category) {
    where.category = category as EventCategory;
  }

  if (startDate || endDate) {
    where.startDate = {};
    if (startDate) where.startDate.gte = new Date(startDate as string);
    if (endDate) where.startDate.lte = new Date(endDate as string);
  }

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
  });

  res.json(events);
});

// GET /api/events/admin - List ALL events regardless of status (super-admin only)
// Defined before /:id so "admin" is not captured as an event id.
eventsRouter.get('/admin', authMiddleware, async (req, res) => {
  const { status, category } = req.query;

  const where: any = {};
  if (status) where.status = status as string;
  if (category) where.category = category as EventCategory;

  const events = await prisma.event.findMany({
    where,
    orderBy: { startDate: 'asc' },
  });

  res.json(events);
});

// GET /api/events/:id - Get event detail
eventsRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  res.json(event);
});

// POST /api/events - Create event (requires auth)
eventsRouter.post('/', authMiddleware, async (req, res) => {
  const input = createEventSchema.parse(req.body);

  const event = await prisma.event.create({
    data: {
      ...input,
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      createdBy: req.user!.userId,
      status: 'PENDING',
    },
  });

  res.status(201).json(event);
});

// PUT /api/events/:id - Update event (requires auth)
eventsRouter.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const input = createEventSchema.partial().parse(req.body);

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    },
  });

  res.json(updated);
});

// PUT /api/events/:id/validate - Validate event (publish)
eventsRouter.put('/:id/validate', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  });

  res.json(updated);
});

// PUT /api/events/:id/reject - Reject event
eventsRouter.put('/:id/reject', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: 'REJECTED' },
  });

  res.json(updated);
});

// DELETE /api/events/:id - Archive event
eventsRouter.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'NOT_FOUND', 'Event not found');
  }

  const updated = await prisma.event.update({
    where: { id },
    data: { status: 'ARCHIVED' },
  });

  res.json(updated);
});
