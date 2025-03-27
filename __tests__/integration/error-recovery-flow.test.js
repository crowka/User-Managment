// __tests__/integration/error-recovery-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormWithRecovery } from '../../project/src/components/forms/FormWithRecovery';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Error Recovery Flow', () => {
  let user;
  
  // Mock localStorage
  const localStorageMock = (function() {
    let store = {};
    return {
      getItem: jest.fn(key => store[key]),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      })
    };
  })();

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
  });

  test('Form recovers data after network error', async () => {
    // Render form component
    render(<FormWithRecovery formId="test-form" />);
    
    // Fill out form
    await user.type(screen.getByLabelText(/title/i), 'Test Title');
    await user.type(screen.getByLabelText(/description/i), 'Test Description');
    
    // Mock form submission error
    supabase.from().insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error', code: 'NETWORK_ERROR' }
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByText(/your data has been saved locally/i)).toBeInTheDocument();
    });
    
    // Verify form data was saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'form_recovery_test-form',
      expect.stringContaining('Test Title')
    );
    
    // Simulate page reload
    jest.clearAllMocks();
    
    // Mock localStorage to return saved form data
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
      title: 'Test Title',
      description: 'Test Description',
      timestamp: Date.now()
    }));
    
    // Re-render form
    render(<FormWithRecovery formId="test-form" />);
    
    // Verify form data is recovered
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('Test Title');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Test Description');
    });
    
    // Verify recovery message is displayed
    expect(screen.getByText(/we've restored your previous data/i)).toBeInTheDocument();
    
    // Mock successful submission on retry
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'item-1', title: 'Test Title', description: 'Test Description' },
      error: null
    });
    
    // Submit recovered form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/successfully submitted/i)).toBeInTheDocument();
    });
    
    // Verify localStorage entry was removed after successful submission
    expect(localStorage.removeItem).toHaveBeenCalledWith('form_recovery_test-form');
  });
  
  test('User can discard recovered data', async () => {
    // Mock localStorage to return saved form data
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
      title: 'Old Title',
      description: 'Old Description',
      timestamp: Date.now() - 3600000 // 1 hour ago
    }));
    
    // Render form
    render(<FormWithRecovery formId="test-form" />);
    
    // Verify form data is recovered
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('Old Title');
    });
    
    // Verify recovery message with timestamp is displayed
    expect(screen.getByText(/we've restored your previous data/i)).toBeInTheDocument();
    expect(screen.getByText(/from about 1 hour ago/i)).toBeInTheDocument();
    
    // Click discard button
    await user.click(screen.getByRole('button', { name: /discard/i }));
    
    // Verify form is cleared
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
    
    // Verify localStorage entry was removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('form_recovery_test-form');
  });
  
  test('Recovery only shows for recent data', async () => {
    // Mock localStorage to return very old form data (3 days old)
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({
      title: 'Very Old Title',
      description: 'Very Old Description',
      timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 days ago
    }));
    
    // Render form
    render(<FormWithRecovery formId="test-form" />);
    
    // Verify form data is NOT recovered (default empty form)
    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toHaveValue('');
      expect(screen.getByLabelText(/description/i)).toHaveValue('');
    });
    
    // Verify no recovery message is displayed
    expect(screen.queryByText(/we've restored your previous data/i)).not.toBeInTheDocument();
    
    // Verify very old localStorage entry was removed
    expect(localStorage.removeItem).toHaveBeenCalledWith('form_recovery_test-form');
  });
  
  test('Multiple form instances have separate recovery data', async () => {
    // Render two form instances
    const { rerender } = render(<FormWithRecovery formId="form-a" />);
    
    // Fill out first form
    await user.type(screen.getByLabelText(/title/i), 'Form A Title');
    await user.type(screen.getByLabelText(/description/i), 'Form A Description');
    
    // Mock submission error
    supabase.from().insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error', code: 'NETWORK_ERROR' }
    });
    
    // Submit first form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify first form data was saved to localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'form_recovery_form-a',
      expect.stringContaining('Form A Title')
    );
    
    // Render second form
    rerender(<FormWithRecovery formId="form-b" />);
    
    // Fill out second form
    await user.type(screen.getByLabelText(/title/i), 'Form B Title');
    await user.type(screen.getByLabelText(/description/i), 'Form B Description');
    
    // Mock submission error
    supabase.from().insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network error', code: 'NETWORK_ERROR' }
    });
    
    // Submit second form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Verify second form data was saved to localStorage under different key
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'form_recovery_form-b',
      expect.stringContaining('Form B Title')
    );
    
    // Verify each form has its own recovery data
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });
});
