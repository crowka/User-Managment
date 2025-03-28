// __tests__/integration/account-settings-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSettings } from '../../project/src/components/account/AccountSettings';

// Import and mock Supabase
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Account Settings Flow', () => {
  let user;

  // Create mock authenticated user
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'authenticated',
    app_metadata: { role: 'user' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock user authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
  });

  test('User can change their email address', async () => {
    // Mock successful email update
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: { user: { ...mockUser, email: 'newemail@example.com' } },
      error: null
    });
    
    // Render account settings component
    render(<AccountSettings />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
    });
    
    // Find and click the change email button
    await user.click(screen.getByRole('button', { name: /change email/i }));
    
    // Fill in new email
    await user.clear(screen.getByLabelText(/new email/i));
    await user.type(screen.getByLabelText(/new email/i), 'newemail@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update email/i }));
    
    // Verify updateUser was called correctly
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      email: 'newemail@example.com'
    });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
    });
  });

  test('User can change their password', async () => {
    // Mock successful password update
    supabase.auth.updateUser.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });
    
    // Render account settings component
    render(<AccountSettings />);
    
    // Find and click the change password button
    await user.click(screen.getByRole('button', { name: /change password/i }));
    
    // Fill in passwords
    await user.type(screen.getByLabelText(/current password/i), 'OldPassword123');
    await user.type(screen.getByLabelText(/new password/i), 'NewPassword123');
    await user.type(screen.getByLabelText(/confirm new password/i), 'NewPassword123');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /update password/i }));
    
    // Verify updateUser was called correctly
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({
      password: 'NewPassword123'
    });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });
  });

  test('User can enable two-factor authentication', async () => {
    // Mock generating 2FA secret
    supabase.rpc.mockResolvedValueOnce({
      data: {
        secret: 'ABCDEFGHIJKLMNOP',
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
      },
      error: null
    });
    
    // Mock verifying 2FA token
    supabase.rpc.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Render account settings component
    render(<AccountSettings />);
    
    // Find and click the 2FA setup button
    await user.click(screen.getByRole('button', { name: /setup two-factor authentication/i }));
    
    // QR code should be displayed
    await waitFor(() => {
      expect(screen.getByAltText(/qr code/i)).toBeInTheDocument();
      expect(screen.getByText(/ABCDEFGHIJKLMNOP/i)).toBeInTheDocument();
    });
    
    // Enter verification code
    await user.type(screen.getByLabelText(/verification code/i), '123456');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /verify/i }));
    
    // Verify RPC was called correctly
    expect(supabase.rpc).toHaveBeenCalledWith('verify_totp', { token: '123456' });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/two-factor authentication enabled/i)).toBeInTheDocument();
    });
  });

  test('User can manage connected accounts', async () => {
    // Mock connected accounts data
    supabase.from().select.mockResolvedValueOnce({
      data: [
        { id: 'conn1', provider: 'google', connected_at: '2023-01-01' }
      ],
      error: null
    });
    
    // Mock disconnect function
    supabase.from().delete.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Render account settings component
    render(<AccountSettings />);
    
    // Find and click the connected accounts tab
    await user.click(screen.getByRole('tab', { name: /connected accounts/i }));
    
    // Connected accounts should be displayed
    await waitFor(() => {
      expect(screen.getByText(/google/i)).toBeInTheDocument();
    });
    
    // Find and click disconnect button
    await user.click(screen.getByRole('button', { name: /disconnect/i }));
    
    // Confirm disconnection
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify delete was called correctly
    expect(supabase.from().delete).toHaveBeenCalledWith({ 
      match: { id: 'conn1' } 
    });
    
    // Success message should appear
    await waitFor(() => {
      expect(screen.getByText(/account disconnected/i)).toBeInTheDocument();
    });
  });

  test('User can delete their account', async () => {
    // Mock successful account deletion
    supabase.rpc.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Render account settings component
    render(<AccountSettings />);
    
    // Find and click the danger zone tab
    await user.click(screen.getByRole('tab', { name: /danger zone/i }));
    
    // Find and click delete account button
    await user.click(screen.getByRole('button', { name: /delete account/i }));
    
    // Type confirmation
    await user.type(screen.getByLabelText(/type "delete"/i), 'delete');
    
    // Enter password
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /permanently delete/i }));
    
    // Verify RPC was called correctly
    expect(supabase.rpc).toHaveBeenCalledWith('delete_user_account', { 
      password: 'Password123' 
    });
    
    // Redirect should happen (we can't fully test this without router mocking)
    await waitFor(() => {
      expect(screen.getByText(/account deleted/i)).toBeInTheDocument();
    });
  });
});
