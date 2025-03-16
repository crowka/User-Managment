import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionTier } from '@/lib/types/subscription';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

// Define badge colors based on subscription tier
const tierColors = {
  [SubscriptionTier.FREE]: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  [SubscriptionTier.BASIC]: 'bg-blue-100 hover:bg-blue-200 text-blue-800',
  [SubscriptionTier.PREMIUM]: 'bg-purple-100 hover:bg-purple-200 text-purple-800',
  [SubscriptionTier.ENTERPRISE]: 'bg-amber-100 hover:bg-amber-200 text-amber-800',
};

export interface SubscriptionBadgeProps {
  showIcon?: boolean;
  variant?: 'default' | 'small' | 'large';
  asLink?: boolean;
  onClick?: () => void;
}

export function SubscriptionBadge({ 
  showIcon = true,
  variant = 'default',
  asLink = false,
  onClick
}: SubscriptionBadgeProps) {
  const { t } = useTranslation();
  const { getTier, isSubscribed, getRemainingTrialDays } = useSubscriptionStore();
  
  const tier = getTier();
  const trialDays = getRemainingTrialDays();
  
  // Size classes based on variant
  const sizeClasses = {
    small: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    large: 'text-base px-3 py-1',
  };
  
  // Get appropriate label based on subscription status
  let label = t(`subscription.tier.${tier.toLowerCase()}`);
  if (trialDays !== null) {
    label = t('subscription.trial', { days: trialDays });
  }
  
  return (
    <Badge 
      className={`
        font-medium ${tierColors[tier]} ${sizeClasses[variant]}
        ${asLink ? 'cursor-pointer' : ''}
      `}
      onClick={asLink ? onClick : undefined}
    >
      {showIcon && (
        <span className="mr-1">
          {tier === SubscriptionTier.FREE && '○'}
          {tier === SubscriptionTier.BASIC && '●'}
          {tier === SubscriptionTier.PREMIUM && '★'}
          {tier === SubscriptionTier.ENTERPRISE && '⬡'}
        </span>
      )}
      {label}
    </Badge>
  );
} 