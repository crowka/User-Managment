import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

export function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="container max-w-md mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        {t('auth.register.title', 'Create Your Account')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <RegistrationForm />
        <div className="mt-4 text-sm text-center">
          <p>
            {t('auth.register.haveAccount', 'Already have an account?')} {' '}
            <Link to="/login" className="text-primary hover:underline">
              {t('auth.register.signIn', 'Sign in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 