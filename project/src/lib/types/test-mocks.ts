import { AuthState, User } from './auth';
import { JestMockFunction } from './jest-types';

// Type for mocked auth store
export type MockAuthStore = {
  [K in keyof AuthState]: AuthState[K] extends (...args: infer Args) => infer Return
    ? JestMockFunction<Return, Args>
    : AuthState[K];
};

// Helper type for creating mock store state
export type MockAuthState = {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  isLoading: boolean;
};

// Type for API response mocks
export type MockAuthResponse = {
  data: {
    user: User;
    token: string;
  };
};

// Helper function to create a typed mock auth store
export const createMockAuthStore = (): MockAuthStore => ({
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
  isLoading: false,
  login: jest.fn<Promise<void>, [string, string]>(),
  register: jest.fn<Promise<void>, [string, string]>(),
  logout: jest.fn<Promise<void>, []>(),
  clearAuth: jest.fn<void, []>(),
  setAuth: jest.fn<void, [Partial<AuthState>]>(),
  setError: jest.fn<void, [string | null]>(),
  resetPassword: jest.fn<Promise<void>, [string]>(),
  updatePassword: jest.fn<Promise<void>, [string, string]>(),
  sendVerificationEmail: jest.fn<Promise<void>, []>(),
  verifyEmail: jest.fn<Promise<void>, [string]>(),
  clearError: jest.fn<void, []>()
}); 