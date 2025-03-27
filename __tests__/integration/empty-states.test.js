// __tests__/integration/empty-states.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../../project/src/components/data/DataTable';
import { SearchResults } from '../../project/src/components/search/SearchResults';
import { NotificationCenter } from '../../project/src/components/notifications/NotificationCenter';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Empty States', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
  });

  test('shows appropriate empty state for data table', async () => {
    // Mock empty data response
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Render data table
    render(<DataTable tableName="projects" />);
    
    // Verify empty state is displayed
    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
      expect(screen.getByText(/create your first project/i)).toBeInTheDocument();
    });
    
    // Verify create button is displayed
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
    
    // Verify illustration is displayed
    expect(screen.getByTestId('empty-state-illustration')).toBeInTheDocument();
  });
  
  test('empty state is responsive and looks good on mobile', async () => {
    // Mock empty data response
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Set viewport to mobile size
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
    
    // Render data table
    render(<DataTable tableName="projects" />);
    
    // Verify empty state is displayed
    await waitFor(() => {
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });
    
    // Verify illustration is present but compact
    const illustration = screen.getByTestId('empty-state-illustration');
    expect(illustration).toBeInTheDocument();
    expect(illustration).toHaveClass('compact');
    
    // Restore viewport size
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });
  
  test('shows appropriate empty state for search results', async () => {
    // Mock empty search results
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Render search results with query
    render(<SearchResults query="nonexistent term" />);
    
    // Verify empty search results state is displayed
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      expect(screen.getByText(/try different keywords/i)).toBeInTheDocument();
    });
    
    // Verify suggested actions are displayed
    expect(screen.getByText(/search tips/i)).toBeInTheDocument();
    
    // Mock search with different query
    supabase.from().select.mockResolvedValueOnce({
      data: [{ id: 'result-1', title: 'Search Result' }],
      error: null
    });
    
    // Change search query
    await user.type(screen.getByRole('searchbox'), '{selectall}different term');
    await user.keyboard('{Enter}');
    
    // Verify results are displayed instead of empty state
    await waitFor(() => {
      expect(screen.getByText('Search Result')).toBeInTheDocument();
      expect(screen.queryByText(/no results found/i)).not.toBeInTheDocument();
    });
  });
  
  test('shows appropriate empty state for notification center', async () => {
    // Mock empty notifications
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Render notification center
    render(<NotificationCenter />);
    
    // Verify empty notifications state is displayed
    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
      expect(screen.getByText(/you're all caught up/i)).toBeInTheDocument();
    });
    
    // Verify call-to-action if applicable
    expect(screen.getByText(/update notification settings/i)).toBeInTheDocument();
    
    // Mock new notification arriving
    const notificationMock = {
      on: jest.fn(),
      subscribe: jest.fn()
    };
    supabase.channel = jest.fn().mockReturnValue(notificationMock);
    
    // Get the callback
    const mockCallbacks = {};
    notificationMock.on.mockImplementation((event, callback) => {
      mockCallbacks[event] = callback;
      return notificationMock;
    });
    
    // Trigger a new notification
    mockCallbacks.notification({
      new: { 
        id: 'notif-1', 
        title: 'New notification', 
        created_at: new Date().toISOString() 
      }
    });
    
    // Verify empty state is replaced with notification
    await waitFor(() => {
      expect(screen.getByText('New notification')).toBeInTheDocument();
      expect(screen.queryByText(/no notifications/i)).not.toBeInTheDocument();
    });
  });
  
  test('empty state provides guidance based on user role', async () => {
    // Mock empty data for admin user
    supabase.auth.getUser.mockReset();
    supabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'admin-123', 
          email: 'admin@example.com',
          user_metadata: { role: 'admin' }
        }
      },
      error: null
    });
    
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Render data table for admin
    render(<DataTable tableName="users" />);
    
    // Verify admin-specific empty state content
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
      expect(screen.getByText(/invite users/i)).toBeInTheDocument();
    });
    
    // Verify admin action button
    expect(screen.getByRole('button', { name: /invite users/i })).toBeInTheDocument();
    
    // Now test as regular user
    supabase.auth.getUser.mockReset();
    supabase.auth.getUser.mockResolvedValue({
      data: { 
        user: { 
          id: 'user-123', 
          email: 'user@example.com',
          user_metadata: { role: 'user' }
        }
      },
      error: null
    });
    
    // Re-render for regular user
    render(<DataTable tableName="users" />);
    
    // Verify user-specific empty state content
    await waitFor(() => {
      expect(screen.getByText(/no users found/i)).toBeInTheDocument();
      // Different message for regular users
      expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
    });
  });
  
  test('handles loading state before showing empty state', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    // Mock slow-loading empty data
    supabase.from().select.mockReturnValueOnce(pendingPromise);
    
    // Render component
    render(<DataTable tableName="projects" />);
    
    // Check loading state is displayed
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText(/no projects found/i)).not.toBeInTheDocument();
    
    // Resolve the promise with empty data
    resolvePromise({
      data: [],
      error: null
    });
    
    // Verify loading is replaced by empty state
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByText(/no projects found/i)).toBeInTheDocument();
    });
  });
});
