import { create } from 'zustand';
import { OAuthProvider, OAuthState } from '../types/oauth';
import { useUserManagement } from '../UserManagementProvider';
import { api } from '../api/axios';
import { useAuthStore } from './auth.store';

export const useOAuthStore = create<OAuthState>((set, get) => ({
  isLoading: false,
  error: null,
  connectedProviders: [],

  /**
   * Initiate OAuth login flow
   */
  login: (provider: OAuthProvider) => {
    try {
      set({ isLoading: true, error: null });
      
      // Get provider config from context
      const { oauth } = useUserManagement();
      const providerConfig = oauth?.providers.find(p => p.provider === provider);
      
      if (!providerConfig) {
        throw new Error(`Provider ${provider} is not configured`);
      }
      
      // Generate random state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('oauth_state', state);
      
      // Build authorization URL
      const authUrl = providerConfig.authorizationUrl || getDefaultAuthUrl(provider);
      const url = new URL(authUrl);
      
      // Add query parameters
      url.searchParams.append('client_id', providerConfig.clientId);
      url.searchParams.append('redirect_uri', providerConfig.redirectUri);
      url.searchParams.append('response_type', 'code');
      url.searchParams.append('state', state);
      
      if (providerConfig.scope) {
        url.searchParams.append('scope', providerConfig.scope);
      } else {
        // Default scopes for common providers
        switch (provider) {
          case OAuthProvider.GOOGLE:
            url.searchParams.append('scope', 'profile email');
            break;
          case OAuthProvider.GITHUB:
            url.searchParams.append('scope', 'user:email');
            break;
          case OAuthProvider.FACEBOOK:
            url.searchParams.append('scope', 'email,public_profile');
            break;
          default:
            url.searchParams.append('scope', 'email profile');
        }
      }
      
      // Redirect to authorization URL
      window.location.href = url.toString();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initiate OAuth login',
        isLoading: false,
      });
    }
  },

  /**
   * Handle OAuth callback
   */
  handleCallback: async (provider: OAuthProvider, code: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Verify state for CSRF protection
      const storedState = localStorage.getItem('oauth_state');
      const urlParams = new URLSearchParams(window.location.search);
      const returnedState = urlParams.get('state');
      
      if (!storedState || storedState !== returnedState) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }
      
      // Clear state from storage
      localStorage.removeItem('oauth_state');
      
      // Exchange code for tokens
      const response = await api.post('/auth/oauth/callback', {
        provider,
        code,
        redirectUri: window.location.origin + '/auth/callback',
      });
      
      // Get auth store and update user
      const authStore = useAuthStore.getState();
      
      if (response.data.user) {
        // User logged in or account linked
        authStore.setUser(response.data.user);
        authStore.setToken(response.data.token);
        
        // Update connected providers
        set(state => ({
          connectedProviders: [...state.connectedProviders, provider],
          isLoading: false,
        }));
        
        // Redirect to home or specified redirect path
        const { oauth } = useUserManagement();
        window.location.href = oauth?.defaultRedirectPath || '/';
      } else {
        // Something went wrong
        throw new Error('Failed to authenticate with provider');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete OAuth authentication',
        isLoading: false,
      });
    }
  },

  /**
   * Disconnect an OAuth provider
   */
  disconnect: async (provider: OAuthProvider) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.post('/auth/oauth/disconnect', { provider });
      
      // Update connected providers
      set(state => ({
        connectedProviders: state.connectedProviders.filter(p => p !== provider),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to disconnect provider',
        isLoading: false,
      });
    }
  },

  /**
   * Check if a provider is connected
   */
  isConnected: (provider: OAuthProvider) => {
    return get().connectedProviders.includes(provider);
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Get default authorization URL for common providers
 */
function getDefaultAuthUrl(provider: OAuthProvider): string {
  switch (provider) {
    case OAuthProvider.GOOGLE:
      return 'https://accounts.google.com/o/oauth2/v2/auth';
    case OAuthProvider.GITHUB:
      return 'https://github.com/login/oauth/authorize';
    case OAuthProvider.FACEBOOK:
      return 'https://www.facebook.com/v12.0/dialog/oauth';
    case OAuthProvider.TWITTER:
      return 'https://twitter.com/i/oauth2/authorize';
    case OAuthProvider.MICROSOFT:
      return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    case OAuthProvider.APPLE:
      return 'https://appleid.apple.com/auth/authorize';
    case OAuthProvider.LINKEDIN:
      return 'https://www.linkedin.com/oauth/v2/authorization';
    default:
      throw new Error(`No default authorization URL for provider ${provider}`);
  }
} 