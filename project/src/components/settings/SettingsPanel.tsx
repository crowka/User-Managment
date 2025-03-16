import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { Platform } from '@/lib/types/platform';
import { ConnectedAccounts } from './ConnectedAccounts';

export function SettingsPanel() {
  const { t } = useTranslation();
  const { settings, isLoading, error, fetchSettings, updateSettings } = useSettingsStore();
  const { platform } = useUserManagement();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const containerClasses = getPlatformClasses({
    base: "container mx-auto py-8",
    mobile: "py-4 px-2"
  });

  const cardClasses = getPlatformClasses({
    base: "bg-card rounded-lg shadow",
    mobile: "rounded-md"
  });

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <Alert variant="destructive">{error}</Alert>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className={containerClasses}>
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle>{t('settings.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">{t('settings.general')}</TabsTrigger>
              <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
              <TabsTrigger value="privacy">{t('settings.privacy')}</TabsTrigger>
              <TabsTrigger value="accounts">{t('settings.accounts')}</TabsTrigger>
            </TabsList>

            {/* General Settings */}
            <TabsContent value="general">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value: string) => updateSettings({ language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('settings.theme')}</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      updateSettings({ theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                      <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                      <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.emailNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.emailNotificationsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings({
                        notifications: { ...settings.notifications, email: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.pushNotifications')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.pushNotificationsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings({
                        notifications: { ...settings.notifications, push: checked }
                      })
                    }
                  />
                </div>

                {platform === Platform.MOBILE && (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('settings.preferences.mobileNotifications')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.preferences.mobileNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.mobile}
                      onCheckedChange={(checked: boolean) =>
                        updateSettings({
                          notifications: { ...settings.notifications, mobile: checked }
                        })
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.marketingEmails')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.marketingEmailsDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings({
                        notifications: { ...settings.notifications, marketing: checked }
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('settings.preferences.profileVisibility')}</Label>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value: 'public' | 'private' | 'friends') =>
                      updateSettings({
                        privacy: { ...settings.privacy, profileVisibility: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t('settings.privacy.public')}</SelectItem>
                      <SelectItem value="private">{t('settings.privacy.private')}</SelectItem>
                      <SelectItem value="friends">{t('settings.privacy.friends')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t('settings.preferences.showOnlineStatus')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.preferences.showOnlineStatusDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked: boolean) =>
                      updateSettings({
                        privacy: { ...settings.privacy, showOnlineStatus: checked }
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Connected Accounts */}
            <TabsContent value="accounts">
              <ConnectedAccounts />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 