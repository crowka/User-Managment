import { z } from 'zod';

export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  MICROSOFT = 'microsoft',
}

export const connectedAccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  provider: z.nativeEnum(OAuthProvider),
  providerUserId: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ConnectedAccount = z.infer<typeof connectedAccountSchema>;

export interface ConnectedAccountsState {
  accounts: ConnectedAccount[];
  isLoading: boolean;
  error: string | null;
  fetchConnectedAccounts: () => Promise<void>;
  connectAccount: (provider: OAuthProvider) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  clearError: () => void;
} 