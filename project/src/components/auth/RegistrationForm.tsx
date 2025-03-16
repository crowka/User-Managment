import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserType } from '@/lib/types/user-type';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlatformComponent } from '@/lib/UserManagementProvider';

// Base registration schema
const baseRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

// Private user schema
const privateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.PRIVATE),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

// Corporate user schema
const corporateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.CORPORATE),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
});

// Combined schema with refinement for password matching
const registrationSchema = z.discriminatedUnion('userType', [
  privateUserSchema,
  corporateUserSchema,
]).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const { t } = useTranslation();
  const { corporateUsers } = useUserManagement();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const [userType, setUserType] = useState<UserType>(corporateUsers.defaultUserType);
  
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      userType: corporateUsers.defaultUserType,
      acceptTerms: false,
    },
  });
  
  const onSubmit = async (data: RegistrationFormValues) => {
    // Create company object for corporate users
    const company = data.userType === UserType.CORPORATE ? {
      name: data.companyName,
      position: data.position,
      industry: data.industry,
      size: data.companySize,
    } : undefined;
    
    // Register user with backend
    await registerUser({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      userType: data.userType,
      company,
    });
  };
  
  // Switch user type and reset related fields
  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    form.setValue('userType', type);
    
    // Reset company-related fields when switching to private
    if (type === UserType.PRIVATE) {
      form.setValue('companyName', '');
      form.setValue('position', '');
      form.setValue('industry', '');
      form.setValue('companySize', undefined);
    }
  };
  
  // Only show user type selection if corporate users feature is enabled
  const showUserTypeSelection = corporateUsers.enabled && corporateUsers.registrationEnabled;
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.register.title')}</h1>
        <p className="text-muted-foreground">
          {t('auth.register.description')}
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* User Type Selection */}
        {showUserTypeSelection && (
          <div className="space-y-2">
            <Label>{t('auth.register.userType')}</Label>
            <RadioGroup 
              defaultValue={corporateUsers.defaultUserType} 
              value={userType}
              onValueChange={(value) => handleUserTypeChange(value as UserType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserType.PRIVATE} id="private" />
                <Label htmlFor="private">{t('auth.register.privateUser')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={UserType.CORPORATE} id="corporate" />
                <Label htmlFor="corporate">{t('auth.register.corporateUser')}</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        {/* Email & Password Fields - Common for both user types */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.register.email')}</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="email@example.com" 
            {...form.register('email')} 
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('auth.register.firstName')}</Label>
            <Input 
              id="firstName" 
              {...form.register('firstName')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('auth.register.lastName')}</Label>
            <Input 
              id="lastName" 
              {...form.register('lastName')} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.register.password')}</Label>
          <Input 
            id="password" 
            type="password" 
            {...form.register('password')} 
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
          <Input 
            id="confirmPassword" 
            type="password" 
            {...form.register('confirmPassword')} 
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-destructive text-sm">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        
        {/* Corporate User Fields */}
        {userType === UserType.CORPORATE && (
          <div className="space-y-4 p-4 border rounded-md bg-muted/20">
            <h3 className="font-medium">{t('auth.register.companyInformation')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('auth.register.companyName')} *</Label>
              <Input 
                id="companyName" 
                {...form.register('companyName')} 
              />
              {form.formState.errors.companyName && (
                <p className="text-destructive text-sm">{form.formState.errors.companyName.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">{t('auth.register.position')}</Label>
                <Input 
                  id="position" 
                  {...form.register('position')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">{t('auth.register.industry')}</Label>
                <Input 
                  id="industry" 
                  {...form.register('industry')} 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companySize">{t('auth.register.companySize')}</Label>
              <select
                id="companySize"
                className="w-full px-3 py-2 border rounded-md"
                {...form.register('companySize')}
              >
                <option value="">{t('auth.register.selectCompanySize')}</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Terms and Conditions */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="acceptTerms" 
            {...form.register('acceptTerms')} 
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            {t('auth.register.termsAgree')} <a href="#" className="underline">{t('auth.register.termsLink')}</a>
          </Label>
        </div>
        {form.formState.errors.acceptTerms && (
          <p className="text-destructive text-sm">{form.formState.errors.acceptTerms.message}</p>
        )}
        
        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t('common.loading') : t('auth.register.submit')}
        </Button>
        
        {/* Login Link */}
        <div className="text-center text-sm">
          {t('auth.register.alreadyHaveAccount')} <a href="/login" className="underline">{t('auth.login.title')}</a>
        </div>
      </form>
    </div>
  );
} 