import axios from 'axios';
import type { Event, CreateEventInput, User } from '../types';

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

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await client.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (email: string, password: string) => {
    const response = await client.post<{ token: string; user: User }>('/auth/register', {
      email,
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
  getAll: async () => {
    const response = await client.get<Event[]>('/events');
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
