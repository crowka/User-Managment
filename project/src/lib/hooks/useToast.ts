import { toast } from 'sonner';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
}

export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', options?: ToastOptions) => {
    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  return { showToast };
};