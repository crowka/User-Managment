import { create } from 'zustand';
import { api } from '../api/axios';
import { 
  SubscriptionState, 
  SubscriptionTier, 
  SubscriptionPlan,
  UserSubscription
} from '../types/subscription';
import { useUserManagement } from '../UserManagementProvider';

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  userSubscription: null,
  isLoading: false,
  error: null,

  // Fetch available subscription plans
  fetchPlans: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/subscriptions/plans');
      set({ plans: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch subscription plans',
        isLoading: false,
      });
      return [];
    }
  },

  // Fetch current user's subscription
  fetchUserSubscription: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/subscriptions/users/${userId}`);
      set({ userSubscription: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      // If 404, user has no subscription - this is a valid state
      if (error.response?.status === 404) {
        set({ userSubscription: null, isLoading: false });
        return null;
      }
      
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch user subscription',
        isLoading: false,
      });
      return null;
    }
  },

  // Subscribe user to a plan
  subscribe: async (userId: string, planId: string, paymentMethod?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/subscriptions', {
        userId,
        planId,
        paymentMethod,
      });
      set({ userSubscription: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string, immediate = false) => {
    try {
      set({ isLoading: true, error: null });
      await api.post(`/subscriptions/${subscriptionId}/cancel`, { immediate });
      
      if (immediate) {
        set({ userSubscription: null, isLoading: false });
      } else {
        // Update status to canceled but maintain access until end date
        set((state) => ({
          userSubscription: state.userSubscription 
            ? { 
                ...state.userSubscription, 
                status: 'canceled',
                canceledAt: new Date().toISOString() 
              } 
            : null,
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  // Update subscription plan
  updateSubscription: async (subscriptionId: string, planId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.put(`/subscriptions/${subscriptionId}`, { planId });
      set({ userSubscription: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update subscription',
        isLoading: false,
      });
      throw error;
    }
  },

  // Helper: Check if user is subscribed (has an active subscription beyond free tier)
  isSubscribed: () => {
    const { userSubscription } = get();
    if (!userSubscription) return false;

    const isActive = userSubscription.status === 'active' || userSubscription.status === 'trial';
    const plan = get().plans.find(p => p.id === userSubscription.planId);
    
    return isActive && plan && plan.tier !== SubscriptionTier.FREE;
  },

  // Helper: Check if user has access to a specific feature
  hasFeature: (featureName: string) => {
    const { userManagement } = useUserManagement();
    const { userSubscription, plans } = get();
    
    // First check if there's a subscription config for the feature
    const featureConfig = userManagement?.subscription?.features?.[featureName];
    
    // If no configuration exists for this feature, assume it's available to all
    if (!featureConfig) return true;
    
    // Get user's current tier
    const currentTier = get().getTier();
    
    // Check if user's tier is high enough for this feature
    const tierValues = Object.values(SubscriptionTier);
    const featureTierIndex = tierValues.indexOf(featureConfig.tier);
    const userTierIndex = tierValues.indexOf(currentTier);
    
    return userTierIndex >= featureTierIndex;
  },

  // Helper: Get user's current subscription tier
  getTier: () => {
    const { userSubscription, plans } = get();
    const { userManagement } = useUserManagement();
    
    // If no subscription or not active, return default tier (usually FREE)
    if (!userSubscription || 
        (userSubscription.status !== 'active' && userSubscription.status !== 'trial')) {
      return userManagement?.subscription?.defaultTier || SubscriptionTier.FREE;
    }
    
    // Find the plan to get its tier
    const plan = plans.find(p => p.id === userSubscription.planId);
    return plan?.tier || SubscriptionTier.FREE;
  },

  // Helper: Get remaining trial days
  getRemainingTrialDays: () => {
    const { userSubscription } = get();
    
    if (!userSubscription || userSubscription.status !== 'trial' || !userSubscription.endDate) {
      return null;
    }
    
    const endDate = new Date(userSubscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  },

  // Clear any error messages
  clearError: () => {
    set({ error: null });
  },
})); 