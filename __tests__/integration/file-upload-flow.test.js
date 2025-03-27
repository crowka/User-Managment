// __tests__/integration/file-upload-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileManager } from '../../project/src/components/files/FileManager';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('File Upload and Management Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Add list method to storage mock
    supabase.storage.from().list = jest.fn().mockResolvedValueOnce({
      data: [],
      error: null
    });
  });

  test('User can upload, view, and delete files', async () => {
    // Render file manager
    render(<FileManager />);
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/no files/i)).toBeInTheDocument();
    });
    
    // 1. UPLOAD: Create test file
    const file = new File(['test content'], 'test-doc.pdf', { type: 'application/pdf' });
    
    // Mock successful upload
    supabase.storage.from().upload.mockResolvedValueOnce({
      data: { path: 'test-doc.pdf' },
      error: null
    });
    
    // Find file input and upload
    const input = screen.getByLabelText(/upload file/i);
    await user.upload(input, file);
    
    // Mock file list after upload
    supabase.storage.from().list.mockResolvedValueOnce({
      data: [
        { name: 'test-doc.pdf', metadata: { size: 12345, mimetype: 'application/pdf' } }
      ],
      error: null
    });
    
    // Mock public URL
    supabase.storage.from().getPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/test-doc.pdf' }
    });
    
    // Verify file appears in list
    await waitFor(() => {
      expect(screen.getByText('test-doc.pdf')).toBeInTheDocument();
    });
    
    // 2. DOWNLOAD: Click download button
    const downloadLink = screen.getByRole('link', { name: /download/i });
    expect(downloadLink).toHaveAttribute('href', 'https://example.com/test-doc.pdf');
    
    // 3. DELETE: Click delete button
    await user.click(screen.getByRole('button', { name: /delete/i }));
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Mock successful deletion
    supabase.storage.from().remove = jest.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Mock empty list after deletion
    supabase.storage.from().list.mockResolvedValueOnce({
      data: [],
      error: null
    });
    
    // Verify file is removed
    await waitFor(() => {
      expect(screen.getByText(/no files/i)).toBeInTheDocument();
    });
  });
  
  test('displays upload progress indicator', async () => {
    // Create a promise that won't resolve immediately
    let resolveUpload;
    const pendingUpload = new Promise(resolve => {
      resolveUpload = resolve;
    });
    
    // Render file manager
    render(<FileManager />);
    
    // Mock slow upload
    supabase.storage.from().upload.mockReturnValueOnce(pendingUpload);
    
    // Upload a file
    const file = new File(['test content'], 'large-file.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload file/i);
    await user.upload(input, file);
    
    // Check for progress indicator
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    
    // Resolve upload
    resolveUpload({
      data: { path: 'large-file.pdf' },
      error: null
    });
    
    // Mock file list update
    supabase.storage.from().list.mockResolvedValueOnce({
      data: [{ name: 'large-file.pdf', metadata: { size: 50000 } }],
      error: null
    });
    
    // Verify progress indicator is gone
    await waitFor(() => {
      expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
      expect(screen.getByText('large-file.pdf')).toBeInTheDocument();
    });
  });
  
  test('handles file upload errors', async () => {
    // Render file manager
    render(<FileManager />);
    
    // Mock failed upload
    supabase.storage.from().upload.mockResolvedValueOnce({
      data: null,
      error: { message: 'File size exceeds limit' }
    });
    
    // Upload a file that will fail
    const largeFile = new File(['test'.repeat(1000000)], 'too-large.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText(/upload file/i);
    await user.upload(input, largeFile);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/file size exceeds limit/i)).toBeInTheDocument();
    });
  });
  
  test('handles different file types with appropriate icons', async () => {
    // Mock file list with different types
    supabase.storage.from().list.mockResolvedValueOnce({
      data: [
        { name: 'document.pdf', metadata: { size: 12345, mimetype: 'application/pdf' } },
        { name: 'image.jpg', metadata: { size: 23456, mimetype: 'image/jpeg' } },
        { name: 'spreadsheet.xlsx', metadata: { size: 34567, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' } }
      ],
      error: null
    });
    
    // Render file manager
    render(<FileManager />);
    
    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
      expect(screen.getByText('image.jpg')).toBeInTheDocument();
      expect(screen.getByText('spreadsheet.xlsx')).toBeInTheDocument();
    });
    
    // Check for appropriate file type icons (these will depend on your implementation)
    expect(screen.getByTestId('pdf-icon')).toBeInTheDocument();
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
    expect(screen.getByTestId('spreadsheet-icon')).toBeInTheDocument();
  });
});
