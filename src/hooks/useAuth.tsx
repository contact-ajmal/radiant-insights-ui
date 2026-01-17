/**
 * Authentication Hook
 */
import { create } from 'zustand';
import { authAPI } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (username: string, password: string) => {
    await authAPI.login(username, password);
    const user = await authAPI.getCurrentUser();
    set({ isAuthenticated: true, user });
  },

  register: async (userData: any) => {
    await authAPI.register(userData);
  },

  logout: () => {
    authAPI.logout();
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const user = await authAPI.getCurrentUser();
      set({ isAuthenticated: true, user });
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      set({ isAuthenticated: false, user: null });
    }
  },
}));
