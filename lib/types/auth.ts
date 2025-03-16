import { z } from 'zod';
import { User as SupabaseUser } from '@supabase/supabase-js'

// Core domain types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: string;
  userType: 'private' | 'business';
  businessInfo?: BusinessInfo;
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessInfo {
  companyName: string;
  businessSize: '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  industry: string;
  phoneNumber: string;
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
}

// Auth types that abstract Supabase
export type AppUser = Pick<SupabaseUser, 'id' | 'email' | 'user_metadata' | 'app_metadata'> & {
  profile?: UserProfile;
}

// Validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const userTypeSchema = z.enum(['private', 'business'], {
  required_error: 'Please select an account type',
});

export const businessInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  businessSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    required_error: 'Please select your business size',
  }),
  industry: z.string().min(1, 'Industry is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

// Auth provider interface
export interface IAuthProvider {
  signIn(credentials: AuthCredentials): Promise<AppUser | null>;
  signUp(data: RegisterData): Promise<AppUser | null>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(oldPassword: string, newPassword: string): Promise<void>;
  signInWithProvider(provider: 'google' | 'github'): Promise<AppUser | null>;
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void;
}

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Full name is required'),
  userType: userTypeSchema,
  businessInfo: businessInfoSchema.optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.userType === 'business') {
      return data.businessInfo !== undefined;
    }
    return true;
  },
  {
    message: "Business information is required for business accounts",
    path: ["businessInfo"],
  }
);

// Form data types
export interface AuthCredentials {
  email: string;
  password: string;
}

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Context type
export interface AuthContextType {
  user: AppUser | null;
  signIn: (credentials: AuthCredentials) => Promise<AppUser | null>;
  signUp: (data: RegisterData) => Promise<AppUser | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<AppUser | null>;
} 