// project/src/components/settings/NotificationPreferences.tsx
// @deprecated - Import from '@/components/shared/NotificationPreferences' instead
import { NotificationPreferences as SharedNotificationPreferences } from '../shared/NotificationPreferences';

export function NotificationPreferences(props: any) {
  return <SharedNotificationPreferences variant="settings" {...props} />;
}
