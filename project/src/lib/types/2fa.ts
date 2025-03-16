import { z } from 'zod';

// 2FA methods
export enum TwoFactorMethod {
  TOTP = 'totp', // Time-based One-Time Password
  SMS = 'sms',   // SMS-based verification
  EMAIL = 'email' // Email-based verification
}

// 2FA status
export enum TwoFactorStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
  REQUIRED = 'required'
}

// 2FA configuration schema
export const twoFactorConfigSchema = z.object({
  enabled: z.boolean().default(false),
  methods: z.array(z.nativeEnum(TwoFactorMethod)).default([]),
  required: z.boolean().default(false),
  backupCodes: z.array(z.string()).optional(),
  secret: z.string().optional(),
  qrCode: z.string().optional(),
});

export type TwoFactorConfig = z.infer<typeof twoFactorConfigSchema>;

// 2FA verification schema
export const twoFactorVerificationSchema = z.object({
  method: z.nativeEnum(TwoFactorMethod),
  code: z.string().min(6).max(6),
});

export type TwoFactorVerification = z.infer<typeof twoFactorVerificationSchema>;

// 2FA store state
export interface TwoFactorState {
  config: TwoFactorConfig;
  isLoading: boolean;
  error: string | null;
  setup2FA: (method: TwoFactorMethod) => Promise<void>;
  verify2FA: (verification: TwoFactorVerification) => Promise<void>;
  disable2FA: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  clearError: () => void;
}

// Provider configuration type
export interface TwoFactorProviderConfig {
  enabled: boolean;
  methods: TwoFactorMethod[];
  required: boolean;
} 