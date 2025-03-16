import { useEffect, useState } from 'react';
import { useOAuthStore } from '@/lib/stores/oauth.store';
import { OAuthProvider } from '@/lib/types/oauth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export function OAuthCallback() {
  const { t } = useTranslation();
  const { handleCallback, isLoading, error } = useOAuthStore();
  const [processingState, setProcessingState] = useState<'initial' | 'processing' | 'error' | 'success'>('initial');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        setProcessingState('processing');
        
        // Get query parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = urlParams.get('provider') as OAuthProvider;
        const error = urlParams.get('error');
        
        // Handle error from OAuth provider
        if (error) {
          throw new Error(`Provider error: ${error}`);
        }
        
        // Validate required parameters
        if (!code) {
          throw new Error('Authorization code is missing');
        }
        
        if (!provider) {
          throw new Error('Provider is missing');
        }
        
        // Process the callback
        await handleCallback(provider, code);
        setProcessingState('success');
      } catch (error) {
        console.error('OAuth callback error:', error);
        setProcessingState('error');
      }
    };
    
    processCallback();
  }, [handleCallback]);
  
  // Render loading state
  if (processingState === 'initial' || processingState === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>{t('oauth.callback.title')}</CardTitle>
          <CardDescription>{t('oauth.callback.processing')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (processingState === 'error' || error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>{t('oauth.callback.errorTitle')}</CardTitle>
          <CardDescription>{t('oauth.callback.errorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error || t('oauth.callback.genericError')}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <a href="/login" className="text-primary hover:underline">
              {t('oauth.callback.backToLogin')}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Success state (should redirect, but just in case)
  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>{t('oauth.callback.successTitle')}</CardTitle>
        <CardDescription>{t('oauth.callback.successDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p>{t('oauth.callback.redirecting')}</p>
      </CardContent>
    </Card>
  );
} 