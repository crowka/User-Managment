import React, { createContext, useContext, ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { router as defaultRouter } from '@/lib/router';
import i18n from '@/lib/i18n';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { api } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth.store';
import { 
  initializeNotifications, 
  type NotificationConfig, 
  type Platform 
} from '@/lib/services/notification.service';
import { TwoFactorProviderConfig } from './types/2fa';
import { SubscriptionProviderConfig, SubscriptionTier } from './types/subscription';
import { CorporateUserConfig, UserType } from './types/user-type';
import { OAuthModuleConfig } from './types/oauth';

// Detect platform automatically (can be overridden in config)
const detectPlatform = (): Platform => {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return 'react-native';
  }
  
  if (typeof window !== 'undefined') {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return 'ios';
    }
    if (/android/.test(userAgent)) {
      return 'android';
    }
  }
  
  return 'web';
};

// Types for config and callbacks
export interface IntegrationCallbacks {
  onUserLogin?: (user: any) => void;
  onUserLogout?: () => void;
  onProfileUpdate?: (profile: any) => void;
  onError?: (error: any) => void;
}

export interface LayoutOptions {
  useCustomHeader?: boolean;
  headerComponent?: React.ReactNode;
  useCustomFooter?: boolean;
  footerComponent?: React.ReactNode;
  useCustomLayout?: boolean;
  layoutComponent?: React.ComponentType<{ children: ReactNode }>;
}

export interface PlatformUIComponents {
  // Alternative components for different platforms
  Button?: React.ComponentType<any>;
  Input?: React.ComponentType<any>;
  Select?: React.ComponentType<any>;
  Switch?: React.ComponentType<any>;
  Card?: React.ComponentType<any>;
  // Navigation components for mobile
  TabNavigator?: React.ComponentType<any>;
  StackNavigator?: React.ComponentType<any>;
}

export interface MobileConfig {
  // Mobile-specific options
  useNativeStorage?: boolean;
  statusBarConfig?: {
    style?: 'default' | 'light-content' | 'dark-content';
    backgroundColor?: string;
  };
  screenOptions?: Record<string, any>;
  safeAreaInsets?: {
    top?: boolean | number;
    bottom?: boolean | number;
    left?: boolean | number;
    right?: boolean | number;
  };
}

export interface UserManagementConfig {
  apiBaseUrl?: string;
  callbacks?: IntegrationCallbacks;
  layout?: LayoutOptions;
  i18nNamespace?: string;
  storageKeyPrefix?: string;
  notifications?: NotificationConfig;
  platform?: Platform;
  isNative?: boolean; // Flag to indicate if running in a native mobile container
  ui?: PlatformUIComponents; // Platform-specific UI components
  mobileConfig?: MobileConfig; // Mobile-specific configuration
  twoFactor?: TwoFactorProviderConfig;
  subscription?: SubscriptionProviderConfig;
  corporateUsers?: CorporateUserConfig;
  oauth?: OAuthModuleConfig;
}

// Create a context for accessing configuration
interface UserManagementContextValue {
  config: UserManagementConfig;
  callbacks: Required<IntegrationCallbacks>;
  layout: Required<LayoutOptions>;
  platform: Platform;
  isNative: boolean;
  ui: PlatformUIComponents;
  api: any;
  storageKeyPrefix: string;
  i18nNamespace: string;
  twoFactor: TwoFactorProviderConfig;
  subscription: SubscriptionProviderConfig;
  corporateUsers: CorporateUserConfig;
  oauth: OAuthModuleConfig;
}

const defaultCallbacks: Required<IntegrationCallbacks> = {
  onUserLogin: () => {},
  onUserLogout: () => {},
  onProfileUpdate: () => {},
  onError: () => {},
};

const defaultLayout: Required<LayoutOptions> = {
  useCustomHeader: false,
  headerComponent: null,
  useCustomFooter: false,
  footerComponent: null,
  useCustomLayout: false,
  layoutComponent: ({ children }) => <>{children}</>,
};

const UserManagementContext = createContext<UserManagementContextValue>({
  config: {},
  callbacks: defaultCallbacks,
  layout: defaultLayout,
  platform: 'web',
  isNative: false,
  ui: {},
  api: api,
  storageKeyPrefix: 'user',
  i18nNamespace: 'userManagement',
  twoFactor: {
    enabled: false,
    methods: [],
    required: false,
  },
  subscription: {
    enabled: false,
    defaultTier: SubscriptionTier.FREE,
    features: {},
    enableBilling: false,
  },
  corporateUsers: {
    enabled: false,
    registrationEnabled: true,
    requireCompanyValidation: false,
    allowUserTypeChange: false,
    companyFieldsRequired: ['name'],
    defaultUserType: UserType.PRIVATE,
  },
  oauth: {
    enabled: false,
    providers: [],
    autoLink: true,
    allowUnverifiedEmails: false,
    defaultRedirectPath: '/',
  },
});

// Hook for accessing the user management context
export const useUserManagement = () => useContext(UserManagementContext);

// Platform-specific component helper
export const PlatformComponent = ({ 
  web, 
  mobile,
  component,
  ...props 
}: { 
  web?: React.ReactNode; 
  mobile?: React.ReactNode;
  component?: string;
  [key: string]: any; 
}) => {
  const { platform, isNative, ui } = useUserManagement();
  
  if (isNative && mobile) {
    return <>{mobile}</>;
  }
  
  if (component && ui[component as keyof PlatformUIComponents]) {
    const Component = ui[component as keyof PlatformUIComponents] as React.ComponentType<any>;
    return <Component {...props} />;
  }
  
  return <>{web}</>;
};

