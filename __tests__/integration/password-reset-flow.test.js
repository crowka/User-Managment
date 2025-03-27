// __tests__/integration/password-reset-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordReset } from '../../project/src/components/auth/PasswordReset';

// Import and mock Supabase
jest.mock('../../lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../lib/supabase';

describe('Password Reset Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  test('User can request password reset', async () => {
    // Mock successful password reset request
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: {},
      error: null
    });
    
    // Render password reset component
    render(<PasswordReset />);
    
    // Fill in email
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /reset password/i }));
    
    // Verify password reset was called
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.com',
      { redirectTo: expect.any(String) }
    );
    
    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    });
  });

  test('User sees error if reset fails', async () => {
    // Mock failed password reset request
    supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({
      data: null,
      error: { message: 'Email not found' }
    });
    
    // Render password reset component
    render(<PasswordReset />);
    
    // Fill in email
    await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /reset password/i }));
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/email not found/i)).toBeInTheDocument();
    });
  });

  test('User can set new password after reset', async () => {
    // Mock URL with reset token
    // This would normally be handled by the router
    window.location.hash = '#access_token=test-token&type=recovery';
    
    // Mock successful password update
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: { user: { id: 'user-id' } },
      error: null
    });
    
    // Render password reset component (should detect token)
    render(<PasswordReset />);
    
    // New password form should be displayed
    await waitFor(() => {
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });
    
    // Fill in new password
    await user.type(screen.getByLabelText(/new password/i), 'NewPassword123');
    await user.type(screen.getByLabelText(/confirm password/i), 'NewPassword123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update password/i }));
    
    // Verify password update was called
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewPassword123'
    });
    
    // Success message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/password updated/i)).toBeInTheDocument();
    });
    
    // Clean up
    window.location.hash = '';
  });

  test('Password validation works on reset', async () => {
    // Mock URL with reset token
    window.location.hash = '#access_token=test-token&type=recovery';
    
    // Render password reset component
    render(<PasswordReset />);
    
    // Fill in mismatched passwords
    await user.type(screen.getByLabelText(/new password/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update password/i }));
    
    // Error should be displayed
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Supabase should not be called
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
    
    // Clean up
    window.location.hash = '';
  });
});
