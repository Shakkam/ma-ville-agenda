import axios from 'axios';
import type { Event, FilterOptions } from '../types/index.js';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const eventApi = {
  // List all published events
  getEvents: async (filters?: FilterOptions): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await client.get<Event[]>('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id: string): Promise<Event> => {
    const response = await client.get<Event>(`/events/${id}`);
    return response.data;
  },
};

export default client;
