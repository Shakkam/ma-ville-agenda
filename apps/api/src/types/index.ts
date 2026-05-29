import { EventCategory, EventStatus } from '@prisma/client';

export interface CreateEventInput {
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  location: string;
  externalUrl?: string;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  status?: EventStatus;
}

export interface EventResponse {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  location: string;
  externalUrl?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
