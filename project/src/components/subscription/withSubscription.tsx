import React, { ReactNode } from 'react';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionTier } from '@/lib/types/subscription';
import { useUserManagement } from '@/lib/UserManagementProvider';

export interface WithSubscriptionProps {
  featureName?: string;
  requiredTier?: SubscriptionTier;
  fallback?: ReactNode;
}

/**
 * Higher-Order Component for gating features based on subscription status
 * @param WrappedComponent Component to render if the subscription conditions are met
 * @param options Configuration options for subscription checks
 * @returns A component that conditionally renders based on subscription status
 */
export function withSubscription<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithSubscriptionProps = {}
) {
  return function WithSubscriptionComponent(props: P) {
    const { hasFeature, getTier } = useSubscriptionStore();
    const { subscription } = useUserManagement();
    
    // If subscriptions are disabled, always render the component
    if (!subscription.enabled) {
      return <WrappedComponent {...props} />;
    }
    
    // Check if user has access to this feature
    const hasAccess = options.featureName 
      ? hasFeature(options.featureName)
      : options.requiredTier 
        ? getTier() >= options.requiredTier
        : true;
    
    // Render the component if user has access, otherwise render the fallback
    return hasAccess 
      ? <WrappedComponent {...props} /> 
      : options.fallback || null;
  };
}

/**
 * Component for conditionally rendering content based on subscription status
 */
export function SubscriptionGate({
  children,
  featureName,
  requiredTier,
  fallback,
}: React.PropsWithChildren<WithSubscriptionProps>) {
  const { hasFeature, getTier } = useSubscriptionStore();
  const { subscription } = useUserManagement();
  
  // If subscriptions are disabled, always render the children
  if (!subscription.enabled) {
    return <>{children}</>;
  }
  
  // Check if user has access to this feature
  const hasAccess = featureName 
    ? hasFeature(featureName)
    : requiredTier 
      ? getTier() >= requiredTier
      : true;
  
  // Render children if user has access, otherwise render the fallback
  return hasAccess 
    ? <>{children}</> 
    : fallback ? <>{fallback}</> : null;
} 