import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/client';
import type { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true });
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        try {
          const { token, user } = await authApi.register(email, password);
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true });
        } catch (error) {
          console.error('Registration failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      verifyToken: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ isAuthenticated: false });
            return;
          }

          const { valid, user } = await authApi.verify(token);
          if (valid) {
            set({ token, user, isAuthenticated: true });
          } else {
            localStorage.removeItem('token');
            set({ isAuthenticated: false });
          }
        } catch (error) {
          localStorage.removeItem('token');
          set({ isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
