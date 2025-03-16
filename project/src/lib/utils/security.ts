import DOMPurify from 'dompurify';

export const security = {
  sanitizeHTML: (dirty: string) => DOMPurify.sanitize(dirty),
  
  validateInput: (input: string, pattern: RegExp) => pattern.test(input),
  
  generateCSRFToken: () => {
    // Implementation would depend on your backend
    return Math.random().toString(36).substring(2);
  },
};