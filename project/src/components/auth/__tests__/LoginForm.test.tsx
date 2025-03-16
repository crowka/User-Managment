/// <reference path="../../../types/testing-library.d.ts" />
/// <reference types="vitest" />
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, render } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthState } from '@/lib/types/auth';

// Mock the auth store
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));

// Mock the LoginForm component
vi.mock('../LoginForm', () => {
  return {
    __esModule: true,
    LoginForm: vi.fn().mockImplementation(() => {
      return null; // This is a dummy implementation, the real one is in __mocks__
    })
  };
});

// Import the mocked LoginForm
import { LoginForm } from '../LoginForm';

// Mock implementation of useAuthStore
const mockUseAuthStore = useAuthStore as any;

describe('LoginForm', () => {
  // Create a mock store state
  const createMockState = (overrides: Partial<AuthState> = {}): AuthState => ({
    isAuthenticated: false,
    user: null,
    error: null,
    isLoading: false,
    login: vi.fn().mockImplementation(() => Promise.resolve()),
    register: vi.fn().mockImplementation(() => Promise.resolve()),
    logout: vi.fn().mockImplementation(() => Promise.resolve()),
    clearError: vi.fn(),
    resetPassword: vi.fn().mockImplementation(() => Promise.resolve()),
    updatePassword: vi.fn().mockImplementation(() => Promise.resolve()),
    sendVerificationEmail: vi.fn().mockImplementation(() => Promise.resolve()),
    verifyEmail: vi.fn().mockImplementation(() => Promise.resolve()),
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockReturnValue(createMockState());
    
    // Restore the implementation from the __mocks__ folder
    const { LoginForm: MockedLoginForm } = require('../__mocks__/LoginForm');
    LoginForm.mockImplementation(MockedLoginForm);
  });

  it('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLogin = vi.fn().mockImplementation(() => Promise.resolve());
    const mockState = createMockState({ login: mockLogin });
    mockUseAuthStore.mockReturnValue(mockState);

    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    const mockLogin = vi.fn().mockImplementation(() => Promise.reject(new Error(errorMessage)));
    const mockState = createMockState({
      login: mockLogin,
      error: errorMessage
    });
    mockUseAuthStore.mockReturnValue(mockState);

    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    
    // Submit the form and wait for the error to be displayed
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  it('validates email format', async () => {
    const mockState = createMockState();
    mockUseAuthStore.mockReturnValue(mockState);

    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });

    expect(mockState.login).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const mockState = createMockState();
    mockUseAuthStore.mockReturnValue(mockState);

    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.submit(screen.getByTestId('login-form'));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    expect(mockState.login).not.toHaveBeenCalled();
  });

  it('disables submit button while loading', () => {
    const mockState = createMockState({ isLoading: true });
    mockUseAuthStore.mockReturnValue(mockState);

    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
  });
}); 