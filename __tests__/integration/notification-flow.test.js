// __tests__/integration/notification-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationSettings } from '../../project/src/components/notifications/NotificationSettings';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Notification Management Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock current notification settings
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: false,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: false
        }
      },
      error: null
    });
  });

  test('User can view and update notification preferences', async () => {
    // Render notification settings
    render(<NotificationSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
      expect(screen.getByLabelText(/push notifications/i)).not.toBeChecked();
    });
    
    // Verify notification types are displayed correctly
    expect(screen.getByLabelText(/system updates/i)).toBeChecked();
    expect(screen.getByLabelText(/new messages/i)).toBeChecked();
    expect(screen.getByLabelText(/activity summaries/i)).not.toBeChecked();
    
    // Update settings
    await user.click(screen.getByLabelText(/push notifications/i));
    await user.click(screen.getByLabelText(/activity summaries/i));
    
    // Mock successful update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: true
        }
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify save was successful
    await waitFor(() => {
      expect(screen.getByText(/settings saved/i)).toBeInTheDocument();
    });
    
    // Verify update was called with correct data
    expect(supabase.from().update).toHaveBeenCalledWith({
      push_notifications: true,
      notification_types: {
        system_updates: true,
        new_messages: true,
        activity_summaries: true
      }
    });
  });
  
  test('displays error when settings cannot be loaded', async () => {
    // Mock error loading settings
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error loading notification settings' }
    });
    
    // Render notification settings
    render(<NotificationSettings />);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error loading notification settings/i)).toBeInTheDocument();
    });
  });
  
  test('handles error when saving settings', async () => {
    // Render notification settings
    render(<NotificationSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeInTheDocument();
    });
    
    // Make a change
    await user.click(screen.getByLabelText(/push notifications/i));
    
    // Mock error during update
    supabase.from().update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error saving notification settings' }
    });
    
    // Try to save changes
    await user.click(screen.getByRole('button', { name: /save changes/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error saving notification settings/i)).toBeInTheDocument();
    });
  });
  
  test('can reset notification preferences to defaults', async () => {
    // Render notification settings
    render(<NotificationSettings />);
    
    // Wait for settings to load
    await waitFor(() => {
      expect(screen.getByLabelText(/email notifications/i)).toBeChecked();
    });
    
    // Mock successful reset
    supabase.from().update.mockResolvedValueOnce({
      data: {
        id: 'notif-1',
        user_id: 'user-123',
        email_notifications: true,
        push_notifications: true,
        notification_types: {
          system_updates: true,
          new_messages: true,
          activity_summaries: true,
          mentions: true
        }
      },
      error: null
    });
    
    // Click reset to defaults button
    await user.click(screen.getByRole('button', { name: /reset to defaults/i }));
    
    // Confirm reset
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify reset was successful
    await waitFor(() => {
      expect(screen.getByText(/settings restored/i)).toBeInTheDocument();
    });
    
    // Verify defaults were applied
    expect(screen.getByLabelText(/push notifications/i)).toBeChecked();
    expect(screen.getByLabelText(/activity summaries/i)).toBeChecked();
  });
});
