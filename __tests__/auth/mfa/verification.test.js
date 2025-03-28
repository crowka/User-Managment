// __tests__/auth/mfa/verification.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginWithMFA } from '../../../project/src/components/auth/LoginWithMFA';

// Import our standardized mock
jest.mock('../../../project/src/lib/supabase', () => require('../../__mocks__/supabase'));
import { supabase } from '../../../project/src/lib/supabase';

describe('MFA Verification During Login', () => {
  let user;
  
  // Mock user with MFA enabled
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    factors: [
      { id: 'totp-123', type: 'totp', friendly_name: 'Authenticator App' },
      { id: 'phone-123', type: 'phone', friendly_name: 'Mobile Phone' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock initial auth (first factor authenticated, second factor required)
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { 
        user: mockUser,
        session: null // No session yet, MFA required
      },
      error: null
    });
    
    // Mock MFA factors list
    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'totp-123', name: 'Authenticator App', verified: true }],
        phone: [{ id: 'phone-123', name: 'Mobile Phone', verified: true }]
      },
      error: null
    });
  });

  test('User can complete login with TOTP code', async () => {
    // Mock MFA challenge
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-123' },
      error: null
    });
    
    // Mock successful verification
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'mfa-verified-token',
          user: mockUser
        } 
      },
      error: null
    });

    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify initial login was attempted
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'Password123'
    });
    
    // Wait for MFA verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code/i)).toBeInTheDocument();
      expect(screen.getByText(/authenticator app/i)).toBeInTheDocument();
    });
    
    // Enter TOTP code
    await user.type(screen.getByLabelText(/code/i), '123456');
    
    // Submit verification form
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify MFA was completed
    await waitFor(() => {
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
        factorId: 'totp-123'
      });
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'totp-123',
        challengeId: 'challenge-123',
        code: '123456'
      });
      expect(screen.getByText(/successfully authenticated/i)).toBeInTheDocument();
    });
  });

  test('User can switch between available MFA methods', async () => {
    // Mock MFA challenge for TOTP
    supabase.auth.mfa.challenge.mockImplementation((params) => {
      if (params.factorId === 'totp-123') {
        return Promise.resolve({
          data: { id: 'challenge-totp-123' },
          error: null
        });
      } else if (params.factorId === 'phone-123') {
        return Promise.resolve({
          data: { id: 'challenge-phone-123' },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: new Error('Unknown factor') });
    });
    
    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for MFA verification screen with TOTP selected by default
    await waitFor(() => {
      expect(screen.getByText(/authenticator app/i)).toBeInTheDocument();
    });
    
    // Switch to phone verification
    await user.click(screen.getByRole('button', { name: /mobile phone/i }));
    
    // Verify phone challenge was requested
    await waitFor(() => {
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
        factorId: 'phone-123'
      });
      expect(screen.getByText(/verification code sent/i)).toBeInTheDocument();
    });
    
    // Switch back to TOTP
    await user.click(screen.getByRole('button', { name: /authenticator app/i }));
    
    // Verify TOTP challenge was requested
    await waitFor(() => {
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({
        factorId: 'totp-123'
      });
    });
  });

  test('User can authenticate with backup code', async () => {
    // Mock MFA verification with backup code
    supabase.auth.mfa.verifyWithBackupCode.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'backup-code-token',
          user: mockUser
        } 
      },
      error: null
    });

    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for MFA verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code/i)).toBeInTheDocument();
    });
    
    // Click "Use backup code" option
    await user.click(screen.getByText(/use backup code/i));
    
    // Enter backup code
    await user.type(screen.getByLabelText(/backup code/i), '123456789012');
    
    // Submit backup code
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify backup code was used for authentication
    await waitFor(() => {
      expect(supabase.auth.mfa.verifyWithBackupCode).toHaveBeenCalledWith({
        factorId: expect.any(String),
        code: '123456789012'
      });
      expect(screen.getByText(/successfully authenticated/i)).toBeInTheDocument();
    });
  });

  test('Handles incorrect MFA code', async () => {
    // Mock MFA challenge
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-123' },
      error: null
    });
    
    // Mock verification failure
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid verification code' }
    });

    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for MFA verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code/i)).toBeInTheDocument();
    });
    
    // Enter wrong TOTP code
    await user.type(screen.getByLabelText(/code/i), '999999');
    
    // Submit verification form
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
    });
    
    // User should be able to try again
    expect(screen.getByRole('button', { name: /verify/i })).not.toBeDisabled();
  });

  test('User can request new SMS code during verification', async () => {
    // Mock MFA challenge
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-phone-123' },
      error: null
    });
    
    // Mock new challenge request
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-phone-456' }, // New challenge ID
      error: null
    });

    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for MFA verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code/i)).toBeInTheDocument();
    });
    
    // Switch to phone verification
    await user.click(screen.getByRole('button', { name: /mobile phone/i }));
    
    // Wait for SMS verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code sent/i)).toBeInTheDocument();
    });
    
    // Request new code
    await user.click(screen.getByRole('button', { name: /resend code/i }));
    
    // Verify new challenge was requested
    await waitFor(() => {
      // Challenge should have been called twice (initial + resend)
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledTimes(3); 
      expect(screen.getByText(/new code sent/i)).toBeInTheDocument();
    });
  });

  test('Handles "Remember this device" functionality', async () => {
    // Mock MFA challenge
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-123' },
      error: null
    });
    
    // Mock successful verification
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'mfa-verified-token',
          user: mockUser
        } 
      },
      error: null
    });

    // Render login component
    render(<LoginWithMFA />);
    
    // Enter email and password
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Submit login form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Wait for MFA verification screen
    await waitFor(() => {
      expect(screen.getByText(/verification code/i)).toBeInTheDocument();
    });
    
    // Check "Remember this device" option
    await user.click(screen.getByLabelText(/remember this device/i));
    
    // Enter TOTP code
    await user.type(screen.getByLabelText(/code/i), '123456');
    
    // Submit verification form
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify MFA was completed with remember device option
    await waitFor(() => {
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'totp-123',
        challengeId: 'challenge-123',
        code: '123456',
        rememberDevice: true
      });
      expect(screen.getByText(/successfully authenticated/i)).toBeInTheDocument();
    });
  });
});
