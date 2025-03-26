// project/src/components/shared/NotificationPreferences.tsx
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, MessageSquare, ShoppingBag, Smartphone } from 'lucide-react';
import { notificationService } from '@/lib/services/notification.service';
import { useUserManagement } from '@/lib/UserManagementProvider';

interface NotificationPreferencesProps {
  variant?: 'settings' | 'profile';
  showHeader?: boolean;
  className?: string;
  useCard?: boolean;
}

export function NotificationPreferences({
  variant = 'settings',
  showHeader = true,
  className = '',
  useCard = true
}: NotificationPreferencesProps) {
  const { t } = useTranslation();
  const { platform, isNative } = useUserManagement();
  const {
    settings,
    updateSettings,
  } = useSettingsStore();

  // If notifications are not enabled or settings not loaded, don't render
  if (!notificationService.isEnabled() || !settings) {
    return null;
  }

  // Set up notifications based on platform
  const notifications = [
    {
      id: 'email',
      name: t('settings.preferences.emailNotifications'),
      description: t('settings.preferences.emailNotificationsDesc'),
      icon: Mail,
      enabled: settings.notifications.email,
      onChange: (checked: boolean) => 
        updateSettings({ 
          notifications: {...settings.notifications, email: checked}
        }),
      provider: 'email' as const,
      platforms: ['web', 'ios', 'android', 'react-native'] // Available on all platforms
    },
    // Push notifications are platform-specific
    {
      id: 'push',
      name: platform === 'web' 
        ? t('settings.preferences.pushNotifications') 
        : t('settings.preferences.mobileNotifications'),
      description: platform === 'web'
        ? t('settings.preferences.pushNotificationsDesc')
        : t('settings.preferences.mobileNotificationsDesc'),
      icon: platform === 'web' ? Bell : Smartphone,
      enabled: settings.notifications.push,
      onChange: (checked: boolean) => 
        updateSettings({
          notifications: {...settings.notifications, push: checked}
        }),
      provider: 'push' as const,
      platforms: ['web', 'ios', 'android', 'react-native']
    },
    {
      id: 'marketing',
      name: t('settings.preferences.marketingEmails'),
      description: t('settings.preferences.marketingEmailsDesc'),
      icon: ShoppingBag,
      enabled: settings.notifications.marketing,
      onChange: (checked: boolean) => 
        updateSettings({
          notifications: {...settings.notifications, marketing: checked}
        }),
      provider: 'marketing' as const,
      platforms: ['web', 'ios', 'android', 'react-native']
    },
  ].filter(notification => 
    // Filter by provider being enabled
    notificationService.isProviderEnabled(notification.provider) && 
    // Filter by platform compatibility
    notification.platforms.includes(platform)
  );

  // If no notification providers are enabled, don't render
  if (notifications.length === 0) {
    return null;
  }

  // Simplified content without card
  const notificationContent = (
    <div className={`space-y-6 ${className}`}>
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
    </div>
  );

  // Profile variant - simpler layout
  if (variant === 'profile' && !useCard) {
    return notificationContent;
  }

  // Settings variant with Card container
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle>{t('settings.notifications')}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {notificationContent}
      </CardContent>
    </Card>
  );
}
