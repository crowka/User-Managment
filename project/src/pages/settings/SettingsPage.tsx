import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components/settings/LanguageSelector';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function SettingsPage() {
  const { t } = useTranslation();
  const {
    theme,
    profileVisibility,
    showOnlineStatus,
    setTheme,
    setProfileVisibility,
    setShowOnlineStatus,
  } = useSettingsStore();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
      
      {/* Language Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('settings.language')}</h2>
        <LanguageSelector />
      </section>

      {/* Theme Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('settings.theme')}</h2>
        <Select value={theme} onValueChange={(value: 'light' | 'dark' | 'system') => setTheme(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t('settings.theme')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Notification Settings */}
      <NotificationPreferences />

      {/* Privacy Settings */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('settings.privacy')}</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profileVisibility">{t('settings.preferences.profileVisibility')}</Label>
            <Select
              value={profileVisibility}
              onValueChange={(value: 'public' | 'private' | 'friends') => setProfileVisibility(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('settings.preferences.profileVisibility')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showOnlineStatus">{t('settings.preferences.showOnlineStatus')}</Label>
            <Switch
              id="showOnlineStatus"
              checked={showOnlineStatus}
              onCheckedChange={setShowOnlineStatus}
            />
          </div>
        </div>
      </section>
    </div>
  );
} 