import { useEffect, useState } from 'react';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { SubscriptionPeriod, SubscriptionTier } from '@/lib/types/subscription';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { PlatformComponent } from '@/lib/UserManagementProvider';

export interface SubscriptionPlansProps {
  onSelect?: (planId: string) => void;
  showFreePlan?: boolean;
  periods?: SubscriptionPeriod[];
  defaultPeriod?: SubscriptionPeriod;
  className?: string;
}

export function SubscriptionPlans({
  onSelect,
  showFreePlan = true,
  periods = [SubscriptionPeriod.MONTHLY, SubscriptionPeriod.YEARLY],
  defaultPeriod = SubscriptionPeriod.MONTHLY,
  className = '',
}: SubscriptionPlansProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { plans, fetchPlans, userSubscription, fetchUserSubscription, isLoading, error } = useSubscriptionStore();
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>(defaultPeriod);
  
  useEffect(() => {
    // Fetch available plans
    fetchPlans();
    
    // Fetch user's subscription if user is logged in
    if (user) {
      fetchUserSubscription(String(user.id));
    }
  }, [fetchPlans, fetchUserSubscription, user]);
  
  // Filter plans based on selected period and showFreePlan option
  const filteredPlans = plans.filter(plan => {
    const isMatchingPeriod = plan.period === selectedPeriod;
    const isFreePlan = plan.tier === SubscriptionTier.FREE;
    
    return isMatchingPeriod && (showFreePlan || !isFreePlan);
  });
  
  // Check if a plan is the user's current plan
  const isCurrentPlan = (planId: string) => {
    return userSubscription?.planId === planId && 
           (userSubscription?.status === 'active' || userSubscription?.status === 'trial');
  };
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    onSelect?.(planId);
  };
  
  // Calculate savings percentage for yearly plans
  const getSavingsPercent = (plan: any) => {
    if (plan.period !== SubscriptionPeriod.YEARLY) return null;
    
    // Find the equivalent monthly plan
    const monthlyPlan = plans.find(p => 
      p.tier === plan.tier && p.period === SubscriptionPeriod.MONTHLY
    );
    
    if (!monthlyPlan) return null;
    
    const yearlyCost = plan.price;
    const monthlyCost = monthlyPlan.price * 12;
    const savings = monthlyCost - yearlyCost;
    const savingsPercent = Math.round((savings / monthlyCost) * 100);
    
    return savingsPercent > 0 ? savingsPercent : null;
  };
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Period selector */}
      {periods.length > 1 && (
        <div className="flex justify-center space-x-2 mb-8">
          {periods.map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {t(`subscription.period.${period.toLowerCase()}`)}
            </Button>
          ))}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-red-500 text-center mb-4">
          {t('subscription.error.loading')}
        </div>
      )}
      
      {/* Plans grid */}
      <PlatformComponent
        web={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlans.map(plan => (
              <Card 
                key={plan.id}
                className={`
                  border ${plan.tier === SubscriptionTier.PREMIUM ? 'border-purple-400 shadow-md' : 'border-gray-200'}
                  ${isCurrentPlan(plan.id) ? 'bg-blue-50' : ''}
                `}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {t(`subscription.tier.${plan.tier.toLowerCase()}`)}
                    
                    {/* Show savings badge for yearly plans */}
                    {getSavingsPercent(plan) && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {t('subscription.savingsPercent', { percent: getSavingsPercent(plan) })}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-1 text-2xl font-bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(plan.price)}
                      <span className="text-sm font-normal ml-1">
                        /{t(`subscription.period.short.${plan.period.toLowerCase()}`)}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.tier === SubscriptionTier.FREE ? "outline" : "default"}
                    className="w-full"
                    disabled={isLoading || isCurrentPlan(plan.id)}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan(plan.id)
                      ? t('subscription.currentPlan')
                      : t('subscription.choosePlan')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        }
        
        mobile={
          <div className="space-y-4">
            {filteredPlans.map(plan => (
              <Card 
                key={plan.id}
                className={`
                  border ${plan.tier === SubscriptionTier.PREMIUM ? 'border-purple-400 shadow-md' : 'border-gray-200'}
                  ${isCurrentPlan(plan.id) ? 'bg-blue-50' : ''}
                `}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {t(`subscription.tier.${plan.tier.toLowerCase()}`)}
                    
                    {/* Show savings badge for yearly plans */}
                    {getSavingsPercent(plan) && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {t('subscription.savingsPercent', { percent: getSavingsPercent(plan) })}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <div className="mt-1 text-2xl font-bold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(plan.price)}
                      <span className="text-sm font-normal ml-1">
                        /{t(`subscription.period.short.${plan.period.toLowerCase()}`)}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-sm text-gray-500">
                        {t('subscription.moreFeaturesCount', { count: plan.features.length - 3 })}
                      </li>
                    )}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.tier === SubscriptionTier.FREE ? "outline" : "default"}
                    className="w-full"
                    disabled={isLoading || isCurrentPlan(plan.id)}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    {isCurrentPlan(plan.id)
                      ? t('subscription.currentPlan')
                      : t('subscription.choosePlan')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        }
      />
    </div>
  );
} 