// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../LoginForm';
import { useAuthStore } from '@/lib/stores/auth.store';

// Mock the auth store
vi.mock('@/lib/stores/auth.store', () => ({
  useAuthStore: vi.fn()
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });
  });

  it('should render form elements', () => {
    render(<LoginForm />);
    
    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should handle login submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Fill in form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Check if login was called with correct data
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error messages for invalid inputs', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    // Check for validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should validate form inputs', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    // Test invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
    
    // Test short password
    await user.type(screen.getByLabelText(/password/i), '123');
    await user.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
    });
  });

  it('should disable button while loading', () => {
    // Mock loading state
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: true,
      error: null
    });
    
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /logging in/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/logging in/i);
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    
    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle button
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle button again
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should display API error messages', () => {
    // Mock error state
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: 'Invalid credentials'
    });
    
    render(<LoginForm />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
}); 