// __tests__/integration/social-sharing-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialSharingComponent } from '../../project/src/components/sharing/SocialSharingComponent';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Social Sharing Flow', () => {
  let user;
  
  // Mock the navigator.clipboard API
  const originalClipboard = { ...global.navigator.clipboard };
  const mockClipboard = {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock clipboard
    global.navigator.clipboard = mockClipboard;
    
    // Mock window.open for social sharing links
    global.open = jest.fn();
    
    // Mock data for shared item
    const mockItem = {
      id: 'item-123',
      title: 'Shareable Content Title',
      description: 'Description of the content being shared',
      slug: 'shareable-content',
      created_at: '2023-06-15T10:30:00Z',
      author: {
        name: 'John Doe',
        avatar_url: 'https://example.com/avatar.jpg'
      }
    };
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock GET item
    supabase.from().select.mockResolvedValueOnce({
      data: mockItem,
      error: null
    });
  });

  afterEach(() => {
    // Restore clipboard
    global.navigator.clipboard = originalClipboard;
  });

  test('User can share content via social platforms', async () => {
    // Mock location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com'
      },
      writable: true
    });
    
    // Render sharing component
    render(<SocialSharingComponent itemId="item-123" />);
    
    // Wait for item data to load
    await waitFor(() => {
      expect(screen.getByText('Shareable Content Title')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Expected share URL
    const expectedShareUrl = 'https://app.example.com/content/shareable-content';
    
    // Share on Twitter
    await user.click(screen.getByRole('button', { name: /twitter/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://twitter.com/intent/tweet'),
      expect.any(String)
    );
    expect(window.open.mock.calls[0][0]).toContain(encodeURIComponent(expectedShareUrl));
    
    // Share on LinkedIn
    await user.click(screen.getByRole('button', { name: /linkedin/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://www.linkedin.com/sharing/share-offsite'),
      expect.any(String)
    );
    expect(window.open.mock.calls[1][0]).toContain(encodeURIComponent(expectedShareUrl));
    
    // Share on Facebook
    await user.click(screen.getByRole('button', { name: /facebook/i }));
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('https://www.facebook.com/sharer/sharer.php'),
      expect.any(String)
    );
    expect(window.open.mock.calls[2][0]).toContain(encodeURIComponent(expectedShareUrl));
  });
  
  test('User can copy sharing link to clipboard', async () => {
    // Mock location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com'
      },
      writable: true
    });
    
    // Render sharing component
    render(<SocialSharingComponent itemId="item-123" />);
    
    // Wait for item data to load
    await waitFor(() => {
      expect(screen.getByText('Shareable Content Title')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Expected share URL
    const expectedShareUrl = 'https://app.example.com/content/shareable-content';
    
    // Click copy link button
    await user.click(screen.getByRole('button', { name: /copy link/i }));
    
    // Verify clipboard was called with expected URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expectedShareUrl);
    
    // Verify success message
    expect(screen.getByText(/link copied/i)).toBeInTheDocument();
  });
  
  test('User can email content link', async () => {
    // Mock location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com'
      },
      writable: true
    });
    
    // Render sharing component
    render(<SocialSharingComponent itemId="item-123" />);
    
    // Wait for item data to load
    await waitFor(() => {
      expect(screen.getByText('Shareable Content Title')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Expected share URL and subject
    const expectedShareUrl = 'https://app.example.com/content/shareable-content';
    const expectedSubject = 'Check out: Shareable Content Title';
    
    // Click email button
    await user.click(screen.getByRole('button', { name: /email/i }));
    
    // Verify mailto link was opened with correct params
    expect(window.open).toHaveBeenCalledWith(
      expect.stringMatching(/^mailto:\?subject=.*&body=.*/),
      expect.any(String)
    );
    expect(window.open.mock.calls[0][0]).toContain(encodeURIComponent(expectedSubject));
    expect(window.open.mock.calls[0][0]).toContain(encodeURIComponent(expectedShareUrl));
  });
  
  test('Records analytics when content is shared', async () => {
    // Mock analytics tracking function
    window.trackEvent = jest.fn();
    
    // Render sharing component
    render(<SocialSharingComponent itemId="item-123" />);
    
    // Wait for item data to load
    await waitFor(() => {
      expect(screen.getByText('Shareable Content Title')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Share on Twitter
    await user.click(screen.getByRole('button', { name: /twitter/i }));
    
    // Verify analytics was called
    expect(window.trackEvent).toHaveBeenCalledWith('share_content', {
      platform: 'twitter',
      content_id: 'item-123',
      content_type: 'post',
      content_title: 'Shareable Content Title'
    });
  });
  
  test('Shows appropriate sharing platforms based on content type', async () => {
    // Mock image content
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'image-123',
        title: 'Image Content',
        content_type: 'image',
        url: 'https://example.com/image.jpg',
        slug: 'image-content'
      },
      error: null
    });
    
    // Render sharing component for image
    render(<SocialSharingComponent itemId="image-123" />);
    
    // Wait for image data to load
    await waitFor(() => {
      expect(screen.getByText('Image Content')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Should show Pinterest for image content
    expect(screen.getByRole('button', { name: /pinterest/i })).toBeInTheDocument();
    
    // Mock different content type
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'doc-123',
        title: 'Document Content',
        content_type: 'document',
        slug: 'document-content'
      },
      error: null
    });
    
    // Re-render with different content type
    render(<SocialSharingComponent itemId="doc-123" />);
    
    // Wait for document data to load
    await waitFor(() => {
      expect(screen.getByText('Document Content')).toBeInTheDocument();
    });
    
    // Open sharing menu
    await user.click(screen.getByRole('button', { name: /share/i }));
    
    // Pinterest should not be available for document
    expect(screen.queryByRole('button', { name: /pinterest/i })).not.toBeInTheDocument();
  });
});
