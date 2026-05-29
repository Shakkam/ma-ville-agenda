import { create } from 'zustand';
import { authApi } from '../api/client';
import type { AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.register(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      set({ token, user, isAuthenticated: true });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  verifyToken: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        set({ isAuthenticated: false });
        return;
      }

      const { valid, user } = await authApi.verify(token);
      if (valid) {
        set({ token, user, isAuthenticated: true });
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
        set({ isAuthenticated: false });
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ isAuthenticated: false });
    }
  },
}));
