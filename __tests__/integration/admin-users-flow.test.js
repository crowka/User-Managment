// __tests__/integration/admin-users-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminUsers } from '../../project/src/components/admin/AdminUsers';

// Import and mock Supabase
jest.mock('../../lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../lib/supabase';

describe('Admin Users Management Flow', () => {
  let user;

  // Mock user list to return from API
  const mockUsersList = [
    { id: 'user1', email: 'user1@example.com', role: 'user', created_at: '2023-01-01' },
    { id: 'user2', email: 'user2@example.com', role: 'user', created_at: '2023-01-02' },
    { id: 'admin1', email: 'admin@example.com', role: 'admin', created_at: '2023-01-03' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock admin authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'admin-id', 
          email: 'admin@example.com',
          role: 'authenticated',
          app_metadata: { role: 'admin' }
        } 
      },
      error: null
    });
    
    // Mock fetching user list
    supabase.from.mockImplementation(table => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockUsersList,
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });
  });

  test('Admin can view and manage users', async () => {
    // Render the admin component
    render(<AdminUsers />);
    
    // Wait for the user list to load
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
    
    // Verify the correct table was queried
    expect(supabase.from).toHaveBeenCalledWith('users');
    
    // Test filtering users
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'admin');
    
    // Verify the filtering worked
    await waitFor(() => {
      expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('user2@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
    
    // Clear the filter
    await user.clear(searchInput);
    
    // All users should be visible again
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
    
    // Test user role management
    // Mock update role API
    supabase.from().update.mockResolvedValueOnce({
      data: { ...mockUsersList[0], role: 'admin' },
      error: null
    });
    
    // Find and click the role button for the first user
    const roleButton = screen.getAllByText(/user/i)[0];
    await user.click(roleButton);
    
    // Select the admin role from dropdown
    const adminOption = await screen.findByText(/make admin/i);
    await user.click(adminOption);
    
    // Verify the update API was called
    await waitFor(() => {
      expect(supabase.from().update).toHaveBeenCalledWith(
        { role: 'admin' },
        { returning: 'minimal' }
      );
    });
  });

  test('Admin can handle user management errors', async () => {
    // Mock error when fetching users
    supabase.from.mockImplementation(table => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Failed to fetch users' }
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });
    
    // Render the admin component
    render(<AdminUsers />);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument();
    });
    
    // Retry button should be present
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Mock successful fetch for retry
    supabase.from.mockImplementation(table => {
      if (table === 'users') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockUsersList,
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });
    
    // Click retry
    await user.click(retryButton);
    
    // Check if users are now displayed
    await waitFor(() => {
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });
});
