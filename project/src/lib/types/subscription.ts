import { z } from 'zod';

/**
 * Enum for different subscription tiers
 */
export enum SubscriptionTier {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

/**
 * Enum for subscription periods
 */
export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
}

/**
 * Enum for subscription status
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
  PAST_DUE = 'past_due',
}

/**
 * Schema for subscription plans
 */
export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.nativeEnum(SubscriptionTier),
  price: z.number(),
  period: z.nativeEnum(SubscriptionPeriod),
  features: z.array(z.string()),
  isPublic: z.boolean().default(true),
  trialDays: z.number().default(0),
  metadata: z.record(z.any()).optional(),
});

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

/**
 * Schema for user subscriptions
 */
export const userSubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  status: z.nativeEnum(SubscriptionStatus),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  renewalDate: z.string().or(z.date()).optional(),
  canceledAt: z.string().or(z.date()).optional(),
  paymentMethod: z.string().optional(),
  paymentProviderData: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

export type UserSubscription = z.infer<typeof userSubscriptionSchema>;

/**
 * State interface for subscription store
 */
export interface SubscriptionState {
  plans: SubscriptionPlan[];
  userSubscription: UserSubscription | null;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  fetchPlans: () => Promise<SubscriptionPlan[]>;
  fetchUserSubscription: (userId: string) => Promise<UserSubscription | null>;
  subscribe: (userId: string, planId: string, paymentMethod?: string) => Promise<UserSubscription>;
  cancelSubscription: (subscriptionId: string, immediate?: boolean) => Promise<void>;
  updateSubscription: (subscriptionId: string, planId: string) => Promise<UserSubscription>;
  
  // Helper methods
  isSubscribed: () => boolean;
  hasFeature: (featureName: string) => boolean;
  getTier: () => SubscriptionTier;
  getRemainingTrialDays: () => number | null;
  clearError: () => void;
}

/**
 * Provider configuration for subscription features
 */
export interface SubscriptionProviderConfig {
  enabled: boolean;
  defaultTier: SubscriptionTier;
  features: {
    [key: string]: {
      tier: SubscriptionTier;
      description: string;
    }
  };
  enableBilling: boolean;
  paymentProviders?: string[];
} 