import { useProfile } from '@/lib/hooks/useProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function PrivacySettings() {
  const { profile, updatePrivacySettings, isLoading } = useProfile();

  if (!profile) return null;

  const handleVisibilityChange = (value: string) => {
    updatePrivacySettings({
      ...profile.privacySettings,
      profileVisibility: value as 'public' | 'private' | 'contacts',
    });
  };

  const handleToggleChange = (setting: 'showEmail' | 'showPhone') => {
    updatePrivacySettings({
      ...profile.privacySettings,
      [setting]: !profile.privacySettings[setting],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Profile Visibility</Label>
          <Select
            value={profile.privacySettings.profileVisibility}
            onValueChange={handleVisibilityChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="contacts">Contacts Only</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="showEmail">Show Email Address</Label>
            <Switch
              id="showEmail"
              checked={profile.privacySettings.showEmail}
              onCheckedChange={() => handleToggleChange('showEmail')}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="showPhone">Show Phone Number</Label>
            <Switch
              id="showPhone"
              checked={profile.privacySettings.showPhone}
              onCheckedChange={() => handleToggleChange('showPhone')}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // Download user data
            }}
          >
            Download My Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}