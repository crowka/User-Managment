import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConnectedAccountsStore } from '@/lib/stores/connected-accounts.store';
import { OAuthProvider } from '@/lib/types/connected-accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { Platform } from '@/lib/types/platform';
import { 
  Github, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail, 
  Trash2,
  Loader2
} from 'lucide-react';

const PROVIDER_ICONS = {
  [OAuthProvider.GOOGLE]: Mail,
  [OAuthProvider.GITHUB]: Github,
  [OAuthProvider.FACEBOOK]: Facebook,
  [OAuthProvider.TWITTER]: Twitter,
  [OAuthProvider.LINKEDIN]: Linkedin,
  [OAuthProvider.MICROSOFT]: Mail,
};

const PROVIDER_LABELS = {
  [OAuthProvider.GOOGLE]: 'Google',
  [OAuthProvider.GITHUB]: 'GitHub',
  [OAuthProvider.FACEBOOK]: 'Facebook',
  [OAuthProvider.TWITTER]: 'Twitter',
  [OAuthProvider.LINKEDIN]: 'LinkedIn',
  [OAuthProvider.MICROSOFT]: 'Microsoft',
};

export function ConnectedAccounts() {
  const { t } = useTranslation();
  const { accounts, isLoading, error, fetchConnectedAccounts, connectAccount, disconnectAccount } = useConnectedAccountsStore();
  const { platform } = useUserManagement();

  useEffect(() => {
    fetchConnectedAccounts();
  }, [fetchConnectedAccounts]);

  const containerClasses = getPlatformClasses({
    base: "space-y-4",
    mobile: "px-2"
  });

  const cardClasses = getPlatformClasses({
    base: "bg-card rounded-lg shadow",
    mobile: "rounded-md"
  });

  const handleConnect = async (provider: OAuthProvider) => {
    await connectAccount(provider);
  };

  const handleDisconnect = async (accountId: string) => {
    await disconnectAccount(accountId);
  };

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle>{t('settings.connectedAccounts.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            {/* Connected Accounts List */}
            {accounts.map((account) => {
              const Icon = PROVIDER_ICONS[account.provider];
              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6" />
                    <div>
                      <p className="font-medium">{PROVIDER_LABELS[account.provider]}</p>
                      <p className="text-sm text-muted-foreground">{account.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(account.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {/* Connect New Account */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">
                {t('settings.connectedAccounts.connectNew')}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {Object.values(OAuthProvider).map((provider) => {
                  const Icon = PROVIDER_ICONS[provider];
                  const isConnected = accounts.some(
                    (account) => account.provider === provider
                  );
                  
                  return (
                    <Button
                      key={provider}
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => handleConnect(provider)}
                      disabled={isLoading || isConnected}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{PROVIDER_LABELS[provider]}</span>
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 