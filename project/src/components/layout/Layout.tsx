import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { getPlatformClasses } from '@/lib/hooks/usePlatformStyles';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { layout, platform, isNative } = useUserManagement();
  const { 
    useCustomHeader, 
    headerComponent, 
    useCustomFooter, 
    footerComponent,
    useCustomLayout,
    layoutComponent: CustomLayout
  } = layout;

  // Use a custom layout if provided
  if (useCustomLayout && CustomLayout) {
    return <CustomLayout>{children}</CustomLayout>;
  }

  // Apply platform-specific classes to main container
  const containerClasses = getPlatformClasses({
    base: 'flex flex-col min-h-screen',
    // Mobile platforms get less padding and safe area padding
    mobile: 'pt-safe pb-safe',
    android: 'pt-6 pb-1', // Android typically needs more top padding for status bar
    ios: 'pt-4 pb-6',     // iOS typically needs more bottom padding for home indicator
  });

  // Apply platform-specific classes to content area
  const contentClasses = getPlatformClasses({
    base: 'flex-1 w-full mx-auto',
    web: 'container px-4 py-6',
    mobile: 'px-2 py-2', // Less padding on mobile
  });

  // On native platforms, avoid unnecessary fixed headers/footers
  const headerType = isNative ? 'static' : 'fixed';
  const footerPosition = isNative ? 'static' : 'sticky';

  return (
    <div className={containerClasses}>
      {/* Header */}
      {useCustomHeader ? (
        headerComponent
      ) : (
        <Header type={headerType} />
      )}

      {/* Main content */}
      <main className={contentClasses}>
        {children}
      </main>

      {/* Footer - Only show on web by default */}
      {!isNative && !useCustomFooter ? (
        <Footer position={footerPosition} />
      ) : useCustomFooter ? (
        footerComponent
      ) : null}
    </div>
  );
} 