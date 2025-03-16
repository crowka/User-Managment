import { useTranslation } from 'react-i18next';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';

interface FooterProps {
  position?: 'static' | 'sticky' | 'fixed';
}

export function Footer({ position = 'static' }: FooterProps) {
  const { t } = useTranslation();
  const { platform, isNative } = useUserManagement();
  
  // Footer may not be necessary on mobile platforms
  if (isNative && platform !== 'web') {
    return null;
  }
  
  const footerClasses = getPlatformClasses({
    base: `w-full py-6 border-t ${position === 'sticky' ? 'sticky bottom-0' : position === 'fixed' ? 'fixed bottom-0' : ''} bg-background`,
    web: 'px-8',
    mobile: 'px-4 py-3',
  });

  return (
    <footer className={footerClasses}>
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} User Management. {t('common.allRightsReserved')}
        </p>
        
        <nav className="flex items-center gap-4 text-sm">
          <a
            href="#"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('common.privacy')}
          </a>
          <a
            href="#"
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            {t('common.terms')}
          </a>
        </nav>
      </div>
    </footer>
  );
}