// Defined locally as string-literal unions: the Prisma schema uses String
// columns (SQLite has no enum support), so @prisma/client generates no enums.
export type EventCategory = 'CULTURE' | 'SPORT' | 'ANIMATION' | 'COMMERCE' | 'AUTRE';
export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

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

export type UserRole = 'SUPER_ADMIN' | 'MODERATOR';

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
