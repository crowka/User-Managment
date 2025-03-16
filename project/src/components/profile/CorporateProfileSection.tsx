import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { UserType, companySchema, Company } from '@/lib/types/user-type';
import { useUserManagement } from '@/lib/UserManagementProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';

interface CorporateProfileSectionProps {
  userType: UserType;
  company?: Company;
  onUpdate: (company: Company) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const corporateFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  position: z.string().optional(),
  department: z.string().optional(),
  vatId: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type CorporateFormValues = z.infer<typeof corporateFormSchema>;

export function CorporateProfileSection({
  userType,
  company,
  onUpdate,
  isLoading = false,
  error = null,
}: CorporateProfileSectionProps) {
  const { t } = useTranslation();
  const { corporateUsers } = useUserManagement();
  
  // Only show if corporate users is enabled and user is a corporate user
  if (!corporateUsers.enabled || userType !== UserType.CORPORATE) {
    return null;
  }
  
  const form = useForm<CorporateFormValues>({
    resolver: zodResolver(corporateFormSchema),
    defaultValues: {
      name: company?.name || '',
      industry: company?.industry || '',
      website: company?.website || '',
      position: company?.position || '',
      department: company?.department || '',
      vatId: company?.vatId || '',
      size: company?.size,
      address: company?.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });
  
  const onSubmit = async (data: CorporateFormValues) => {
    await onUpdate(data as Company);
  };
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t('profile.corporate.title')}</CardTitle>
        <CardDescription>{t('profile.corporate.description')}</CardDescription>
      </CardHeader>
      
      {error && (
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyDetails')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.corporate.companyName')} *</Label>
              <Input 
                id="name" 
                {...form.register('name')} 
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">{t('profile.corporate.industry')}</Label>
                <Input 
                  id="industry" 
                  {...form.register('industry')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">{t('profile.corporate.companySize')}</Label>
                <select
                  id="size"
                  className="w-full px-3 py-2 border rounded-md"
                  {...form.register('size')}
                >
                  <option value="">{t('profile.corporate.selectCompanySize')}</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">{t('profile.corporate.website')}</Label>
              <Input 
                id="website" 
                placeholder="https://example.com" 
                {...form.register('website')} 
              />
              {form.formState.errors.website && (
                <p className="text-destructive text-sm">{form.formState.errors.website.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vatId">{t('profile.corporate.vatId')}</Label>
              <Input 
                id="vatId" 
                {...form.register('vatId')} 
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.yourPosition')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">{t('profile.corporate.position')}</Label>
                <Input 
                  id="position" 
                  {...form.register('position')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('profile.corporate.department')}</Label>
                <Input 
                  id="department" 
                  {...form.register('department')} 
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyAddress')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">{t('profile.corporate.street')}</Label>
              <Input 
                id="street" 
                {...form.register('address.street')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('profile.corporate.city')}</Label>
                <Input 
                  id="city" 
                  {...form.register('address.city')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('profile.corporate.state')}</Label>
                <Input 
                  id="state" 
                  {...form.register('address.state')} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('profile.corporate.postalCode')}</Label>
                <Input 
                  id="postalCode" 
                  {...form.register('address.postalCode')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('profile.corporate.country')}</Label>
                <Input 
                  id="country" 
                  {...form.register('address.country')} 
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 