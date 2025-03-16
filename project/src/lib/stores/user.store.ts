import { create } from 'zustand';
import { supabase } from '../supabase';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface UserSettings {
  theme: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  two_factor_auth: boolean;
  login_alerts: boolean;
  preferences: Record<string, unknown>;
}

interface UserState {
  profile: UserProfile | null;
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  fetchProfile: () => Promise<void>;
  fetchSettings: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  settings: null,
  isLoading: false,
  error: null,

  updateProfile: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const { data: user, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { error: updateError } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.user.id);

      if (updateError) throw updateError;

      set((state) => ({
        profile: state.profile ? { ...state.profile, ...data } : null,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const { data: user, error } = await supabase.auth.getUser();
      if (error) throw error;

      const { error: updateError } = await supabase
        .from('user_settings')
        .update(data)
        .eq('user_id', user.user.id);

      if (updateError) throw updateError;

      set((state) => ({
        settings: state.settings ? { ...state.settings, ...data } : null,
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update settings' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  uploadAvatar: async (file) => {
    try {
      set({ isLoading: true, error: null });

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await get().updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to upload avatar' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (profileError) throw profileError;

      set({ profile });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (settingsError) throw settingsError;

      set({ settings });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch settings' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
})); 