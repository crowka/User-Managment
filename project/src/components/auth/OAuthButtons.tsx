import { useEffect } from 'react';
import { useOAuthStore } from '@/lib/stores/oauth.store';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { OAuthProvider } from '@/lib/types/oauth';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Provider icons (you can replace these with actual icons)
const providerIcons: Record<OAuthProvider, React.ReactNode> = {
  [OAuthProvider.GOOGLE]: <span className="mr-2">G</span>,
  [OAuthProvider.FACEBOOK]: <span className="mr-2">f</span>,
  [OAuthProvider.GITHUB]: <span className="mr-2">GH</span>,
  [OAuthProvider.TWITTER]: <span className="mr-2">T</span>,
  [OAuthProvider.MICROSOFT]: <span className="mr-2">M</span>,
  [OAuthProvider.APPLE]: <span className="mr-2">A</span>,
  [OAuthProvider.LINKEDIN]: <span className="mr-2">in</span>,
};

// Provider colors
const providerColors: Record<OAuthProvider, string> = {
  [OAuthProvider.GOOGLE]: 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300',
  [OAuthProvider.FACEBOOK]: 'bg-blue-600 hover:bg-blue-700 text-white',
  [OAuthProvider.GITHUB]: 'bg-gray-900 hover:bg-black text-white',
  [OAuthProvider.TWITTER]: 'bg-blue-400 hover:bg-blue-500 text-white',
  [OAuthProvider.MICROSOFT]: 'bg-blue-500 hover:bg-blue-600 text-white',
  [OAuthProvider.APPLE]: 'bg-black hover:bg-gray-900 text-white',
  [OAuthProvider.LINKEDIN]: 'bg-blue-700 hover:bg-blue-800 text-white',
};

export interface OAuthButtonsProps {
  mode?: 'login' | 'signup' | 'connect';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
  className?: string;
  onSuccess?: () => void;
}

export function OAuthButtons({
  mode = 'login',
  layout = 'vertical',
  showLabels = true,
  className = '',
  onSuccess,
}: OAuthButtonsProps) {
  const { t } = useTranslation();
  const { oauth } = useUserManagement();
  const { login, isLoading, error, clearError } = useOAuthStore();
  
  // Clear error on unmount
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  // If OAuth is disabled, don't render anything
  if (!oauth.enabled || oauth.providers.length === 0) {
    return null;
  }
  
  // Get button text based on mode
  const getButtonText = (provider: OAuthProvider) => {
    const providerName = t(`oauth.providers.${provider.toLowerCase()}`);
    
    switch (mode) {
      case 'login':
        return t('oauth.loginWith', { provider: providerName });
      case 'signup':
        return t('oauth.signupWith', { provider: providerName });
      case 'connect':
        return t('oauth.connectWith', { provider: providerName });
      default:
        return providerName;
    }
  };
  
  // Handle login with provider
  const handleLogin = (provider: OAuthProvider) => {
    login(provider);
  };
  
  // Layout classes
  const layoutClasses = {
    horizontal: 'flex flex-row gap-2 flex-wrap',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 sm:grid-cols-3 gap-2',
  };
  
  return (
    <div className={`${className}`}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className={layoutClasses[layout]}>
        {oauth.providers.map((providerConfig) => (
          <Button
            key={providerConfig.provider}
            className={`${providerColors[providerConfig.provider]} ${!showLabels ? 'px-3' : ''}`}
            onClick={() => handleLogin(providerConfig.provider)}
            disabled={isLoading}
          >
            {providerIcons[providerConfig.provider]}
            {showLabels && getButtonText(providerConfig.provider)}
          </Button>
        ))}
      </div>
      
      {mode !== 'connect' && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">
              {t('oauth.orDivider')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 