// Initialize API with custom base URL if provided
const initializeApi = (baseUrl?: string) => {
  if (baseUrl) {
    api.defaults.baseURL = baseUrl;
  }
};

interface UserManagementProviderProps {
  children?: ReactNode;
  router?: typeof defaultRouter;
  config?: UserManagementConfig;
}

export function UserManagementProvider({
  children,
  router = defaultRouter,
  config = {},
}: UserManagementProviderProps) {
  // Detect platform
  const detectedPlatform = config.platform || detectPlatform();
  const isNative = config.isNative || detectedPlatform !== 'web';

  // Initialize API if base URL is provided
  React.useEffect(() => {
    initializeApi(config.apiBaseUrl);
  }, [config.apiBaseUrl]);

  // Initialize notifications if config is provided
  React.useEffect(() => {
    if (config.notifications) {
      // Set the platform in the notification config if not explicitly provided
      const notificationConfig = {
        ...config.notifications,
        platform: config.notifications.platform || detectedPlatform,
      };
      initializeNotifications(notificationConfig);
    }
  }, [config.notifications, detectedPlatform]);

  // Set up auth callbacks
  const authStore = useAuthStore();
  React.useEffect(() => {
    // Store original methods
    const originalLogin = authStore.login;
    const originalLogout = authStore.logout;

    // Override methods to include callbacks
    if (config.callbacks?.onUserLogin) {
      const newLogin = async (email: string, password: string) => {
        try {
          await originalLogin(email, password);
          if (authStore.user) {
            config.callbacks?.onUserLogin?.(authStore.user);
          }
        } catch (error) {
          config.callbacks?.onError?.(error);
          throw error;
        }
      };
      
      authStore.login = newLogin;
    }

    if (config.callbacks?.onUserLogout) {
      const newLogout = async () => {
        try {
          await originalLogout();
          config.callbacks?.onUserLogout?.();
        } catch (error) {
          config.callbacks?.onError?.(error);
          throw error;
        }
      };
      
      authStore.logout = newLogout;
    }

    // Cleanup
    return () => {
      authStore.login = originalLogin;
      authStore.logout = originalLogout;
    };
  }, [authStore, config.callbacks]);

  // Get settings store
  const settings = useSettingsStore();

  // Prepare context value
  const contextValue: UserManagementContextValue = {
    config,
    callbacks: {
      onUserLogin: config.callbacks?.onUserLogin || (() => {}),
      onUserLogout: config.callbacks?.onUserLogout || (() => {}),
      onProfileUpdate: config.callbacks?.onProfileUpdate || (() => {}),
      onError: config.callbacks?.onError || (() => {}),
    },
    layout: {
      useCustomHeader: config.layout?.useCustomHeader || false,
      headerComponent: config.layout?.headerComponent || null,
      useCustomFooter: config.layout?.useCustomFooter || false,
      footerComponent: config.layout?.footerComponent || null,
      useCustomLayout: config.layout?.useCustomLayout || false,
      layoutComponent: config.layout?.layoutComponent || (({ children }) => <>{children}</>),
    },
    platform: detectedPlatform,
    isNative,
    ui: config.ui || {},
    api: api,
    storageKeyPrefix: config.storageKeyPrefix || 'user',
    i18nNamespace: config.i18nNamespace || 'userManagement',
    twoFactor: config.twoFactor || {
      enabled: false,
      methods: [],
      required: false,
    },
    subscription: config.subscription || {
      enabled: false,
      defaultTier: SubscriptionTier.FREE,
      features: {},
      enableBilling: false,
    },
    corporateUsers: config.corporateUsers || {
      enabled: false,
      registrationEnabled: true,
      requireCompanyValidation: false,
      allowUserTypeChange: false,
      companyFieldsRequired: ['name'],
      defaultUserType: UserType.PRIVATE,
    },
    oauth: config.oauth || {
      enabled: false,
      providers: [],
      autoLink: true,
      allowUnverifiedEmails: false,
      defaultRedirectPath: '/',
    },
  };

  // For native platforms, we might want to skip certain web-specific components
  const renderToaster = !isNative || detectedPlatform === 'react-native';

  // Apply mobile configuration if needed
  if (isNative && config.mobileConfig?.statusBarConfig && typeof document !== 'undefined') {
    // This is a placeholder for where you would configure the status bar in a real React Native app
    // In a real app, you would use: StatusBar.setBarStyle(...) and StatusBar.setBackgroundColor(...)
    document.documentElement.style.setProperty(
      '--status-bar-height', 
      `${config.mobileConfig.statusBarConfig ? '20px' : '0px'}`
    );
  }

  return (
    <UserManagementContext.Provider value={contextValue}>
      <ThemeProvider defaultTheme="light" storageKey={`${config.storageKeyPrefix || 'user-management'}-theme`}>
        {router && !isNative ? (
          <RouterProvider router={router} />
        ) : (
          children
        )}
        {renderToaster && <Toaster />}
      </ThemeProvider>
    </UserManagementContext.Provider>
  );
} 