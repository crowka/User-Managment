import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Checkbox } from '../ui/checkbox';

const registrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type RegistrationData = z.infer<typeof registrationSchema>;

const steps = ['Account', 'Profile', 'Verification', 'Terms'];

export function MultiStepRegistration() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationCode, setVerificationCode] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const progress = ((currentStep + 1) / steps.length) * 100;

  const onSubmit = async (data: RegistrationData) => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle final submission
      console.log('Registration data:', data);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
              />
              {errors.email && (
                <Alert variant="destructive">{errors.email.message}</Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && (
                <Alert variant="destructive">{errors.password.message}</Alert>
              )}
            </div>
          </>
        );

      case 1:
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register('name')}
              />
              {errors.name && (
                <Alert variant="destructive">{errors.name.message}</Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register('phone')}
              />
              {errors.phone && (
                <Alert variant="destructive">{errors.phone.message}</Alert>
              )}
            </div>
          </>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p>Enter the verification code sent to your email</p>
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                {...register('acceptTerms')}
              />
              <Label htmlFor="terms">
                I accept the terms and conditions
              </Label>
            </div>
            {errors.acceptTerms && (
              <Alert variant="destructive">{errors.acceptTerms.message}</Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Progress value={progress} className="w-full" />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold">{steps[currentStep]}</h2>
        <p className="text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStep()}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <Button type="submit">
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </form>
    </div>
  );
}