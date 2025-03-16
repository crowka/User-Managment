import { router } from '@/lib/router';
import { UserManagementProvider } from '@/lib/UserManagementProvider';
import '@/lib/i18n';

function App() {
  return (
    <UserManagementProvider
      router={router}
      config={{
        apiBaseUrl: import.meta.env.VITE_API_URL,
        storageKeyPrefix: 'user-mgmt',
        callbacks: {
          onUserLogin: (user) => {
            console.log('User logged in:', user);
          },
          onUserLogout: () => {
            console.log('User logged out');
          },
          onProfileUpdate: (profile) => {
            console.log('Profile updated:', profile);
          },
          onError: (error) => {
            console.error('Error in user management:', error);
          }
        }
      }}
    />
  );
}

export default App;