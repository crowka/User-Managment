import { LayoutProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';

export function Hero({ className }: LayoutProps) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="container relative z-10 mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build Better Apps{' '}
            <span className="text-primary">Faster</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A complete solution for building modern web applications. Start with our
            production-ready components and focus on what matters most - your business logic.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]"></div>
    </div>
  );
}