import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { useOnboarding } from '@/lib/hooks/useOnboarding';

interface TourStep {
  title: string;
  description: string;
  element: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Navigation',
    description: 'Access all your important features from the main menu',
    element: '#main-nav',
  },
  {
    title: 'Dashboard',
    description: 'View your activity and important metrics here',
    element: '#dashboard',
  },
  {
    title: 'Settings',
    description: 'Customize your experience and preferences',
    element: '#settings',
  },
];

export function FeatureTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const { completeStep } = useOnboarding();

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeStep('features');
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tourSteps[currentStep].title}</DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          <p className="text-muted-foreground">
            {tourSteps[currentStep].description}
          </p>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Skip Tour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}