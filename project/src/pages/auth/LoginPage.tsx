import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.login.title', 'Welcome Back')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <LoginForm />
        <div className="mt-4 text-sm text-center space-y-2">
          <p>
            <Link to="/forgot-password" className="text-primary hover:underline">
              {t('auth.login.forgotPassword', 'Forgot your password?')}
            </Link>
          </p>
          <p>
            {t('auth.login.noAccount', "Don't have an account?")} {' '}
            <Link to="/register" className="text-primary hover:underline">
              {t('auth.login.signUp', 'Sign up')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 