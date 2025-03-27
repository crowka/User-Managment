// __tests__/integration/feedback-submission-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackForm } from '../../project/src/components/feedback/FeedbackForm';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Feedback Submission Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock environment info
    global.navigator.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36';
    global.window.innerWidth = 1024;
    global.window.innerHeight = 768;
  });

  test('User can submit feedback with category and description', async () => {
    // Render feedback form
    render(<FeedbackForm />);
    
    // Select feedback category
    await user.click(screen.getByLabelText(/feedback type/i));
    await user.click(screen.getByText(/feature request/i));
    
    // Enter feedback description
    await user.type(
      screen.getByLabelText(/description/i), 
      'I would like to see a dark mode option in the application.'
    );
    
    // Mock successful submission
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify insert was called with correct data
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: 'user-123',
      category: 'feature_request',
      description: 'I would like to see a dark mode option in the application.',
      environment_info: expect.objectContaining({
        user_agent: expect.any(String),
        screen_size: expect.any(String)
      })
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('User can attach screenshot to feedback', async () => {
    // Render feedback form
    render(<FeedbackForm />);
    
    // Select feedback category
    await user.click(screen.getByLabelText(/feedback type/i));
    await user.click(screen.getByText(/bug report/i));
    
    // Enter feedback description
    await user.type(
      screen.getByLabelText(/description/i), 
      'The save button is not working properly.'
    );
    
    // Attach screenshot
    const file = new File(['screenshot data'], 'screenshot.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/attach screenshot/i), file);
    
    // Mock successful file upload
    supabase.storage.from().upload.mockResolvedValueOnce({
      data: { path: 'screenshots/feedback-123/screenshot.png' },
      error: null
    });
    
    // Mock public URL
    supabase.storage.from().getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/screenshots/feedback-123/screenshot.png' }
    });
    
    // Mock successful feedback submission
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify screenshot was uploaded and included in feedback
    expect(supabase.storage.from().upload).toHaveBeenCalled();
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'bug_report',
      description: 'The save button is not working properly.',
      screenshot_url: 'https://example.com/screenshots/feedback-123/screenshot.png'
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('Form validation prevents empty submissions', async () => {
    // Render feedback form
    render(<FeedbackForm />);
    
    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify validation errors
    expect(screen.getByText(/please select a feedback type/i)).toBeInTheDocument();
    expect(screen.getByText(/please provide a description/i)).toBeInTheDocument();
    
    // Verify no submission attempt was made
    expect(supabase.from().insert).not.toHaveBeenCalled();
  });
  
  test('User can include contact information for follow-up', async () => {
    // Render feedback form
    render(<FeedbackForm />);
    
    // Select feedback category
    await user.click(screen.getByLabelText(/feedback type/i));
    await user.click(screen.getByText(/question/i));
    
    // Enter feedback description
    await user.type(
      screen.getByLabelText(/description/i), 
      'How do I export my data?'
    );
    
    // Toggle contact permission
    await user.click(screen.getByLabelText(/contact me/i));
    
    // Enter preferred contact method
    await user.type(screen.getByLabelText(/preferred contact method/i), 'Email');
    
    // Mock successful submission
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify insert was called with contact information
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'question',
      description: 'How do I export my data?',
      allow_contact: true,
      contact_method: 'Email',
      contact_email: 'user@example.com'
    }));
  });
  
  test('Anonymous users can submit feedback', async () => {
    // Mock unauthenticated state
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });
    
    // Render feedback form
    render(<FeedbackForm />);
    
    // Select feedback category
    await user.click(screen.getByLabelText(/feedback type/i));
    await user.click(screen.getByText(/suggestion/i));
    
    // Enter feedback description
    await user.type(
      screen.getByLabelText(/description/i), 
      'The UI could be more intuitive.'
    );
    
    // Provide email for anonymous user
    await user.type(screen.getByLabelText(/email \(optional\)/i), 'anonymous@example.com');
    
    // Mock successful submission
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify insert was called with appropriate data
    expect(supabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
      category: 'suggestion',
      description: 'The UI could be more intuitive.',
      is_anonymous: true,
      contact_email: 'anonymous@example.com'
    }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
  
  test('Handles submission errors gracefully', async () => {
    // Render feedback form
    render(<FeedbackForm />);
    
    // Fill out form
    await user.click(screen.getByLabelText(/feedback type/i));
    await user.click(screen.getByText(/other/i));
    await user.type(
      screen.getByLabelText(/description/i), 
      'General comment about the application.'
    );
    
    // Mock submission error
    supabase.from().insert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error submitting feedback' }
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit feedback/i }));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error submitting feedback/i)).toBeInTheDocument();
    });
    
    // Verify retry option is available
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    
    // Fix the error
    supabase.from().insert.mockResolvedValueOnce({
      data: { id: 'feedback-123' },
      error: null
    });
    
    // Click retry
    await user.click(screen.getByRole('button', { name: /try again/i }));
    
    // Verify success after retry
    await waitFor(() => {
      expect(screen.getByText(/thank you for your feedback/i)).toBeInTheDocument();
    });
  });
});
