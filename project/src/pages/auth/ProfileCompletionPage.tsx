import { useTranslation } from 'react-i18next';
import { ProfileCompletion } from '@/components/registration/ProfileCompletion';

export function ProfileCompletionPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t('profile.setup.title', 'Complete Your Profile')}</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <ProfileCompletion />
      </div>
    </div>
  );
} 