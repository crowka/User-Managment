// __tests__/integration/dashboard-view-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportingDashboard } from '../../project/src/components/reporting/ReportingDashboard';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Dashboard and Reporting Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Add rpc method to mock
    supabase.rpc = jest.fn().mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 12,
          activeUsers: 8
        },
        recentActivity: [
          { id: 'act1', type: 'create', user: 'John', date: '2023-03-15T10:30:00Z' },
          { id: 'act2', type: 'update', user: 'Sarah', date: '2023-03-14T14:20:00Z' }
        ]
      },
      error: null
    });
  });

  test('User can view and interact with dashboard reports', async () => {
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
      expect(screen.getByText('Items This Month: 12')).toBeInTheDocument();
    });
    
    // Verify activity feed is shown
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Sarah')).toBeInTheDocument();
    
    // Change date range
    // Mock data for new date range
    supabase.rpc.mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 5,
          activeUsers: 3
        },
        recentActivity: [
          { id: 'act3', type: 'delete', user: 'Mike', date: '2023-02-28T09:15:00Z' }
        ]
      },
      error: null
    });
    
    // Select previous month
    await user.click(screen.getByLabelText(/date range/i));
    await user.click(screen.getByText(/previous month/i));
    
    // Verify data updated
    await waitFor(() => {
      expect(screen.getByText('Items This Month: 5')).toBeInTheDocument();
      expect(screen.getByText('Mike')).toBeInTheDocument();
    });
    
    // Export report
    // Mock export function
    const mockExportFunc = jest.fn();
    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();
    
    // Replace the hidden export function with our mock
    global.Blob = jest.fn().mockImplementation(() => ({}));
    global.document.createElement = jest.fn().mockImplementation(() => ({
      style: {},
      setAttribute: jest.fn(),
      click: mockExportFunc,
      remove: jest.fn()
    }));
    
    // Click export button
    await user.click(screen.getByRole('button', { name: /export/i }));
    
    // Verify export was called
    expect(mockExportFunc).toHaveBeenCalled();
  });
  
  test('shows loading state while fetching data', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise;
    const pendingPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    // Mock slow-loading data
    supabase.rpc.mockReturnValueOnce(pendingPromise);
    
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Check loading state is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Resolve the promise with data
    resolvePromise({
      data: {
        summary: { totalItems: 45, itemsThisMonth: 12, activeUsers: 8 },
        recentActivity: []
      },
      error: null
    });
    
    // Verify loading state is removed
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
    });
  });
  
  test('handles error when loading dashboard data', async () => {
    // Mock error response
    supabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error loading dashboard data' }
    });
    
    // Render dashboard
    render(<ReportingDashboard />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading dashboard data/i)).toBeInTheDocument();
    });
  });
  
  test('can filter dashboard by different metrics', async () => {
    // Mock initial data
    render(<ReportingDashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Total Items: 45')).toBeInTheDocument();
    });
    
    // Mock data for different metric
    supabase.rpc.mockResolvedValueOnce({
      data: {
        summary: {
          totalItems: 45,
          itemsThisMonth: 12,
          activeUsers: 8,
          averageProcessingTime: '3.5 days'
        },
        recentActivity: []
      },
      error: null
    });
    
    // Change metric view
    await user.click(screen.getByLabelText(/metrics/i));
    await user.click(screen.getByText(/processing time/i));
    
    // Verify new metric is displayed
    await waitFor(() => {
      expect(screen.getByText('Average Processing Time: 3.5 days')).toBeInTheDocument();
    });
  });
});
