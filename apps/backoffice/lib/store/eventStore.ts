import { create } from 'zustand';
import { eventApi } from '../api/client';
import type { Event } from '../types';

interface EventStore {
  events: Event[];
  pendingEvents: Event[];
  publishedEvents: Event[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchAll: () => Promise<void>;
  fetchPending: () => Promise<void>;
  fetchPublished: () => Promise<void>;
  validateEvent: (id: string) => Promise<void>;
  rejectEvent: (id: string) => Promise<void>;
  archiveEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  pendingEvents: [],
  publishedEvents: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventApi.getAll();
      set({
        events,
        pendingEvents: events.filter((e) => e.status === 'PENDING'),
        publishedEvents: events.filter((e) => e.status === 'PUBLISHED'),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch events';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchPending: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventApi.getAll();
      const pending = events.filter((e) => e.status === 'PENDING');
      set({ pendingEvents: pending });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending events';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  fetchPublished: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventApi.getAll();
      const published = events.filter((e) => e.status === 'PUBLISHED');
      set({ publishedEvents: published });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch published events';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  validateEvent: async (id: string) => {
    try {
      await eventApi.validate(id);
      get().fetchAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate event';
      set({ error: message });
    }
  },

  rejectEvent: async (id: string) => {
    try {
      await eventApi.reject(id);
      get().fetchAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject event';
      set({ error: message });
    }
  },

  archiveEvent: async (id: string) => {
    try {
      await eventApi.archive(id);
      get().fetchAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to archive event';
      set({ error: message });
    }
  },
}));
