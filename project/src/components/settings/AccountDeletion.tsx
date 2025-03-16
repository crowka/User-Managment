import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export function AccountDeletion() {
  const { t } = useTranslation();
  const { deleteAccount, isLoading, error } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLocalError(null);
      
      // Validate confirmation text
      if (confirmText !== 'DELETE') {
        setLocalError(t('settings.accountDeletion.confirmTextError'));
        return;
      }
      
      // Validate confirmation checkbox
      if (!confirmChecked) {
        setLocalError(t('settings.accountDeletion.confirmCheckError'));
        return;
      }
      
      // Delete account
      await deleteAccount(password);
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Reset form
      setPassword('');
      setConfirmText('');
      setConfirmChecked(false);
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };
  
  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">{t('settings.accountDeletion.title')}</CardTitle>
        <CardDescription>{t('settings.accountDeletion.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {t('settings.accountDeletion.warning')}
        </p>
        
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>{t('settings.accountDeletion.consequence1')}</li>
          <li>{t('settings.accountDeletion.consequence2')}</li>
          <li>{t('settings.accountDeletion.consequence3')}</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              {t('settings.accountDeletion.deleteButton')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('settings.accountDeletion.confirmTitle')}</DialogTitle>
              <DialogDescription>
                {t('settings.accountDeletion.confirmDescription')}
              </DialogDescription>
            </DialogHeader>
            
            {(error || localError) && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error || localError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t('settings.accountDeletion.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-text">
                  {t('settings.accountDeletion.typeDelete')}
                </Label>
                <Input
                  id="confirm-text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="confirm-checkbox"
                  checked={confirmChecked}
                  onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                />
                <Label htmlFor="confirm-checkbox" className="text-sm">
                  {t('settings.accountDeletion.confirmCheckbox')}
                </Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading}
              >
                {isLoading
                  ? t('settings.accountDeletion.deleting')
                  : t('settings.accountDeletion.confirmButton')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
} 