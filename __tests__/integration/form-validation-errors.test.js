// __tests__/integration/form-validation-errors.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '../../project/src/components/auth/RegistrationForm';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Form Validation Errors', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  test('Displays validation errors with clear guidance', async () => {
    // Render registration form
    render(<RegistrationForm />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for required field errors
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    
    // Enter invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    
    // Enter short password
    await user.type(screen.getByLabelText(/password/i), 'short');
    
    // Submit form again
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for format validation errors
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    
    // Enter valid email
    await user.clear(screen.getByLabelText(/email/i));
    await user.type(screen.getByLabelText(/email/i), 'valid@example.com');
    
    // Enter password without required complexity
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'password123');
    
    // Submit form again
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for password complexity error
    expect(screen.getByText(/password must include at least one uppercase letter/i)).toBeInTheDocument();
    
    // Enter valid password meeting all requirements
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    
    // Enter mismatched password confirmation
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');
    
    // Submit form again
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for password match error
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    
    // Fix password confirmation
    await user.clear(screen.getByLabelText(/confirm password/i));
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Mock successful registration
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id' } },
      error: null
    });
    
    // Submit valid form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Verify form was submitted successfully
    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'valid@example.com',
        password: 'Password123!'
      });
    });
    
    // Verify success message
    expect(screen.getByText(/account created/i)).toBeInTheDocument();
  });
  
  test('Shows human-friendly validation messages with helpful suggestions', async () => {
    // Render registration form
    render(<RegistrationForm />);
    
    // Enter weak password
    await user.type(screen.getByLabelText(/password/i), 'weak');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for friendly error message
    const errorMessage = screen.getByText(/password must be at least 8 characters/i);
    expect(errorMessage).toBeInTheDocument();
    
    // Check for helpful suggestion
    expect(screen.getByText(/try using a phrase with special characters/i)).toBeInTheDocument();
    
    // Check for strength indicator
    expect(screen.getByText(/password strength: weak/i)).toBeInTheDocument();
    
    // Try a medium-strength password
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    
    // Check updated strength indicator
    expect(screen.getByText(/password strength: medium/i)).toBeInTheDocument();
    
    // Try a strong password
    await user.clear(screen.getByLabelText(/password/i));
    await user.type(screen.getByLabelText(/password/i), 'P@ssw0rd!ComplexString123');
    
    // Check updated strength indicator
    expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument();
  });
  
  test('Validates fields in real-time as user types', async () => {
    // Render registration form
    render(<RegistrationForm />);
    
    // Type invalid email
    await user.type(screen.getByLabelText(/email/i), 'invalid');
    
    // Move focus away to trigger validation
    await user.tab();
    
    // Check for immediate validation message
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    
    // Fix email and verify error clears
    await user.type(screen.getByLabelText(/email/i), '@example.com');
    
    // Check that error is cleared
    await waitFor(() => {
      expect(screen.queryByText(/valid email address/i)).not.toBeInTheDocument();
    });
    
    // Check that valid state is indicated
    expect(screen.getByLabelText(/email/i)).toHaveClass('valid-input');
  });
  
  test('Shows summary of all errors at top of form', async () => {
    // Render registration form
    render(<RegistrationForm showErrorSummary={true} />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for error summary
    const errorSummary = screen.getByRole('alert', { name: /form errors/i });
    expect(errorSummary).toBeInTheDocument();
    
    // Check that summary contains list of errors
    const errorList = screen.getAllByRole('listitem');
    expect(errorList.length).toBeGreaterThan(1);
    
    // Check that clicking on error focuses the appropriate field
    await user.click(errorList[0]);
    
    // Check that appropriate field is focused
    expect(document.activeElement).toBe(screen.getByLabelText(/email/i));
  });
 // Continuing the form-validation-errors.test.js file

  test('Handles server-side validation errors', async () => {
    // Render registration form
    render(<RegistrationForm />);
    
    // Fill form with valid data
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Mock server-side validation error (email already in use)
    supabase.auth.signUp.mockResolvedValueOnce({
      data: null,
      error: { message: 'User already registered', code: 'email_taken' }
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for server error displayed as field error
    await waitFor(() => {
      expect(screen.getByText(/email is already registered/i)).toBeInTheDocument();
    });
    
    // Verify email field is marked as invalid
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
    
    // Verify helpful suggestion is provided
    expect(screen.getByText(/try signing in instead/i)).toBeInTheDocument();
    
    // Verify sign in link is provided
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
  
  test('Validates complex form with dependent fields', async () => {
    // Render registration form with additional fields
    render(<RegistrationForm showAdvancedOptions={true} />);
    
    // Complete basic fields
    await user.type(screen.getByLabelText(/email/i), 'valid@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123!');
    
    // Toggle organization account option
    await user.click(screen.getByLabelText(/create organization account/i));
    
    // Submit without entering organization details
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check for conditional validation error
    expect(screen.getByText(/organization name is required/i)).toBeInTheDocument();
    
    // Enter organization name
    await user.type(screen.getByLabelText(/organization name/i), 'Test Company');
    
    // Select industry from dropdown
    await user.click(screen.getByLabelText(/industry/i));
    await user.click(screen.getByText(/technology/i));
    
    // Mock successful registration
    supabase.auth.signUp.mockResolvedValueOnce({
      data: { user: { id: 'new-user-id' } },
      error: null
    });
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Verify all required fields were submitted
    expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'valid@example.com',
      password: 'Password123!',
      options: {
        data: {
          organization_name: 'Test Company',
          industry: 'technology'
        }
      }
    }));
  });
  
  test('Keyboard navigation works correctly with validation errors', async () => {
    // Render registration form
    render(<RegistrationForm />);
    
    // Submit empty form
    await user.click(screen.getByRole('button', { name: /create account/i }));
    
    // Check that first invalid field has focus
    expect(document.activeElement).toBe(screen.getByLabelText(/email/i));
    
    // Try to fix email field
    await user.type(document.activeElement, 'valid@example.com');
    
    // Press Tab to move to next field
    await user.tab();
    
    // Check that next invalid field has focus
    expect(document.activeElement).toBe(screen.getByLabelText(/password/i));
    
    // Verify that keyboard navigation is working with ARIA
    expect(document.activeElement).toHaveAttribute('aria-describedby');
    const errorId = document.activeElement.getAttribute('aria-describedby');
    expect(document.getElementById(errorId)).toHaveTextContent(/password is required/i);
  });
}); 
 
