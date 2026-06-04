import axios from 'axios';
import type { Event, CreateEventInput, User, ManagedUser, UserRole, InviteResult } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to requests
client.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const uploadApi = {
  // Uploads an image file (already compressed client-side) and returns its URL.
  uploadImage: async (file: File | Blob, filename = 'image.jpg'): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file, filename);
    const response = await client.post<{ url: string }>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    return response.data.url;
  },
};

export const usersApi = {
  list: async (): Promise<ManagedUser[]> => {
    const response = await client.get<ManagedUser[]>('/users');
    return response.data;
  },
  invite: async (email: string, role: UserRole): Promise<InviteResult> => {
    const response = await client.post<InviteResult>('/users/invite', { email, role });
    return response.data;
  },
  updateRole: async (id: string, role: UserRole): Promise<ManagedUser> => {
    const response = await client.patch<ManagedUser>(`/users/${id}/role`, { role });
    return response.data;
  },
  remove: async (id: string): Promise<void> => {
    await client.delete(`/users/${id}`);
  },
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  acceptInvite: async (token: string, password: string) => {
    const response = await client.post<{ token: string; user: User }>('/auth/accept-invite', {
      token,
      password,
    });
    return response.data;
  },

  verify: async (token: string) => {
    const response = await client.post<{ valid: boolean; user: User }>('/auth/verify', {
      token,
    });
    return response.data;
  },
};

export const eventApi = {
  // Admin list: returns events of ALL statuses (requires auth), so the
  // backoffice can show pending submissions, not just published ones.
  getAll: async () => {
    const response = await client.get<Event[]>('/events/admin');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await client.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (input: CreateEventInput) => {
    const response = await client.post<Event>('/events', input);
    return response.data;
  },

  update: async (id: string, input: Partial<CreateEventInput>) => {
    const response = await client.put<Event>(`/events/${id}`, input);
    return response.data;
  },

  validate: async (id: string) => {
    const response = await client.put<Event>(`/events/${id}/validate`, {});
    return response.data;
  },

  reject: async (id: string) => {
    const response = await client.put<Event>(`/events/${id}/reject`, {});
    return response.data;
  },

  archive: async (id: string) => {
    const response = await client.delete<Event>(`/events/${id}`);
    return response.data;
  },
};

export default client;
