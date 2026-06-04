export type EventCategory = 'CULTURE' | 'SPORT' | 'ANIMATION' | 'COMMERCE' | 'AUTRE';
export type EventStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';

export interface Event {
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

export type UserRole = 'SUPER_ADMIN' | 'MODERATOR';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export type UserStatus = 'ACTIVE' | 'INVITED';

export interface ManagedUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InviteResult {
  user: ManagedUser;
  inviteUrl: string;
  emailSent: boolean;
  emailError?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

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
