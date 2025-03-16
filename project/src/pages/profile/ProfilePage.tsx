import { ProfileForm } from '@/components/profile/ProfileForm';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { useTranslation } from 'react-i18next';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';
import { useUserManagement } from '@/lib/UserManagementProvider';

export function ProfilePage() {
  const { t } = useTranslation();
  const { isNative } = useUserManagement();

  const containerClasses = getPlatformClasses({
    base: "container mx-auto py-8",
    mobile: "py-4 px-2"
  });

  const contentClasses = getPlatformClasses({
    base: "max-w-2xl mx-auto",
    mobile: "w-full"
  });

  const cardClasses = getPlatformClasses({
    base: "bg-card rounded-lg shadow p-6 mt-6",
    mobile: "p-4 rounded-md"
  });

  return (
    <div className={containerClasses}>
      <div className={contentClasses}>
        <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
        
        {/* Avatar upload section */}
        <AvatarUpload />
        
        {/* Profile form section */}
        <div className={cardClasses}>
          <ProfileForm />
        </div>
      </div>
    </div>
  );
} 