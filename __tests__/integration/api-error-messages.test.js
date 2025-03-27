// __tests__/integration/api-error-messages.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../project/src/components/auth/LoginForm';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('API Error Messages', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  test('displays user-friendly error messages for common API errors', async () => {
    // Render login form
    render(<LoginForm />);
    
    // Enter login credentials
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Test different API error scenarios
    const errorScenarios = [
      {
        apiError: { message: 'Invalid login credentials', code: 'INVALID_CREDENTIALS' },
        expectedMessage: /email or password is incorrect/i
      },
      {
        apiError: { message: 'Email not confirmed', code: 'EMAIL_NOT_CONFIRMED' },
        expectedMessage: /please verify your email/i
      },
      {
        apiError: { message: 'Rate limit exceeded', code: 'RATE_LIMIT_EXCEEDED' },
        expectedMessage: /too many login attempts/i
      },
      {
        apiError: { message: 'Network error', code: 'NETWORK_ERROR' },
        expectedMessage: /unable to connect to the server/i
      },
      {
        apiError: { message: 'Service unavailable', code: 'SERVICE_UNAVAILABLE' },
        expectedMessage: /service is temporarily unavailable/i
      }
    ];
    
    for (const scenario of errorScenarios) {
      // Mock API error response
      supabase.auth.signIn.mockResolvedValueOnce({
        data: null,
        error: scenario.apiError
      });
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Verify user-friendly error message is displayed
      await waitFor(() => {
        expect(screen.getByText(scenario.expectedMessage)).toBeInTheDocument();
      });
    }
  });
  
  test('provides helpful suggestions for common user errors', async () => {
    // Render login form
    render(<LoginForm />);
    
    // Test form validation errors with suggestions
    const validationScenarios = [
      {
        input: { email: 'not-an-email', password: 'pwd' },
        expectedError: /please enter a valid email address/i,
        expectedSuggestion: /like name@example.com/i
      },
      {
        input: { email: 'test@example.com', password: '123' },
        expectedError: /password is too short/i,
        expectedSuggestion: /at least 8 characters/i
      }
    ];
    
    for (const scenario of validationScenarios) {
      // Clear form
      await user.clear(screen.getByLabelText(/email/i));
      await user.clear(screen.getByLabelText(/password/i));
      
      // Enter invalid data
      await user.type(screen.getByLabelText(/email/i), scenario.input.email);
      await user.type(screen.getByLabelText(/password/i), scenario.input.password);
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      // Verify error message and suggestion are displayed
      expect(screen.getByText(scenario.expectedError)).toBeInTheDocument();
      expect(screen.getByText(scenario.expectedSuggestion)).toBeInTheDocument();
    }
  });
  
  test('error messages are accessible to screen readers', async () => {
    // Render login form
    render(<LoginForm />);
    
    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'not-an-email');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    
    // Verify error message has correct aria attributes
    const errorMessage = screen.getByText(/please enter a valid email address/i);
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    
    // Verify input is marked as invalid
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby', expect.stringContaining('error'));
  });
  
  test('displays consolidated error messages for multiple issues', async () => {
    // Render form with multiple fields
    render(<LoginForm showRegistration={true} />);
    
    // View registration form
    await user.click(screen.getByText(/create account/i));
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Verify consolidated error message is displayed
    await waitFor(() => {
      const errorSummary = screen.getByRole('alert', { name: /form errors/i });
      expect(errorSummary).toBeInTheDocument();
      expect(errorSummary).toHaveTextContent(/please fix the following issues/i);
      
      // Check for multiple error items
      const errorItems = screen.getAllByRole('listitem');
      expect(errorItems.length).toBeGreaterThan(1);
    });
  });
});
