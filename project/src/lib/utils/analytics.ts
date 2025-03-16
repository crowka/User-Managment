interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
}

export const analytics = {
  trackEvent: ({ name, properties }: AnalyticsEvent) => {
    // Implementation would depend on your analytics provider
    console.log(`[Analytics] ${name}`, properties);
  },
  
  trackError: (error: Error) => {
    console.error('[Error]', error);
    // Send to error tracking service
  },
  
  trackPageView: (path: string) => {
    console.log(`[PageView] ${path}`);
  },
};