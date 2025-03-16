import { z } from 'zod';

/**
 * Enum for different user types
 */
export enum UserType {
  PRIVATE = 'private',
  CORPORATE = 'corporate',
}

/**
 * Schema for company information
 */
export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  position: z.string().optional(),
  department: z.string().optional(),
  vatId: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

export type Company = z.infer<typeof companySchema>;

/**
 * Provider configuration for corporate user features
 */
export interface CorporateUserConfig {
  enabled: boolean;
  registrationEnabled: boolean;
  requireCompanyValidation: boolean;
  allowUserTypeChange: boolean;
  companyFieldsRequired: string[];
  defaultUserType: UserType;
} 