// __tests__/integration/user-auth-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Auth } from '../../project/src/components/auth/Auth';
import { Profile } from '../../project/src/components/profile/Profile';

// Import and mock Supabase
jest.mock('../../lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../lib/supabase';

describe('User Authentication Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  test('User can sign up, login, and update profile', async () => {
    // 1. SIGN UP FLOW
    // Mock successful sign up
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id', email: 'test@example.com' } },
      error: null
    });

    // Render Auth component
    const { unmount } = render(<Auth />);
    
    // Click "Sign Up" to switch mode
    await user.click(screen.getByText(/sign up/i));
    
    // Fill sign up form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit sign up form
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Check if sign up was successful
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Clean up
    unmount();

    // 2. LOGIN FLOW
    // Mock successful login
    supabase.auth.signIn.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id', email: 'test@example.com' } },
      error: null
    });
    
    // Render Auth component again
    const { unmount: unmountLogin } = render(<Auth />);
    
    // Fill login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Check if login was successful
    await waitFor(() => {
      expect(supabase.auth.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    // Clean up
    unmountLogin();

    // 3. PROFILE UPDATE FLOW
    // Mock user authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'new-user-id', 
          email: 'test@example.com',
          role: 'authenticated'
        } 
      },
      error: null
    });
    
    // Mock initial profile data
    supabase.from().single.mockResolvedValue({
      data: {
        id: 'new-user-id',
        full_name: '',
        website: '',
        avatar_url: null
      },
      error: null
    });
    
    // Mock successful profile update
    supabase.from().upsert.mockResolvedValueOnce({
      data: {
        id: 'new-user-id',
        full_name: 'Test User',
        website: 'https://example.com'
      },
      error: null
    });
    
    // Mock avatar URL
    supabase.storage.from().getPublicUrl.mockReturnValue({
      data: { publicUrl: '' }
    });
    
    // Render Profile component
    render(<Profile />);
    
    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
    
    // Update profile information
    await user.type(screen.getByLabelText(/full name/i), 'Test User');
    await user.type(screen.getByLabelText(/website/i), 'https://example.com');
    
    // Submit profile update
    await user.click(screen.getByRole('button', { name: /update profile/i }));
    
    // Check if profile update was successful
    await waitFor(() => {
      expect(supabase.from().upsert).toHaveBeenCalledWith({
        id: 'new-user-id',
        full_name: 'Test User',
        website: 'https://example.com'
      });
    });
  });
});
