// __tests__/integration/data-management-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '../../project/src/components/dashboard/Dashboard';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Data Management Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock empty data list initially
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
  });

  test('User can create, view, edit and delete content', async () => {
    // Render dashboard
    render(<Dashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
    
    // 1. CREATE: Click create new button
    await user.click(screen.getByRole('button', { name: /create new/i }));
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Item');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Mock successful creation
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'item-1', title: 'Test Item', description: 'Test Description' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // 2. VIEW: Mock data fetch showing the new item
    supabase.from().select.mockResolvedValueOnce({
      data: [{ id: 'item-1', title: 'Test Item', description: 'Test Description' }],
      error: null
    });
    
    // Verify item appears in list
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    // 3. EDIT: Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    // Update form
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Updated Item');
    
    // Mock successful update
    supabase.from().update.mockResolvedValueOnce({
      data: { id: 'item-1', title: 'Updated Item', description: 'Test Description' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Mock data fetch showing updated item
    supabase.from().select.mockResolvedValueOnce({
      data: [{ id: 'item-1', title: 'Updated Item', description: 'Test Description' }],
      error: null
    });
    
    // Verify item is updated
    await waitFor(() => {
      expect(screen.getByText('Updated Item')).toBeInTheDocument();
    });
    
    // 4. DELETE: Click delete button
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Mock successful deletion
    supabase.from().delete.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Mock empty data after deletion
    supabase.from().select.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Verify item is removed
    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
  });
  
  test('handles error when creating item', async () => {
    // Render dashboard
    render(<Dashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
    
    // Click create new button
    await user.click(screen.getByRole('button', { name: /create new/i }));
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Item');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Mock error during creation
    supabase.from().insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error creating item' }
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error creating item/i)).toBeInTheDocument();
    });
  });

  test('handles error when updating item', async () => {
    // Mock initial data with one item
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: [{ id: 'item-1', title: 'Original Item', description: 'Original Description' }],
      error: null
    });
    
    // Render dashboard
    render(<Dashboard />);
    
    // Wait for dashboard to load with item
    await waitFor(() => {
      expect(screen.getByText('Original Item')).toBeInTheDocument();
    });
    
    // Click edit button
    await user.click(screen.getByRole('button', { name: /edit/i }));
    
    // Update form
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Updated Item');
    
    // Mock error during update
    supabase.from().update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error updating item' }
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error updating item/i)).toBeInTheDocument();
    });
  });

  test('handles error when deleting item', async () => {
    // Mock initial data with one item
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: [{ id: 'item-1', title: 'Test Item', description: 'Test Description' }],
      error: null
    });
    
    // Render dashboard
    render(<Dashboard />);
    
    // Wait for dashboard to load with item
    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });
    
    // Click delete button
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Mock error during deletion
    supabase.from().delete.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error deleting item' }
    });
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error deleting item/i)).toBeInTheDocument();
    });
  });

  test('cancel button closes form without saving', async () => {
    // Render dashboard
    render(<Dashboard />);
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/no items found/i)).toBeInTheDocument();
    });
    
    // Click create new button
    await user.click(screen.getByRole('button', { name: /create new/i }));
    
    // Fill form
    await user.type(screen.getByLabelText(/title/i), 'Test Item');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Click cancel button
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    
    // Verify form is closed
    await waitFor(() => {
      expect(screen.queryByLabelText(/title/i)).not.toBeInTheDocument();
    });
    
    // Verify no API calls were made
    expect(supabase.from().insert).not.toHaveBeenCalled();
  });
});
