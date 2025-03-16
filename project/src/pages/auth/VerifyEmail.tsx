import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/auth.store';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, sendVerificationEmail, isLoading, error } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setIsVerifying(true);
      verifyEmail(token);
    }
  }, [searchParams, verifyEmail]);

  const handleResendVerification = async () => {
    await sendVerificationEmail();
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLoading ? 'Verifying your email...' : error ? 'Verification failed' : 'Email verified!'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLoading
                ? 'Please wait while we verify your email address.'
                : error
                ? 'There was a problem verifying your email. Please try again.'
                : 'Your email has been successfully verified. You can now log in.'}
            </p>
          </div>

          {error && (
            <div className="mt-4">
              <button
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Resend verification email
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="mt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Go to login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent you a verification link. Please check your email and click the link to verify your account.
          </p>
        </div>

        <div className="mt-4">
          <button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Resend verification email
          </button>
        </div>
      </div>
    </div>
  );
} 