// Main provider
export {
  UserManagementProvider,
  useUserManagement,
  type UserManagementConfig,
  type IntegrationCallbacks,
  type LayoutOptions
} from './lib/UserManagementProvider';

// Auth components and hooks
export { LoginForm } from './components/auth/LoginForm';
export { RegisterForm } from './components/auth/RegisterForm';
export { ProtectedRoute } from './components/auth/ProtectedRoute';
export { useAuthStore } from './lib/stores/auth.store';
export type { AuthState } from './lib/types/auth';

// Profile components and hooks
export { ProfileForm } from './components/profile/ProfileForm';
export { useProfileStore } from './lib/stores/profile.store';
export type { Profile, ProfileFormData } from './lib/types/profile';

// Settings components and hooks
export { SettingsPage } from './pages/settings/SettingsPage';
export { LanguageSelector } from './components/settings/LanguageSelector';
export { useSettingsStore } from './lib/stores/settings.store';

// Utility exports
export { router } from './lib/router';
export { api } from './lib/api/axios';
export { default as i18n, initializeI18n, languages, USER_MANAGEMENT_NAMESPACE } from './lib/i18n';

// Theme system
export { ThemeProvider, useTheme } from './components/theme-provider';
export { cn } from './lib/utils';

// UI Components that can be reused
export { Button } from './components/ui/button';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Textarea } from './components/ui/textarea';
export { Switch } from './components/ui/switch';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
export { Toaster } from './components/ui/toaster'; 