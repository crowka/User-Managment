import { create } from 'zustand';
import { api } from '../api/axios';
import { AuthState } from '../types/auth';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false 
      });
    }
  },

  register: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/auth/register', { email, password });
      const { user, token } = response.data;
      
      localStorage.setItem('auth_token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false 
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/auth/logout');
      localStorage.removeItem('auth_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false 
      });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/reset-password', { email });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Password reset failed',
        isLoading: false,
      });
    }
  },

  updatePassword: async (oldPassword: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/update-password', { oldPassword, newPassword });
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Password update failed',
        isLoading: false,
      });
    }
  },

  sendVerificationEmail: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/send-verification-email');
      set({ isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send verification email',
        isLoading: false,
      });
    }
  },

  verifyEmail: async (token: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/auth/verify-email', { token });
      set({
        user: response.data.user,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Email verification failed',
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  deleteAccount: async (password?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete('/auth/account', { 
        data: password ? { password } : undefined 
      });
      
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      
      window.location.href = '/';
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete account',
        isLoading: false,
      });
    }
  },
})); 