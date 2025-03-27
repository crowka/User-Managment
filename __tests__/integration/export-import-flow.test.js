// __tests__/integration/export-import-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataExporter } from '../../project/src/components/data/DataExporter';
import { DataImporter } from '../../project/src/components/data/DataImporter';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Data Export Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
    
    // Mock export data
    supabase.from().select.mockResolvedValueOnce({
      data: [
        { id: 'item1', title: 'First Item', content: 'Content 1' },
        { id: 'item2', title: 'Second Item', content: 'Content 2' }
      ],
      error: null
    });
  });

  test('User can export data in different formats', async () => {
    // Mock download functionality
    const mockDownload = jest.fn();
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock document.createElement for the download link
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          setAttribute: jest.fn(),
          click: mockDownload,
          remove: jest.fn()
        };
      }
      return originalCreateElement(tag);
    });
    
    // Render component
    render(<DataExporter />);
    
    // Select CSV format
    await user.click(screen.getByLabelText(/csv/i));
    
    // Click export button
    await user.click(screen.getByRole('button', { name: /export/i }));
    
    // Verify download was triggered
    expect(mockDownload).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    
    // Reset mock count
    mockDownload.mockClear();
    global.URL.createObjectURL.mockClear();
    
    // Select JSON format
    await user.click(screen.getByLabelText(/json/i));
    
    // Click export button
    await user.click(screen.getByRole('button', { name: /export/i }));
    
    // Verify download was triggered again
    expect(mockDownload).toHaveBeenCalled();
    expect(global.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    
    // Restore original document.createElement
    document.createElement = originalCreateElement;
  });
  
  test('handles export errors gracefully', async () => {
    // Mock export error
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: null,
      error: { message: 'Error fetching data for export' }
    });
    
    // Render component
    render(<DataExporter />);
    
    // Click export button
    await user.click(screen.getByRole('button', { name: /export/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error fetching data for export/i)).toBeInTheDocument();
    });
  });
});

describe('Data Import Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authenticated user
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null
    });
  });

  test('User can import CSV data', async () => {
    // Mock successful import
    supabase.from().upsert = jest.fn().mockResolvedValueOnce({
      data: { count: 3 },
      error: null
    });
    
    // Render component
    render(<DataImporter />);
    
    // Create CSV file
    const csvContent = 'title,content\nImported Item 1,Content 1\nImported Item 2,Content 2\nImported Item 3,Content 3';
    const file = new File([csvContent], 'import.csv', { type: 'text/csv' });
    
    // Upload file
    await user.upload(screen.getByLabelText(/select file/i), file);
    
    // Click import button
    await user.click(screen.getByRole('button', { name: /import/i }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/successfully imported 3 items/i)).toBeInTheDocument();
    });
    
    // Verify correct data format for upsert
    expect(supabase.from().upsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Imported Item 1', content: 'Content 1' }),
        expect.objectContaining({ title: 'Imported Item 2', content: 'Content 2' }),
        expect.objectContaining({ title: 'Imported Item 3', content: 'Content 3' })
      ])
    );
  });
  
  test('User can import JSON data', async () => {
    // Mock successful import
    supabase.from().upsert = jest.fn().mockResolvedValueOnce({
      data: { count: 2 },
      error: null
    });
    
    // Render component
    render(<DataImporter />);
    
    // Create JSON file
    const jsonContent = JSON.stringify([
      { title: 'JSON Item 1', content: 'JSON Content 1' },
      { title: 'JSON Item 2', content: 'JSON Content 2' }
    ]);
    const file = new File([jsonContent], 'import.json', { type: 'application/json' });
    
    // Upload file
    await user.upload(screen.getByLabelText(/select file/i), file);
    
    // Click import button
    await user.click(screen.getByRole('button', { name: /import/i }));
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/successfully imported 2 items/i)).toBeInTheDocument();
    });
  });
  
  test('validates file format', async () => {
    // Render component
    render(<DataImporter />);
    
    // Create invalid file
    const file = new File(['invalid content'], 'document.pdf', { type: 'application/pdf' });
    
    // Upload file
    await user.upload(screen.getByLabelText(/select file/i), file);
    
    // Verify error message
    expect(screen.getByText(/unsupported file format/i)).toBeInTheDocument();
    
    // Import button should be disabled
    expect(screen.getByRole('button', { name: /import/i })).toBeDisabled();
  });
  
  test('handles import errors', async () => {
    // Mock import error
    supabase.from().upsert = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Error importing data' }
    });
    
    // Render component
    render(<DataImporter />);
    
    // Create CSV file
    const csvContent = 'title,content\nImported Item 1,Content 1';
    const file = new File([csvContent], 'import.csv', { type: 'text/csv' });
    
    // Upload file
    await user.upload(screen.getByLabelText(/select file/i), file);
    
    // Click import button
    await user.click(screen.getByRole('button', { name: /import/i }));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText(/error importing data/i)).toBeInTheDocument();
    });
  });
  
  test('shows preview of data before import', async () => {
    // Render component
    render(<DataImporter />);
    
    // Create CSV file
    const csvContent = 'title,content\nPreview Item 1,Preview Content 1\nPreview Item 2,Preview Content 2';
    const file = new File([csvContent], 'preview.csv', { type: 'text/csv' });
    
    // Upload file
    await user.upload(screen.getByLabelText(/select file/i), file);
    
    // Wait for preview to load
    await waitFor(() => {
      expect(screen.getByText(/data preview/i)).toBeInTheDocument();
      expect(screen.getByText('Preview Item 1')).toBeInTheDocument();
      expect(screen.getByText('Preview Item 2')).toBeInTheDocument();
    });
  });
});
