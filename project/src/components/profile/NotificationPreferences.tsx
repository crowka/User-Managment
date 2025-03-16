import { useProfile } from '@/lib/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';

export function NotificationPreferences() {
  const { profile, updateNotificationPreferences, isLoading } = useProfile();

  if (!profile) return null;

  const handleToggle = (type: keyof typeof profile.notificationPreferences) => {
    updateNotificationPreferences({
      ...profile.notificationPreferences,
      [type]: !profile.notificationPreferences[type],
    });
  };

  const notifications = [
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: Mail,
      enabled: profile.notificationPreferences.email,
    },
    {
      id: 'push',
      name: 'Push Notifications',
      description: 'Receive push notifications in your browser',
      icon: Bell,
      enabled: profile.notificationPreferences.push,
    },
    {
      id: 'sms',
      name: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      icon: MessageSquare,
      enabled: profile.notificationPreferences.sms,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
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
              onCheckedChange={() =>
                handleToggle(notification.id as keyof typeof profile.notificationPreferences)
              }
              disabled={isLoading}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}