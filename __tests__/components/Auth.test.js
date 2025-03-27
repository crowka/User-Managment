// File: __tests__/components/Auth.test.js

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '../../project/src/components/auth/Auth';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Auth Component', () => {
  let user;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Create a new user instance for each test using the latest API
    user = userEvent.setup();
  });

  test('renders authentication form', async () => {
    render(<Auth />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles sign in correctly', async () => {
    // Mock successful sign in
    supabase.auth.signIn.mockResolvedValueOnce({ data: { user: { id: 'test-id' } }, error: null });
    
    render(<Auth />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(supabase.auth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('handles sign in error', async () => {
    // Mock sign in error
    supabase.auth.signIn.mockResolvedValueOnce({ data: null, error: { message: 'Invalid credentials' } });
    
    render(<Auth />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('handles sign up correctly', async () => {
    // Mock successful sign up
    supabase.auth.signUp.mockResolvedValueOnce({ data: { user: { id: 'new-user-id' } }, error: null });
    
    render(<Auth />);
    
    // Switch to sign up mode
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/password/i), 'newpassword123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'newpassword123',
      });
    });
  });

  test('handles sign up error', async () => {
    // Mock sign up error
    supabase.auth.signUp.mockResolvedValueOnce({ data: null, error: { message: 'Email already exists' } });
    
    render(<Auth />);

    // Switch to sign up mode
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(<Auth />);
    
    await user.type(screen.getByLabelText(/email/i), 'invalidemail');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });

  test('validates password length', async () => {
    render(<Auth />);
    
    await user.type(screen.getByLabelText(/email/i), 'valid@example.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
  });
});
