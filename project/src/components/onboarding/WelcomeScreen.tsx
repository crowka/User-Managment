import { useEffect } from 'react';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { ArrowRight, Rocket } from 'lucide-react';

export function WelcomeScreen() {
  const { steps, currentStepId, progress, setCurrentStep, completeStep, setHasSeenWelcome } = useOnboarding();

  useEffect(() => {
    setHasSeenWelcome(true);
  }, [setHasSeenWelcome]);

  const currentStep = steps.find((step) => step.id === currentStepId);

  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
      const nextStep = steps.find((step) => step.order === currentStep.order + 1);
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-primary" />
          <CardTitle>{currentStep?.title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Progress value={progress} className="w-full" />
        
        <p className="text-muted-foreground">
          {currentStep?.description}
        </p>

        <div className="grid gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center space-x-2 p-2 rounded ${
                step.completed ? 'bg-primary/10' : ''
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${
                step.completed ? 'bg-primary' : 'bg-muted'
              }`} />
              <span className={step.completed ? 'text-primary' : ''}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={() => {}}>
          Skip Tour
        </Button>
        <Button onClick={handleNext}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}