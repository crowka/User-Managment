import { create } from 'zustand';
import { api } from '../api/axios';
import { TwoFactorState, TwoFactorMethod, TwoFactorVerification } from '../types/2fa';

export const use2FAStore = create<TwoFactorState>((set, get) => ({
  config: {
    enabled: false,
    methods: [],
    required: false,
  },
  isLoading: false,
  error: null,

  setup2FA: async (method: TwoFactorMethod) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/2fa/setup', { method });
      
      set((state) => ({
        config: {
          ...state.config,
          secret: response.data.secret,
          qrCode: response.data.qrCode,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to setup 2FA',
        isLoading: false,
      });
    }
  },

  verify2FA: async (verification: TwoFactorVerification) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/2fa/verify', verification);
      
      set((state) => ({
        config: {
          ...state.config,
          enabled: true,
          methods: [...state.config.methods, verification.method],
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to verify 2FA',
        isLoading: false,
      });
    }
  },

  disable2FA: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/2fa/disable');
      
      set({
        config: {
          enabled: false,
          methods: [],
          required: false,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to disable 2FA',
        isLoading: false,
      });
    }
  },

  generateBackupCodes: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/2fa/backup-codes');
      
      set((state) => ({
        config: {
          ...state.config,
          backupCodes: response.data.codes,
        },
        isLoading: false,
      }));

      return response.data.codes;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate backup codes',
        isLoading: false,
      });
      return [];
    }
  },

  clearError: () => {
    set({ error: null });
  },
})); 