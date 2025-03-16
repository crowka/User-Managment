'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Phone, Mail } from 'lucide-react';
import { registerSchema, type RegisterData } from '@/lib/types/auth';
import { useAuthStore } from '@/lib/stores/auth.store';
import { isFeatureEnabled } from '@/lib/config/features';
import { createClient } from '@/lib/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { register: registerUser, isLoading, error } = useAuthStore();
  const supabase = createClient();

  const showBusinessFeatures = isFeatureEnabled('AUTH.BUSINESS_ACCOUNTS');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      userType: 'private',
      acceptTerms: false,
    },
  });

  const userType = watch('userType');
  const showBusinessFields = showBusinessFeatures && userType === 'business';

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) throw error;
      // Redirect will happen automatically
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handlePhoneVerification = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) throw error;
      setIsVerifying(true);
    } catch (error) {
      console.error('Error sending verification code:', error);
    }
  };

  const verifyPhoneCode = async () => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: verificationCode,
        type: 'sms',
      });

      if (error) throw error;
      // Handle successful verification
    } catch (error) {
      console.error('Error verifying code:', error);
    }
  };

  const onSubmit = async (data: RegisterData) => {
    await registerUser(data);
  };

  return (
    <div className="space-y-6">
      {/* Social Sign-in Options */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Verification Method Selection */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setVerificationMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md ${
            verificationMethod === 'email' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email
        </button>
        <button
          type="button"
          onClick={() => setVerificationMethod('phone')}
          className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-md ${
            verificationMethod === 'phone' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
          }`}
        >
          <Phone className="w-4 h-4" />
          Phone
        </button>
      </div>

      {verificationMethod === 'phone' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="flex-1 px-3 py-2 border rounded-md"
              />
              <button
                type="button"
                onClick={handlePhoneVerification}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                Send Code
              </button>
            </div>
          </div>

          {isVerifying && (
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Verification Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={verifyPhoneCode}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Verify
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {showBusinessFeatures && (
            <div className="space-y-2">
              <label htmlFor="userType" className="text-sm font-medium">
                Account Type
              </label>
              <select
                {...register('userType')}
                id="userType"
                className="w-full px-3 py-2 border rounded-md"
                disabled={isLoading}
              >
                <option value="private">Private Account</option>
                <option value="business">Business Account</option>
              </select>
              {errors.userType && (
                <p className="text-sm text-red-500">{errors.userType.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <input
              {...register('name')}
              id="name"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full px-3 py-2 border rounded-md"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border rounded-md pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full px-3 py-2 border rounded-md pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('acceptTerms')}
              id="acceptTerms"
              type="checkbox"
              className="rounded border-gray-300"
              disabled={isLoading}
            />
            <label htmlFor="acceptTerms" className="text-sm">
              I accept the{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  );
} 