// __tests__/integration/account-switching-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSwitcher } from '../../project/src/components/account/AccountSwitcher';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Account Switching Flow', () => {
  let user;
  
  // Mock accounts data
  const mockAccounts = [
    { id: 'personal', name: 'Personal Account', type: 'personal', avatar_url: 'https://example.com/avatar1.jpg' },
    { id: 'work', name: 'Work Account', type: 'organization', avatar_url: 'https://example.com/avatar2.jpg' },
    { id: 'client', name: 'Client Project', type: 'organization', avatar_url: 'https://example.com/avatar3.jpg' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock current user and session
    supabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'user-123', 
          email: 'user@example.com',
          user_metadata: { current_account: 'personal' }
        }
      },
      error: null
    });
    
    // Mock available accounts
    supabase.from().select.mockResolvedValueOnce({
      data: mockAccounts,
      error: null
    });
  });

  test('User can view and switch between accounts', async () => {
    // Render account switcher
    render(<AccountSwitcher />);
    
    // Wait for accounts to load
    await waitFor(() => {
      expect(screen.getByText('Personal Account')).toBeInTheDocument();
      expect(screen.getByText('Work Account')).toBeInTheDocument();
      expect(screen.getByText('Client Project')).toBeInTheDocument();
    });
    
    // Verify current account is indicated
    expect(screen.getByText('Personal Account').closest('li')).toHaveClass('active-account');
    
    // Mock successful account switch
    supabase.rpc = jest.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Switch to work account
    await user.click(screen.getByText('Work Account'));
    
    // Verify RPC call was made with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('switch_account', {
      account_id: 'work'
    });
    
    // Verify loading state during switch
    expect(screen.getByText(/switching/i)).toBeInTheDocum
