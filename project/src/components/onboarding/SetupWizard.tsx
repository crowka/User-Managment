import { useState } from 'react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';

interface SetupStep {
  id: string;
  title: string;
  component: React.ReactNode;
}

export function SetupWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { completeStep } = useOnboarding();

  const steps: SetupStep[] = [
    {
      id: 'preferences',
      title: 'Set Your Preferences',
      component: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex items-center space-x-2">
              <Checkbox id="darkMode" />
              <Label htmlFor="darkMode">Enable Dark Mode</Label>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Language</Label>
            <select className="w-full p-2 border rounded">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Configure Notifications',
      component: (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="emailNotifications" />
            <Label htmlFor="emailNotifications">Email Notifications</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="pushNotifications" />
            <Label htmlFor="pushNotifications">Push Notifications</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="smsNotifications" />
            <Label htmlFor="smsNotifications">SMS Notifications</Label>
          </div>
        </div>
      ),
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      component: (
        <div className="text-center space-y-4">
          <div className="text-4xl">🎉</div>
          <p>Your setup is complete! You're ready to start using the app.</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeStep('settings');
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{steps[currentStepIndex].title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        <Progress value={progress} className="mb-6" />
        {steps[currentStepIndex].component}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
          disabled={currentStepIndex === 0}
        >
          Previous
        </Button>
        <Button onClick={handleNext}>
          {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  );
}