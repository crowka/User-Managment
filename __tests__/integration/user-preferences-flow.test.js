// __tests__/integration/user-preferences-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserPreferences } from '../../project/src/components/user/UserPreferences';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('User Preferences Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock current user preferences
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'pref-1',
        user_id: 'user-123',
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        items_per_page: 25
      },
      error: null
    });
  });

  test('User can view and update preferences', async () => {
    // Render user preferences
    render(<UserPreferences />);
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
      expect(screen.getByLabelText(/language/i)).toHaveValue('en');
      expect(screen.getByLabelText(/items per page/i)).toHaveValue('25');
    });
    
    // Update preferences
    await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    await user.selectOptions(screen.getByLabelText(/language/i), 'es');
    await user.clear(screen.getByLabelText(/items per page/i));
    await user.type(screen.getByLabelText(/items per page/i), '50');
    
    // Mock successful update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        id: 'pref-1',
        user_id: 'user-123',
        theme: 'dark',
        language: 'es',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        items_per_page: 50
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify save was successful
    await waitFor(() => {
      expect(screen.getByText(/preferences saved/i)).toBeInTheDocument();
    });
    
    // Verify update was called with correct data
    expect(supabase.from().update).toHaveBeenCalledWith({
      theme: 'dark',
      language: 'es',
      timezone: 'America/New_York',
      date_format: 'MM/DD/YYYY',
      items_per_page: 50
    });
  });
  
  test('applies theme change immediately', async () => {
    // Mock document.documentElement for theme testing
    const documentElementClassList = {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn()
    };
    
    Object.defineProperty(document, 'documentElement', {
      value: { classList: documentElementClassList },
      writable: true
    });
    
    // Mock preference update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        theme: 'dark'
      },
      error: null
    });
    
    // Render user preferences
    render(<UserPreferences />);
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
    });
    
    // Change theme
    await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify theme was applied immediately
    expect(documentElementClassList.remove).toHaveBeenCalledWith('light-theme');
    expect(documentElementClassList.add).toHaveBeenCalledWith('dark-theme');
    
    // Restore original document.documentElement
    jest.restoreAllMocks();
  });
  
  test('validates items per page input', async () => {
    // Render user preferences
    render(<UserPreferences />);
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByLabelText(/items per page/i)).toBeInTheDocument();
    });
    
    // Enter invalid value
    await user.clear(screen.getByLabelText(/items per page/i));
    await user.type(screen.getByLabelText(/items per page/i), '500');
    
    // Try to save
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify validation error
    expect(screen.getByText(/maximum allowed is 100/i)).toBeInTheDocument();
    
    // Verify no update was attempted
    expect(supabase.from().update).not.toHaveBeenCalled();
  });
  
  test('handles error when saving preferences', async () => {
    // Render user preferences
    render(<UserPreferences />);
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    });
    
    // Change theme
    await user.selectOptions(screen.getByLabelText(/theme/i), 'dark');
    
    // Mock error during update
    supabase.from().update.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error saving preferences' }
    });
    
    // Try to save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error saving preferences/i)).toBeInTheDocument();
    });
  });
});
