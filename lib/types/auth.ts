import { z } from 'zod';

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

// Business-specific schema
export const businessInfoSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  businessSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+'], {
    required_error: 'Please select your business size',
  }),
  industry: z.string().min(1, 'Industry is required'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Validation schemas for forms
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Full name is required'),
  userType: userTypeSchema,
  businessInfo: z.object({
    companyName: z.string(),
    businessSize: z.string(),
    industry: z.string(),
    phoneNumber: z.string(),
  }).optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine(
  (data) => {
    if (data.userType === 'business') {
      return data.businessInfo && 
        data.businessInfo.companyName && 
        data.businessInfo.businessSize && 
        data.businessInfo.industry && 
        data.businessInfo.phoneNumber;
    }
    return true;
  },
  {
    message: "Business information is required for business accounts",
    path: ["businessInfo"],
  }
);

// Infer types from schemas
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Store types
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
} 