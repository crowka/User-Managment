import { z } from 'zod';

/**
 * Enum for supported OAuth providers
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  LINKEDIN = 'linkedin',
}

/**
 * OAuth provider configuration schema
 */
export const oauthProviderConfigSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
  clientId: z.string(),
  clientSecret: z.string().optional(), // Not needed for client-side flow
  redirectUri: z.string(),
  scope: z.string().optional(),
  authorizationUrl: z.string().optional(), // For custom OAuth servers
  tokenUrl: z.string().optional(), // For custom OAuth servers
  userInfoUrl: z.string().optional(), // For custom OAuth servers
  enabled: z.boolean().default(true),
  icon: z.string().optional(), // Icon URL or component name
  label: z.string().optional(), // Custom label for the button
});

export type OAuthProviderConfig = z.infer<typeof oauthProviderConfigSchema>;

/**
 * OAuth module configuration
 */
export interface OAuthModuleConfig {
  enabled: boolean;
  providers: OAuthProviderConfig[];
  autoLink: boolean; // Auto-link accounts with matching emails
  allowUnverifiedEmails: boolean;
  defaultRedirectPath: string;
}

/**
 * OAuth user profile schema
 */
export const oauthUserProfileSchema = z.object({
  id: z.string(),
  provider: z.nativeEnum(OAuthProvider),
  email: z.string().email().optional(),
  name: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  avatar: z.string().url().optional(),
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.number().optional(),
  raw: z.record(z.any()).optional(), // Raw provider data
});

export type OAuthUserProfile = z.infer<typeof oauthUserProfileSchema>;

/**
 * OAuth state interface for the store
 */
export interface OAuthState {
  isLoading: boolean;
  error: string | null;
  connectedProviders: OAuthProvider[];
  
  // Methods
  login: (provider: OAuthProvider) => void;
  handleCallback: (provider: OAuthProvider, code: string) => Promise<void>;
  disconnect: (provider: OAuthProvider) => Promise<void>;
  isConnected: (provider: OAuthProvider) => boolean;
  clearError: () => void;
} 