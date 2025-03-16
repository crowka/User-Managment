import { create } from 'zustand';
import { api } from '../api/axios';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({ error: 'Invalid credentials', isLoading: false });
    }
  },
  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', { email, password, name });
      localStorage.setItem('token', response.data.token);
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({ error: 'Registration failed', isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/auth/reset-password', { email });
      set({ isLoading: false });
    } catch (error) {
      set({ error: 'Password reset failed', isLoading: false });
    }
  },
}));