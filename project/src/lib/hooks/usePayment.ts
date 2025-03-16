import { create } from 'zustand';
import { api } from '../api/axios';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  plan: {
    id: string;
    name: string;
    price: number;
    interval: 'month' | 'year';
  };
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  activeSubscription: Subscription | null;
  paymentHistory: Array<{
    id: string;
    amount: number;
    status: 'succeeded' | 'failed' | 'pending';
    date: string;
    description: string;
  }>;
  isLoading: boolean;
  error: string | null;
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethod: PaymentMethod) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  fetchSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
}

export const usePayment = create<PaymentState>((set, get) => ({
  paymentMethods: [],
  activeSubscription: null,
  paymentHistory: [],
  isLoading: false,
  error: null,

  fetchPaymentMethods: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/payment/methods');
      set({ paymentMethods: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payment methods', isLoading: false });
    }
  },

  addPaymentMethod: async (paymentMethod) => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/payment/methods', paymentMethod);
      const methods = [...get().paymentMethods, paymentMethod];
      set({ paymentMethods: methods, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add payment method', isLoading: false });
    }
  },

  removePaymentMethod: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/payment/methods/${id}`);
      const methods = get().paymentMethods.filter(method => method.id !== id);
      set({ paymentMethods: methods, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to remove payment method', isLoading: false });
    }
  },

  fetchSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/subscriptions/active');
      set({ activeSubscription: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch subscription', isLoading: false });
    }
  },

  cancelSubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      await api.post('/subscriptions/cancel');
      set({ activeSubscription: null, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to cancel subscription', isLoading: false });
    }
  },

  fetchPaymentHistory: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/payment/history');
      set({ paymentHistory: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payment history', isLoading: false });
    }
  },
}));