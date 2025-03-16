import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { RegisterData } from '@/lib/types/auth';
import { createClient } from '@/lib/utils/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const supabase = createClient();

  return {
    user: null,
    session: null,
    isLoading: false,
    error: null,

    setUser: (user: User | null) => set({ user }),
    setSession: (session: Session | null) => set({ session }),

    initialize: async () => {
      try {
        const { data: { user, session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        set({ user, session });
      } catch (error) {
        console.error('Error initializing auth:', error);
        set({ error: 'Failed to initialize auth' });
      }
    },

    register: async (data: RegisterData) => {
      try {
        set({ isLoading: true, error: null });
        const { data: { user }, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              userType: data.userType,
            },
          },
        });
        if (error) throw error;
        set({ user });
      } catch (error) {
        console.error('Error registering:', error);
        set({ error: 'Failed to register' });
      } finally {
        set({ isLoading: false });
      }
    },

    login: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null });
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        set({ user });
      } catch (error) {
        console.error('Error logging in:', error);
        set({ error: 'Failed to login' });
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      try {
        set({ isLoading: true, error: null });
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ user: null });
      } catch (error) {
        console.error('Error logging out:', error);
        set({ error: 'Failed to logout' });
      } finally {
        set({ isLoading: false });
      }
    },
  };
}); 