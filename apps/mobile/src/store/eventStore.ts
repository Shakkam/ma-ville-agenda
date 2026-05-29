import { create } from 'zustand';
import type { Event, EventCategory, FilterOptions } from '../types/index.js';
import { eventApi } from '../api/client.js';

interface EventState {
  events: Event[];
  filteredEvents: Event[];
  loading: boolean;
  error: string | null;
  selectedCategory: EventCategory | null;
  selectedEvent: Event | null;

  // Actions
  fetchEvents: (filters?: FilterOptions) => Promise<void>;
  setSelectedCategory: (category: EventCategory | null) => void;
  setSelectedEvent: (event: Event | null) => void;
  filterByCategory: (category: EventCategory | null) => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  filteredEvents: [],
  loading: false,
  error: null,
  selectedCategory: null,
  selectedEvent: null,

  fetchEvents: async (filters?: FilterOptions) => {
    set({ loading: true, error: null });
    try {
      const events = await eventApi.getEvents(filters);
      set({ events, filteredEvents: events });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch events';
      set({ error: message });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterByCategory(category);
  },

  setSelectedEvent: (event) => {
    set({ selectedEvent: event });
  },

  filterByCategory: (category: EventCategory | null) => {
    const { events } = get();
    const filtered = category ? events.filter((e) => e.category === category) : events;
    set({ filteredEvents: filtered, selectedCategory: category });
  },
}));
