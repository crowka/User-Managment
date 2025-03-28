// __tests__/integration/search-filter-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPage } from '../../project/src/components/search/SearchPage';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Search and Filtering Flow', () => {
  let user;
  
  // Test data
  const mockItems = [
    { id: 'item1', title: 'Marketing Report', category: 'report', date: '2023-01-15' },
    { id: 'item2', title: 'Sales Presentation', category: 'presentation', date: '2023-02-20' },
    { id: 'item3', title: 'Budget Spreadsheet', category: 'spreadsheet', date: '2023-03-10' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock initial data fetch
    supabase.from().select.mockResolvedValueOnce({
      data: mockItems,
      error: null
    });
  });

  test('User can search and filter content', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.getByText('Budget Spreadsheet')).toBeInTheDocument();
    });
    
    // Test search functionality
    // Mock search results
    supabase.from().select.mockResolvedValueOnce({
      data: [mockItems[1]], // Only the presentation
      error: null
    });
    
    // Type search query
    await user.type(screen.getByRole('searchbox'), 'presentation');
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.queryByText('Marketing Report')).not.toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    });
    
    // Clear search
    await user.clear(screen.getByRole('searchbox'));
    
    // Mock full results again
    supabase.from().select.mockResolvedValueOnce({
      data: mockItems,
      error: null
    });
    
    // Wait for all items to return
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.getByText('Budget Spreadsheet')).toBeInTheDocument();
    });
    
    // Test category filter
    // Mock filtered results
    supabase.from().select.mockResolvedValueOnce({
      data: [mockItems[0]], // Only the report
      error: null
    });
    
    // Select category filter
    await user.click(screen.getByLabelText(/category/i));
    await user.click(screen.getByText(/report/i));
    
    // Wait for filtered results
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    });
  });

  test('handles combined search and filter operations', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
    });
    
    // Mock combined search and filter results
    supabase.from().select.mockResolvedValueOnce({
      data: [mockItems[0]], // Only Marketing Report
      error: null
    });
    
    // Apply category filter
    await user.click(screen.getByLabelText(/category/i));
    await user.click(screen.getByText(/report/i));
    
    // Enter search term
    await user.type(screen.getByRole('searchbox'), 'marketing');
    
    // Verify both search and filter applied
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.queryByText('Sales Presentation')).not.toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    });
    
    // Verify correct query was sent to API
    expect(supabase.from).toHaveBeenCalledWith('items');
    expect(supabase.select).toHaveBeenCalled();
    // These depend on your implementation, but something like:
    expect(supabase.ilike).toHaveBeenCalledWith('title', '%marketing%');
    expect(supabase.eq).toHaveBeenCalledWith('category', 'report');
  });

  test('applying date range filter', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
    
    // Mock date filtered results
    supabase.from().select.mockResolvedValueOnce({
      data: [mockItems[0], mockItems[1]], // Only January and February items
      error: null
    });
    
    // Open date filter
    await user.click(screen.getByLabelText(/date range/i));
    
    // Select date range
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    await user.clear(startDateInput);
    await user.type(startDateInput, '2023-01-01');
    
    await user.clear(endDateInput);
    await user.type(endDateInput, '2023-02-28');
    
    // Apply date filter
    await user.click(screen.getByRole('button', { name: /apply/i }));
    
    // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.queryByText('Budget Spreadsheet')).not.toBeInTheDocument();
    });
  });

  test('displays no results message for empty search', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
    
    // Mock empty search results
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Search for non-existent term
    await user.type(screen.getByRole('searchbox'), 'nonexistent');
    
    // Verify no results message
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      expect(screen.queryByText('Marketing Report')).not.toBeInTheDocument();
    });
  });

  test('handles error during search operation', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
    
    // Mock search error
    supabase.from().select.mockResolvedValueOnce({
      data: null,
      error: { message: 'Search operation failed' }
    });
    
    // Perform search
    await user.type(screen.getByRole('searchbox'), 'query');
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/search operation failed/i)).toBeInTheDocument();
    });
  });

  test('reset filters button clears all active filters', async () => {
    // Render search page
    render(<SearchPage />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
    });
    
    // Apply category filter
    await user.click(screen.getByLabelText(/category/i));
    await user.click(screen.getByText(/report/i));
    
    // Apply search filter
    await user.type(screen.getByRole('searchbox'), 'marketing');
    
    // Mock reset result
    supabase.from().select.mockResolvedValueOnce({
      data: mockItems,
      error: null
    });
    
    // Click reset filters button
    await user.click(screen.getByRole('button', { name: /reset filters/i }));
    
    // Verify all items return
    await waitFor(() => {
      expect(screen.getByText('Marketing Report')).toBeInTheDocument();
      expect(screen.getByText('Sales Presentation')).toBeInTheDocument();
      expect(screen.getByText('Budget Spreadsheet')).toBeInTheDocument();
    });
    
    // Search field should be cleared
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });
});
