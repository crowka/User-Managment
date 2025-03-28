// __tests__/auth/mfa/setup.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MFASetup } from '../../../project/src/components/auth/MFASetup';

// Import our standardized mock
jest.mock('../../../project/src/lib/supabase', () => require('../../__mocks__/supabase'));
import { supabase } from '../../../project/src/lib/supabase';

describe('Multi-Factor Authentication Setup', () => {
  let user;
  
  // Mock authenticated user
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    phone: null,
    factors: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authenticated state
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    // Mock MFA enrollment status check
    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [],
        phone: []
      },
      error: null
    });
    
    // Mock RPC call for backup codes
    supabase.rpc.mockImplementation((procedure) => {
      if (procedure === 'get_backup_codes') {
        return Promise.resolve({
          data: [
            '123456789012',
            '234567890123',
            '345678901234',
            '456789012345',
            '567890123456'
          ],
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });
  });

  test('User can setup TOTP (app-based) authentication', async () => {
    // Mock TOTP factor creation
    supabase.auth.mfa.enroll.mockResolvedValueOnce({
      data: {
        id: 'totp-123',
        type: 'totp',
        totp: {
          qr_code: 'data:image/png;base64,ABCDEFG...',
          secret: 'ABCDEF123456',
          uri: 'otpauth://totp/AppName:user@example.com?secret=ABCDEF123456&issuer=AppName'
        }
      },
      error: null
    });
    
    // Mock successful verification
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-123' },
      error: null
    });
    
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: { id: 'factor-123' },
      error: null
    });

    // Render MFA setup component
    render(<MFASetup />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/choose a second factor/i)).toBeInTheDocument();
    });
    
    // Select TOTP option
    await user.click(screen.getByRole('button', { name: /authenticator app/i }));
    
    // Verify QR code is displayed
    await waitFor(() => {
      expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
      expect(screen.getByText('ABCDEF123456')).toBeInTheDocument(); // Secret code
    });
    
    // Enter verification code
    await user.type(screen.getByLabelText(/verification code/i), '123456');
    
    // Submit verification
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify MFA was enabled
    await waitFor(() => {
      expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({ factorType: 'totp' });
      expect(supabase.auth.mfa.challenge).toHaveBeenCalledWith({ factorId: 'totp-123' });
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'totp-123',
        challengeId: 'challenge-123',
        code: '123456'
      });
      expect(screen.getByText(/successfully enabled/i)).toBeInTheDocument();
    });
  });

  test('User can setup SMS authentication', async () => {
    // Mock phone factor creation
    supabase.auth.mfa.enroll.mockResolvedValueOnce({
      data: {
        id: 'phone-123',
        type: 'phone',
        phone: {
          phone_number: '+15555555555'
        }
      },
      error: null
    });
    
    // Mock SMS challenge
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-456' },
      error: null
    });
    
    // Mock successful verification
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: { id: 'factor-456' },
      error: null
    });

    // Render MFA setup component
    render(<MFASetup />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/choose a second factor/i)).toBeInTheDocument();
    });
    
    // Select SMS option
    await user.click(screen.getByRole('button', { name: /text message/i }));
    
    // Enter phone number
    await user.type(screen.getByLabelText(/phone number/i), '+15555555555');
    
    // Submit phone number
    await user.click(screen.getByRole('button', { name: /send code/i }));
    
    // Verify SMS challenge was initiated
    await waitFor(() => {
      expect(supabase.auth.mfa.enroll).toHaveBeenCalledWith({ 
        factorType: 'phone',
        phone: '+15555555555'
      });
      expect(screen.getByText(/verification code sent/i)).toBeInTheDocument();
    });
    
    // Enter verification code
    await user.type(screen.getByLabelText(/verification code/i), '123456');
    
    // Submit verification
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify phone MFA was enabled
    await waitFor(() => {
      expect(supabase.auth.mfa.verify).toHaveBeenCalledWith({
        factorId: 'phone-123',
        challengeId: 'challenge-456',
        code: '123456'
      });
      expect(screen.getByText(/successfully enabled/i)).toBeInTheDocument();
    });
  });

  test('User can generate and view backup codes', async () => {
    // Mock existing TOTP factor
    supabase.auth.mfa.listFactors.mockReset();
    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'totp-123', name: 'Authenticator', verified: true }],
        phone: []
      },
      error: null
    });

    // Render MFA setup component
    render(<MFASetup />);
    
    // Wait for component to load with backup codes option
    await waitFor(() => {
      expect(screen.getByText(/backup codes/i)).toBeInTheDocument();
    });
    
    // Click on backup codes
    await user.click(screen.getByRole('button', { name: /backup codes/i }));
    
    // Wait for backup codes to be displayed
    await waitFor(() => {
      expect(screen.getByText(/123456789012/i)).toBeInTheDocument();
      expect(screen.getByText(/234567890123/i)).toBeInTheDocument();
      // Verify all codes are shown
      expect(screen.getAllByText(/\d{12}/)).toHaveLength(5);
    });
    
    // Test download backup codes
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement for the download link
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: jest.fn(),
          click: mockDownload,
          remove: jest.fn()
        };
      }
      return originalCreateElement(tag);
    });
    
    // Click download button
    await user.click(screen.getByRole('button', { name: /download/i }));
    
    // Verify download was triggered
    expect(mockDownload).toHaveBeenCalled();
    
    // Restore original createElement
    document.createElement = originalCreateElement;
  });

  test('Handles TOTP setup errors', async () => {
    // Mock TOTP factor creation success
    supabase.auth.mfa.enroll.mockResolvedValueOnce({
      data: {
        id: 'totp-123',
        type: 'totp',
        totp: {
          qr_code: 'data:image/png;base64,ABCDEFG...',
          secret: 'ABCDEF123456',
          uri: 'otpauth://totp/AppName:user@example.com?secret=ABCDEF123456&issuer=AppName'
        }
      },
      error: null
    });
    
    // Mock challenge success
    supabase.auth.mfa.challenge.mockResolvedValueOnce({
      data: { id: 'challenge-123' },
      error: null
    });
    
    // Mock verification failure - incorrect code
    supabase.auth.mfa.verify.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid verification code' }
    });

    // Render MFA setup component
    render(<MFASetup />);
    
    // Select TOTP option
    await user.click(screen.getByRole('button', { name: /authenticator app/i }));
    
    // Wait for QR code
    await waitFor(() => {
      expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
    });
    
    // Enter invalid verification code
    await user.type(screen.getByLabelText(/verification code/i), '999999');
    
    // Submit verification
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
    });
    
    // User should be able to try again
    expect(screen.getByRole('button', { name: /verify/i })).not.toBeDisabled();
  });

  test('User can disable an existing MFA method', async () => {
    // Mock existing TOTP factor
    supabase.auth.mfa.listFactors.mockReset();
    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'totp-123', name: 'Authenticator', verified: true }],
        phone: []
      },
      error: null
    });
    
    // Mock successful unenrollment
    supabase.auth.mfa.unenroll.mockResolvedValueOnce({
      data: { id: 'totp-123' },
      error: null
    });

    // Render MFA setup component in management mode
    render(<MFASetup mode="manage" />);
    
    // Wait for component to load with existing factors
    await waitFor(() => {
      expect(screen.getByText(/authenticator/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
    
    // Click remove button
    await user.click(screen.getByRole('button', { name: /remove/i }));
    
    // Confirm removal
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify factor was removed
    await waitFor(() => {
      expect(supabase.auth.mfa.unenroll).toHaveBeenCalledWith({
        factorId: 'totp-123'
      });
      expect(screen.getByText(/successfully disabled/i)).toBeInTheDocument();
    });
  });

  test('User can change MFA method name', async () => {
    // Mock existing TOTP factor
    supabase.auth.mfa.listFactors.mockReset();
    supabase.auth.mfa.listFactors.mockResolvedValue({
      data: {
        totp: [{ id: 'totp-123', name: 'Authenticator', verified: true }],
        phone: []
      },
      error: null
    });
    
    // Mock successful update
    supabase.auth.mfa.updateFactor.mockResolvedValueOnce({
      data: { id: 'totp-123', name: 'Work Phone' },
      error: null
    });

    // Render MFA setup component in management mode
    render(<MFASetup mode="manage" />);
    
    // Wait for component to load with existing factors
    await waitFor(() => {
      expect(screen.getByText(/authenticator/i)).toBeInTheDocument();
    });
    
    // Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    // Change the name
    const nameInput = screen.getByLabelText(/factor name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Work Phone');
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify factor was updated
    await waitFor(() => {
      expect(supabase.auth.mfa.updateFactor).toHaveBeenCalledWith({
        factorId: 'totp-123',
        friendlyName: 'Work Phone'
      });
      expect(screen.getByText(/successfully updated/i)).toBeInTheDocument();
    });
  });
});
