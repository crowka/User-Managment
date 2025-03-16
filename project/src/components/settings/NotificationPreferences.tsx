import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Bell, Mail, MessageSquare, ShoppingBag, Smartphone } from 'lucide-react';
import { notificationService } from '@/lib/services/notification.service';
import { useUserManagement } from '@/lib/UserManagementProvider';

export function NotificationPreferences() {
  const { t } = useTranslation();
  const { platform, isNative } = useUserManagement();
  const {
    emailNotifications,
    pushNotifications,
    marketingEmails,
    setEmailNotifications,
    setPushNotifications,
    setMarketingEmails,
  } = useSettingsStore();

  // If notifications are not enabled, don't render the component
  if (!notificationService.isEnabled()) {
    return null;
  }

  // Set up notifications based on platform
  const notifications = [
    {
      id: 'emailNotifications',
      name: t('settings.preferences.emailNotifications'),
      description: t('settings.preferences.emailNotificationsDesc'),
      icon: Mail,
      enabled: emailNotifications,
      onChange: setEmailNotifications,
      provider: 'email' as const,
      platforms: ['web', 'ios', 'android', 'react-native'] // Available on all platforms
    },
    // Push notifications are platform-specific
    {
      id: 'pushNotifications',
      name: platform === 'web' 
        ? t('settings.preferences.pushNotifications') 
        : t('settings.preferences.mobileNotifications'),
      description: platform === 'web'
        ? t('settings.preferences.pushNotificationsDesc')
        : t('settings.preferences.mobileNotificationsDesc'),
      icon: platform === 'web' ? Bell : Smartphone,
      enabled: pushNotifications,
      onChange: setPushNotifications,
      provider: 'push' as const,
      platforms: ['web', 'ios', 'android', 'react-native']
    },
    {
      id: 'marketingEmails',
      name: t('settings.preferences.marketingEmails'),
      description: t('settings.preferences.marketingEmailsDesc'),
      icon: ShoppingBag,
      enabled: marketingEmails,
      onChange: setMarketingEmails,
      provider: 'marketing' as const,
      platforms: ['web', 'ios', 'android', 'react-native'] // Available on all platforms
    },
  ].filter(notification => 
    // Filter by provider being enabled
    notificationService.isProviderEnabled(notification.provider) && 
    // Filter by platform compatibility
    notification.platforms.includes(platform)
  );

  // If no notification providers are enabled, don't render the component
  if (notifications.length === 0) {
    return null;
  }

  // Use a simpler container on mobile
  if (isNative && platform !== 'web') {
    return (
      <div className="space-y-6 p-4">
        <h2 className="text-xl font-semibold">{t('settings.notifications')}</h2>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center space-x-4">
              <notification.icon className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor={notification.id} className="font-medium">
                  {notification.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
            <Switch
              id={notification.id}
              checked={notification.enabled}
              onCheckedChange={notification.onChange}
            />
          </div>
        ))}
      </div>
    );
  }

  // Web design with Card
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.notifications')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <notification.icon className="h-5 w-5 text-primary" />
              <div>
                <Label htmlFor={notification.id} className="font-medium">
                  {notification.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {notification.description}
                </p>
              </div>
            </div>
            <Switch
              id={notification.id}
              checked={notification.enabled}
              onCheckedChange={notification.onChange}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
} 