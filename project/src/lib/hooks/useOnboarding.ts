import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

interface OnboardingState {
  steps: OnboardingStep[];
  currentStepId: string | null;
  hasSeenWelcome: boolean;
  isCompleted: boolean;
  progress: number;
  setCurrentStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  setHasSeenWelcome: (seen: boolean) => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Generic App',
          description: 'Let\'s get you started with the basics',
          completed: false,
          order: 0,
        },
        {
          id: 'profile',
          title: 'Complete Your Profile',
          description: 'Add your information to personalize your experience',
          completed: false,
          order: 1,
        },
        {
          id: 'features',
          title: 'Explore Features',
          description: 'Discover what you can do with Generic App',
          completed: false,
          order: 2,
        },
        {
          id: 'settings',
          title: 'Configure Settings',
          description: 'Set up your preferences and notifications',
          completed: false,
          order: 3,
        },
      ],
      currentStepId: 'welcome',
      hasSeenWelcome: false,
      isCompleted: false,
      progress: 0,

      setCurrentStep: (stepId) => {
        set({ currentStepId: stepId });
      },

      completeStep: (stepId) => {
        set((state) => {
          const updatedSteps = state.steps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          );
          
          const completedSteps = updatedSteps.filter((step) => step.completed).length;
          const progress = (completedSteps / updatedSteps.length) * 100;
          const isCompleted = progress === 100;

          return {
            steps: updatedSteps,
            progress,
            isCompleted,
          };
        });
      },

      skipOnboarding: () => {
        set({ isCompleted: true });
      },

      resetOnboarding: () => {
        set({
          steps: get().steps.map((step) => ({ ...step, completed: false })),
          currentStepId: 'welcome',
          isCompleted: false,
          progress: 0,
        });
      },

      setHasSeenWelcome: (seen) => {
        set({ hasSeenWelcome: seen });
      },
    }),
    {
      name: 'onboarding-storage',
    }
  )
);