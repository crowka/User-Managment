import { useProfile } from '@/lib/hooks/useProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Github, Twitter } from 'lucide-react';

export function ConnectedAccounts() {
  const { profile, connectAccount, disconnectAccount, isLoading } = useProfile();

  if (!profile) return null;

  const accounts = [
    {
      id: 'github',
      name: 'GitHub',
      icon: Github,
      connected: profile.connectedAccounts.github,
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      connected: profile.connectedAccounts.twitter,
    },
  ];

  const handleConnection = (provider: 'github' | 'twitter') => {
    if (profile.connectedAccounts[provider]) {
      disconnectAccount(provider);
    } else {
      connectAccount(provider);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <account.icon className="h-6 w-6" />
              <div>
                <p className="font-medium">{account.name}</p>
                <p className="text-sm text-muted-foreground">
                  {account.connected
                    ? 'Connected'
                    : `Connect your ${account.name} account`}
                </p>
              </div>
            </div>
            <Button
              variant={account.connected ? 'destructive' : 'outline'}
              onClick={() => handleConnection(account.id as 'github' | 'twitter')}
              disabled={isLoading}
            >
              {account.connected ? 'Disconnect' : 'Connect'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}