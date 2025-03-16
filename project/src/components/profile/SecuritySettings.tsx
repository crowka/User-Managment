import { useState } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Shield, Smartphone, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

export function SecuritySettings() {
  const { profile, toggleTwoFactor, isLoading, error } = useProfile();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Switch
              checked={profile.twoFactorEnabled}
              onCheckedChange={toggleTwoFactor}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-muted-foreground">
                  Verify your email address
                </p>
              </div>
            </div>
            <Button
              variant={profile.emailVerified ? 'ghost' : 'default'}
              disabled={profile.emailVerified}
            >
              {profile.emailVerified ? 'Verified' : 'Verify Email'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Phone Verification</p>
                <p className="text-sm text-muted-foreground">
                  Verify your phone number
                </p>
              </div>
            </div>
            <Button
              variant={profile.phoneVerified ? 'ghost' : 'default'}
              disabled={profile.phoneVerified}
            >
              {profile.phoneVerified ? 'Verified' : 'Verify Phone'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle account deletion
                setShowDeleteDialog(false);
              }}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}