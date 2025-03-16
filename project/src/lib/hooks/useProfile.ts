import { create } from 'zustand';
import { api } from '../api/axios';

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private' | 'contacts';
    showEmail: boolean;
    showPhone: boolean;
  };
  connectedAccounts: {
    google?: boolean;
    github?: boolean;
    twitter?: boolean;
  };
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  toggleTwoFactor: () => Promise<void>;
  updatePrivacySettings: (settings: Profile['privacySettings']) => Promise<void>;
  updateNotificationPreferences: (prefs: Profile['notificationPreferences']) => Promise<void>;
  connectAccount: (provider: keyof Profile['connectedAccounts']) => Promise<void>;
  disconnectAccount: (provider: keyof Profile['connectedAccounts']) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useProfile = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.patch('/profile', data);
      set({ profile: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update profile', isLoading: false });
    }
  },

  uploadAvatar: async (file) => {
    try {
      set({ isLoading: true, error: null });
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/profile/avatar', formData);
      set((state) => ({
        profile: state.profile ? { ...state.profile, avatar: response.data.avatar } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to upload avatar', isLoading: false });
    }
  },

  toggleTwoFactor: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/profile/2fa/toggle');
      set((state) => ({
        profile: state.profile ? { ...state.profile, twoFactorEnabled: response.data.enabled } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to toggle 2FA', isLoading: false });
    }
  },

  updatePrivacySettings: async (settings) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.patch('/profile/privacy', settings);
      set((state) => ({
        profile: state.profile ? { ...state.profile, privacySettings: response.data } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update privacy settings', isLoading: false });
    }
  },

  updateNotificationPreferences: async (prefs) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.patch('/profile/notifications', prefs);
      set((state) => ({
        profile: state.profile ? { ...state.profile, notificationPreferences: response.data } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update notification preferences', isLoading: false });
    }
  },

  connectAccount: async (provider) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/profile/connect/${provider}`);
      set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          connectedAccounts: {
            ...state.profile.connectedAccounts,
            [provider]: true,
          },
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Failed to connect ${provider} account`, isLoading: false });
    }
  },

  disconnectAccount: async (provider) => {
    try {
      set({ isLoading: true, error: null });
      await api.post(`/profile/disconnect/${provider}`);
      set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          connectedAccounts: {
            ...state.profile.connectedAccounts,
            [provider]: false,
          },
        } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: `Failed to disconnect ${provider} account`, isLoading: false });
    }
  },

  deleteAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.delete('/profile');
      set({ profile: null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete account', isLoading: false });
    }
  },
}));