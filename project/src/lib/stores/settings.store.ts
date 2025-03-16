import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/axios';

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    mobile: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showOnlineStatus: boolean;
  };
  communication: {
    emailFrequency: 'daily' | 'weekly' | 'monthly';
    marketingEmails: boolean;
    pushNotifications: boolean;
  };
}

interface SettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  clearError: () => void;
}

const defaultSettings: UserSettings = {
  language: 'en',
  theme: 'system',
  notifications: {
    email: true,
    push: true,
    mobile: true,
    marketing: false,
  },
  privacy: {
    profileVisibility: 'public',
    showOnlineStatus: true,
  },
  communication: {
    emailFrequency: 'weekly',
    marketingEmails: false,
    pushNotifications: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.get('/settings');
          set({ settings: response.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch settings',
            isLoading: false,
          });
        }
      },

      updateSettings: async (newSettings: Partial<UserSettings>) => {
        try {
          set({ isLoading: true, error: null });
          const response = await api.put('/settings', newSettings);
          set((state) => ({
            settings: state.settings ? { ...state.settings, ...response.data } : response.data,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update settings',
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'user-settings',
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        // Initialize with default settings if none exist
        if (!state?.settings) {
          state?.updateSettings(defaultSettings);
        }
      },
    }
  )
); 