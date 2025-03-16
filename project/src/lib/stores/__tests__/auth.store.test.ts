import { describe, it, expect, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { useAuthStore } from '../../stores/auth.store';
import { AuthState, User } from '../../types/auth';
import { api } from '../../api/axios';

// Mock API
vi.mock('../../api/axios', () => ({
  api: {
    post: vi.fn()
  }
}));

// Mock API post method
const mockApiPost = api.post as any;

describe('Auth Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockApiPost.mockResolvedValue({ data: {} });
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  // Create a fresh store for each test
  const createTestStore = () => {
    return create<AuthState>((set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await mockApiPost('/auth/login', { email, password });
          const { user, token } = response.data;
          
          localStorage.setItem('auth_token', token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false 
          });
          throw error;
        }
      },
    
      register: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          const response = await mockApiPost('/auth/register', { email, password });
          const { user, token } = response.data;
          
          localStorage.setItem('auth_token', token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false 
          });
          throw error;
        }
      },
    
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await mockApiPost('/auth/logout');
          localStorage.removeItem('auth_token');
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false 
          });
          throw error;
        }
      },
    
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await mockApiPost('/auth/reset-password', { email });
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password reset failed',
            isLoading: false,
          });
          throw error;
        }
      },
    
      updatePassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await mockApiPost('/auth/update-password', { oldPassword, newPassword });
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Password update failed',
            isLoading: false,
          });
          throw error;
        }
      },
    
      sendVerificationEmail: async () => {
        set({ isLoading: true, error: null });
        try {
          await mockApiPost('/auth/send-verification-email');
          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send verification email',
            isLoading: false,
          });
          throw error;
        }
      },
    
      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await mockApiPost('/auth/verify-email', { token });
          set({
            user: response.data.user,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Email verification failed',
            isLoading: false,
          });
          throw error;
        }
      },
    
      clearError: () => {
        set({ error: null });
      }
    }));
  };

  it('should initialize with default values', () => {
    const store = createTestStore();
    const state = store.getState();

    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should set loading state during login', async () => {
    const store = createTestStore();
    
    // Setup promise that won't resolve immediately
    mockApiPost.mockReturnValue(new Promise(() => {}));

    // Start login
    store.getState().login('test@example.com', 'password').catch(() => {});

    // Check loading state
    expect(store.getState().isLoading).toBe(true);
  });

  it('should set user and authenticated state on successful login', async () => {
    const store = createTestStore();
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Setup successful response
    mockApiPost.mockResolvedValue({
      data: {
        user: mockUser,
        token: 'mock-token'
      }
    });

    // Login
    await store.getState().login('test@example.com', 'password');

    // Check state
    expect(store.getState().isAuthenticated).toBe(true);
    expect(store.getState().user).toEqual(mockUser);
    expect(store.getState().isLoading).toBe(false);
    expect(store.getState().error).toBeNull();

    // Check API was called correctly
    expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should set error state on failed login', async () => {
    const store = createTestStore();
    const errorMessage = 'Invalid credentials';
    
    // Setup failed response
    mockApiPost.mockRejectedValue(new Error(errorMessage));

    // Attempt login
    try {
      await store.getState().login('test@example.com', 'wrong-password');
    } catch (e) {
      // Expected error
    }

    // Check state
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
    expect(store.getState().isLoading).toBe(false);
    expect(store.getState().error).toBe(errorMessage);
  });

  it('should clear user and authenticated state on logout', async () => {
    const store = createTestStore();
    
    // Setup initial authenticated state
    store.setState({
      isAuthenticated: true,
      user: { 
        id: 1, 
        email: 'test@example.com', 
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      isLoading: false,
      error: null
    });

    // Setup successful logout response
    mockApiPost.mockResolvedValue({ data: {} });

    // Logout
    await store.getState().logout();

    // Check state
    expect(store.getState().isAuthenticated).toBe(false);
    expect(store.getState().user).toBeNull();
    expect(store.getState().isLoading).toBe(false);

    // Check API was called correctly
    expect(mockApiPost).toHaveBeenCalledWith('/auth/logout');
  });

  it('should clear error state', () => {
    const store = createTestStore();
    
    // Set an error
    store.setState({
      error: 'Test error'
    });

    // Clear error
    store.getState().clearError();

    // Check error is cleared
    expect(store.getState().error).toBeNull();
  });
}); 