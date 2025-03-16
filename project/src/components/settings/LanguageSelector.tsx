import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languages, type LanguageCode } from '@/lib/i18n';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';

interface LanguageSelectorProps {
  minimal?: boolean;
}

export function LanguageSelector({ minimal = false }: LanguageSelectorProps) {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  const handleLanguageChange = (value: string) => {
    const langCode = value as LanguageCode;
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
  };

  // For minimal mode (used on mobile), show just an icon button
  if (minimal) {
    return (
      <Button variant="ghost" size="icon" onClick={() => {
        // Cycle through languages
        const currentIndex = languages.findIndex(lang => lang.code === language);
        const nextIndex = (currentIndex + 1) % languages.length;
        handleLanguageChange(languages[nextIndex].code);
      }}>
        <Globe className="h-5 w-5" />
      </Button>
    );
  }

  const triggerClasses = getPlatformClasses({
    base: "min-w-[8rem]",
    mobile: "min-w-[6rem]"
  });

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={triggerClasses}>
          <SelectValue placeholder={t('settings.language')} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 