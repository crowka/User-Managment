import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';

export function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Welcome to User Management
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A powerful and flexible user management system that can be integrated into any application.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button>View Profile</Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline">Settings</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Authentication</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Secure user authentication with email/password, social login, and two-factor authentication.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Profile Management</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Customizable user profiles with avatar support and privacy settings.
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-semibold">Role-Based Access</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Flexible role and permission system for controlling user access.
          </p>
        </div>
      </div>
    </div>
  );
} 