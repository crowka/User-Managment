import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '../../project/src/components/auth/Auth';
import { supabase } from '../../project/src/lib/supabase';

// Mock the supabase client
jest.mock('../../project/src/lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

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
    supabase.auth.signIn.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<Auth />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('handles sign up correctly', async () => {
    render(<Auth />);
    
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
    supabase.auth.signUp.mockRejectedValueOnce(new Error('Email already exists'));
    render(<Auth />);

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
    
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByText(/password must be at least/i)).toBeInTheDocument();
  });
}); 