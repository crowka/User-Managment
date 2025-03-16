import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useUserManagement, PlatformComponent } from "@/lib/UserManagementProvider";
import { Menu, User, LogOut, Settings } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getPlatformClasses } from "@/lib/hooks/usePlatformStyles";

interface HeaderProps {
  type?: 'fixed' | 'static' | 'sticky';
}

export function Header({ type = 'fixed' }: HeaderProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { isNative, platform } = useUserManagement();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define header classes based on header type and platform
  const headerClasses = getPlatformClasses({
    base: `w-full z-40 ${type === 'fixed' ? 'fixed top-0' : type === 'sticky' ? 'sticky top-0' : ''} bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${mobileMenuOpen ? 'shadow-md' : 'border-b'} transition-all duration-100`,
    mobile: 'py-2 px-3',
    web: 'py-3 px-4',
    ios: 'pt-safe', // Safe area for iOS notch
  });

  // Create a simplified version for mobile
  if (isNative && platform !== 'web') {
    return (
      <header className={headerClasses}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">User Management</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <LanguageSelector minimal={true} />
            
            {user ? (
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="h-5 w-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm">{t('auth.login')}</Button>
              </Link>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Standard web header
  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">User Management</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-4">
            <Link to="/settings" className="text-sm font-medium transition-colors hover:text-primary">
              {t('settings.title')}
            </Link>
            <Link to="/profile" className="text-sm font-medium transition-colors hover:text-primary">
              {t('profile.title')}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {t('profile.title')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('settings.title')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button>{t('auth.login')}</Button>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="container mx-auto py-4 md:hidden">
          <nav className="flex flex-col space-y-4">
            <Link 
              to="/profile" 
              className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('profile.title')}
            </Link>
            <Link 
              to="/settings" 
              className="px-2 py-1 text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('settings.title')}
            </Link>
            {user ? (
              <Button 
                variant="ghost" 
                className="justify-start px-2"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('auth.logout')}
              </Button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm">
                  {t('auth.login')}
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}