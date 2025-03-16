import { useState } from 'react';
import { use2FAStore } from '@/lib/stores/2fa.store';
import { TwoFactorMethod } from '@/lib/types/2fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const { setup2FA, verify2FA, generateBackupCodes, config, isLoading, error } = use2FAStore();
  const [step, setStep] = useState<'method' | 'verify' | 'backup'>('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    await setup2FA(method);
    setStep('verify');
  };

  const handleVerify = async () => {
    await verify2FA({
      method: config.methods[0],
      code: verificationCode,
    });
    const codes = await generateBackupCodes();
    setBackupCodes(codes);
    setStep('backup');
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold mb-6">{t('2fa.setup.title')}</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'method' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.selectMethod')}</h3>
          <div className="grid gap-4">
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.TOTP)}
              disabled={isLoading}
            >
              {t('2fa.methods.totp')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.SMS)}
              disabled={isLoading}
            >
              {t('2fa.methods.sms')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.EMAIL)}
              disabled={isLoading}
            >
              {t('2fa.methods.email')}
            </Button>
          </div>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.verify')}</h3>
          <div className="space-y-2">
            <Label htmlFor="code">{t('2fa.setup.enterCode')}</Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
              {t('2fa.setup.verify')}
            </Button>
            <Button variant="outline" onClick={() => setStep('method')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.backupCodes')}</h3>
          <Alert>
            <AlertDescription>{t('2fa.setup.saveBackupCodes')}</AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                {code}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleComplete}>
              {t('2fa.setup.complete')}
            </Button>
            <Button variant="outline" onClick={() => setStep('verify')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      )}

      {onCancel && (
        <Button variant="ghost" className="mt-4" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      )}
    </Card>
  );
} 