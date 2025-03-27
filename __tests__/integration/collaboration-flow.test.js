// __tests__/integration/collaboration-flow.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollaborationWorkspace } from '../../project/src/components/collaboration/CollaborationWorkspace';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Collaboration Features Flow', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'user@example.com' } },
      error: null
    });
    
    // Mock document data
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'doc-123',
        title: 'Shared Document',
        content: 'Initial document content',
        owner_id: 'owner-456',
        created_at: '2023-06-15T10:30:00Z',
        updated_at: '2023-06-15T10:30:00Z',
        collaborators: [
          { id: 'user-123', name: 'Current User', role: 'editor' },
          { id: 'user-456', name: 'Jane Smith', role: 'viewer' },
          { id: 'user-789', name: 'Bob Johnson', role: 'editor' }
        ]
      },
      error: null
    });
    
    // Mock realtime subscription
    supabase.channel = jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockResolvedValue({})
    });
  });

  test('User can view and update shared document', async () => {
    // Render collaboration workspace
    render(<CollaborationWorkspace documentId="doc-123" />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Shared Document')).toBeInTheDocument();
      expect(screen.getByDisplayValue(/initial document content/i)).toBeInTheDocument();
    });
    
    // Edit document
    const contentArea = screen.getByRole('textbox');
    await user.clear(contentArea);
    await user.type(contentArea, 'Updated document content');
    
    // Mock successful update
    supabase.from().update.mockResolvedValueOnce({
      data: {
        id: 'doc-123',
        content: 'Updated document content',
        updated_at: '2023-06-15T11:00:00Z'
      },
      error: null
    });
    
    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify update was called with correct data
    expect(supabase.from().update).toHaveBeenCalledWith({
      content: 'Updated document content',
      updated_at: expect.any(String)
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
    });
  });
  
  test('Shows list of current collaborators', async () => {
    // Render collaboration workspace
    render(<CollaborationWorkspace documentId="doc-123" />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Shared Document')).toBeInTheDocument();
    });
    
    // Open collaborators panel
    await user.click(screen.getByRole('button', { name: /collaborators/i }));
    
    // Verify collaborators are displayed
    expect(screen.getByText('Current User (You)')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    
    // Verify roles are displayed
    expect(screen.getAllByText(/editor/i)).toHaveLength(2);
    expect(screen.getByText(/viewer/i)).toBeInTheDocument();
  });
  
  test('User can add new collaborators', async () => {
    // Render collaboration workspace
    render(<CollaborationWorkspace documentId="doc-123" />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Shared Document')).toBeInTheDocument();
    });
    
    // Open collaborators panel
    await user.click(screen.getByRole('button', { name: /collaborators/i }));
    
    // Click add collaborator button
    await user.click(screen.getByRole('button', { name: /add collaborator/i }));
    
    // Mock user search
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: [
        { id: 'new-user-1', email: 'newuser@example.com', name: 'New User' },
        { id: 'new-user-2', email: 'another@example.com', name: 'Another User' }
      ],
      error: null
    });
    
    // Type email to search
    await user.type(screen.getByLabelText(/search users/i), 'new');
    
    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('New User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });
    
    // Select user
    await user.click(screen.getByText('New User'));
    
    // Select role
    await user.click(screen.getByLabelText(/select role/i));
    await user.click(screen.getByText(/editor/i));
    
    // Mock successful addition
    supabase.rpc = jest.fn().mockResolvedValueOnce({
      data: { success: true },
      error: null
    });
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /invite/i }));
    
    // Verify RPC call was made with correct parameters
    expect(supabase.rpc).toHaveBeenCalledWith('add_document_collaborator', {
      document_id: 'doc-123',
      user_id: 'new-user-1',
      role: 'editor'
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/invitation sent/i)).toBeInTheDocument();
    });
  });
  
  test('Notifications appear when other users make changes', async () => {
    // Setup realtime channel mock to simulate updates
    const channelMock = {
      on: jest.fn().mockImplementation((event, callback) => {
        // Store callback to trigger it later
        channelMock.callbacks = channelMock.callbacks || {};
        channelMock.callbacks[event] = callback;
        return channelMock;
      }),
      subscribe: jest.fn().mockResolvedValue({})
    };
    
    supabase.channel.mockReturnValue(channelMock);
    
    // Render collaboration workspace
    render(<CollaborationWorkspace documentId="doc-123" />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Shared Document')).toBeInTheDocument();
    });
    
    // Verify channel was set up
    expect(supabase.channel).toHaveBeenCalledWith(`document_updates:doc-123`);
    
    // Simulate another user making changes
    const updatePayload = {
      new: {
        id: 'doc-123',
        content: 'Content updated by another user',
        updated_at: '2023-06-15T11:30:00Z',
        updated_by: {
          id: 'user-789',
          name: 'Bob Johnson'
        }
      }
    };
    
    // Trigger the update event callback
    channelMock.callbacks['UPDATE'](updatePayload);
    
    // Verify notification appeared
    await waitFor(() => {
      expect(screen.getByText(/bob johnson made changes/i)).toBeInTheDocument();
    });
    
    // Verify content was updated
    expect(screen.getByDisplayValue(/content updated by another user/i)).toBeInTheDocument();
  });
  
  test('Shows presence indicators for active collaborators', async () => {
    // Setup realtime channel mock for presence
    const presenceMock = {
      on: jest.fn().mockImplementation((event, callback) => {
        presenceMock.callbacks = presenceMock.callbacks || {};
        presenceMock.callbacks[event] = callback;
        return presenceMock;
      }),
      subscribe: jest.fn().mockResolvedValue({})
    };
    
    supabase.channel.mockReturnValue(presenceMock);
    
    // Render collaboration workspace
    render(<CollaborationWorkspace documentId="doc-123" />);
    
    // Wait for document to load
    await waitFor(() => {
      expect(screen.getByText('Shared Document')).toBeInTheDocument();
    });
    
    // Open collaborators panel
    await user.click(screen.getByRole('button', { name: /collaborators/i }));
    
    // Simulate presence sync event
    const presenceState = {
      'user-789': {
        id: 'user-789',
        name: 'Bob Johnson',
        online_at: new Date().toISOString(),
        cursor_position: { line: 5, column: 10 }
      }
    };
    
    // Trigger presence event
    presenceMock.callbacks['sync'](presenceState);
    
    // Verify presence indicators
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
      expect(screen.getByTestId('status-user-789')).toHaveClass('status-online');
    });
    
    // Simulate user leaving
    const newPresenceState = {};
    presenceMock.callbacks['sync'](newPresenceState);
    
    // Verify user is now shown as offline
    await waitFor(() => {
      expect(screen.getByTestId('status-user-789')).toHaveClass('status-offline');
    });
  });
  
  test('User can change collaborator permissions', async () => {
    // Render collaboration workspace with owner permissions
    supabase.from().select.mockReset();
    supabase.from().select.mockResolvedValueOnce({
      data: {
        id: 'doc-123',
        title: 'Shared Do
