// __tests__/auth/session/management.test.js

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionManager } from '../../../project/src/components/auth/SessionManager';
import { AuthProvider } from '../../../project/src/context/AuthContext';

// Import our standardized mock
jest.mock('../../../project/src/lib/supabase', () => require('../../__mocks__/supabase'));
import { supabase } from '../../../project/src/lib/supabase';

describe('Session Management', () => {
  let user;
  
  // Mock authenticated user
  const mockUser = {
    id: 'user-123',
    email: 'user@example.com',
    role: 'authenticated',
    created_at: '2023-01-01T00:00:00Z'
  };
  
  // Mock session data
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    user: mockUser
  };
  
  // Mock active sessions list
  const mockActiveSessions = [
    {
      id: 'session-1',
      created_at: '2023-06-15T10:00:00Z',
      last_active_at: '2023-06-15T14:30:00Z',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0.0.0',
      ip_address: '192.168.1.1',
      current: true
    },
    {
      id: 'session-2',
      created_at: '2023-06-10T09:15:00Z',
      last_active_at: '2023-06-14T16:45:00Z',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      ip_address: '192.168.1.2',
      current: false
    },
    {
      id: 'session-3',
      created_at: '2023-06-05T11:30:00Z',
      last_active_at: '2023-06-12T08:20:00Z',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      ip_address: '192.168.1.3',
      current: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock authentication state
    supabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });
    
    // Mock current session
    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null
    });
    
    // Mock active sessions list
    supabase.from().select.mockImplementation((table) => {
      if (table === 'user_sessions') {
        return {
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: mockActiveSessions,
            error: null
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
      };
    });
    
    // Mock session refresh
    supabase.auth.refreshSession.mockResolvedValue({
      data: { session: { ...mockSession, expires_at: Math.floor(Date.now() / 1000) + 3600 } },
      error: null
    });
    
    // Setup jest fake timers
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    // Restore real timers
    jest.useRealTimers();
  });

  test('Displays active sessions with device info', async () => {
    // Render session manager within auth context
    render(
      <AuthProvider>
        <SessionManager />
      </AuthProvider>
    );
    
    // Wait for sessions to load
    await waitFor(() => {
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });
    
    // Verify all sessions are displayed
    expect(screen.getByText(/current session/i)).toBeInTheDocument(); // For session-1
    expect(screen.getByText(/chrome/i)).toBeInTheDocument(); // From user agent
    expect(screen.getByText(/iphone/i)).toBeInTheDocument(); // From user agent
    expect(screen.getByText(/macintosh/i)).toBeInTheDocument(); // From user agent
    
    // Verify timestamps are formatted
    expect(screen.getByText(/june 15, 2023/i)).toBeInTheDocument(); // Creation date
    expect(screen.getByText(/last active/i)).toBeInTheDocument();
  });

  test('User can terminate other sessions', async () => {
    // Mock successful session termination
    supabase.rpc.mockImplementation((procedure, params) => {
      if (procedure === 'terminate_session') {
        return Promise.resolve({
          data: { success: true },
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    // Render session manager
    render(
      <AuthProvider>
        <SessionManager />
      </AuthProvider>
    );
    
    // Wait for sessions to load
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /terminate/i })).toHaveLength(2); // Two non-current sessions
    });
    
    // Get terminate buttons (skip the first one which is current session)
    const terminateButtons = screen.getAllByRole('button', { name: /terminate/i });
    
    // Click to terminate the second session
    await user.click(terminateButtons[0]);
    
    // Confirm termination
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify RPC was called with correct session ID
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('terminate_session', {
        session_id: 'session-2'
      });
    });
    
    // Verify success message
    expect(screen.getByText(/session terminated/i)).toBeInTheDocument();
  });

  test('User can terminate all other sessions', async () => {
    // Mock successful batch termination
    supabase.rpc.mockImplementation((procedure) => {
      if (procedure === 'terminate_all_other_sessions') {
        return Promise.resolve({
          data: { count: 2 }, // 2 sessions terminated
          error: null
        });
      }
      return Promise.resolve({ data: null, error: null });
    });

    // Render session manager
    render(
      <AuthProvider>
        <SessionManager />
      </AuthProvider>
    );
    
    // Wait for sessions to load
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /terminate all other sessions/i })).toBeInTheDocument();
    });
    
    // Click to terminate all other sessions
    await user.click(screen.getByRole('button', { name: /terminate all other sessions/i }));
    
    // Confirm termination
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    // Verify RPC was called to terminate all other sessions
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('terminate_all_other_sessions');
    });
    
    // Verify success message
    expect(screen.getByText(/2 sessions terminated/i)).toBeInTheDocument();
  });

  test('Session refreshes automatically before expiry', async () => {
    // Calculate expiry time 5 minutes from now
    const expiryTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes
    
    // Mock session with near expiry
    supabase.auth.getSession.mockReset();
    supabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          ...mockSession, 
          expires_at: expiryTime 
        } 
      },
      error: null
    });

    // Render session manager
    render(
      <AuthProvider>
        <SessionManager refreshThreshold={60} /> {/* Refresh when 60 seconds left */}
      </AuthProvider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });
    
    // Fast forward time to near expiry (4 minutes)
    act(() => {
      jest.advanceTimersByTime(240 * 1000); // 4 minutes
    });
    
    // Verify refresh was triggered
    await waitFor(() => {
      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });
    
    // Verify refresh success message
    expect(screen.getByText(/session refreshed/i)).toBeInTheDocument();
  });

  test('Session has correct inactivity timeout', async () => {
    // Mock session with inactivity timeout
    supabase.from().select.mockImplementation((table) => {
      if (table === 'user_settings') {
        return {
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { session_timeout_mins: 30 }, // 30 minute timeout
            error: null
          })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockActiveSessions,
          error: null
        })
      };
    });

    // Create a spy for document event listeners
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

    // Render session manager with inactivity monitoring
    render(
      <AuthProvider>
        <SessionManager monitorInactivity={true} />
      </AuthProvider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });
    
    // Verify that the inactivity listeners are set
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    
    // Fast forward time to simulate inactivity (29 minutes)
    act(() => {
      jest.advanceTimersByTime(29 * 60 * 1000);
    });
    
    // Session should still be active (timeout not reached)
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    
    // Fast forward additional time to cross the timeout threshold
    act(() => {
      jest.advanceTimersByTime(2 * 60 * 1000); // Additional 2 minutes
    });
    
    // Verify session was terminated due to inactivity
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
    
    // Clean up spies
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  test('Shows correct session expiry time and refreshes properly', async () => {
    // Create a function to format the expiry time as expected in the UI
    const formatExpiryTime = (expiryTimestamp) => {
      const expiryDate = new Date(expiryTimestamp * 1000);
      return expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    // Set expiry time 30 minutes from now
    const expiryTime = Math.floor(Date.now() / 1000) + 30 * 60;
    
    // Mock session with this expiry
    supabase.auth.getSession.mockReset();
    supabase.auth.getSession.mockResolvedValue({
      data: { 
        session: { 
          ...mockSession, 
          expires_at: expiryTime 
        } 
      },
      error: null
    });

    // Render session manager
    render(
      <AuthProvider>
        <SessionManager showExpiryTime={true} />
      </AuthProvider>
    );
    
    // Wait for component to load with expiry time
    await waitFor(() => {
      const expectedTimeText = new RegExp(`expires at ${formatExpiryTime(expiryTime)}`, 'i');
      expect(screen.getByText(expectedTimeText)).toBeInTheDocument();
    });
    
    // Click refresh button
    await user.click(screen.getByRole('button', { name: /refresh session/i }));
    
    // Verify session refresh was called
    expect(supabase.auth.refreshSession).toHaveBeenCalled();
    
    // Verify updated expiry time is displayed
    await waitFor(() => {
      const newExpiryTime = expiryTime + 3600; // After refresh, 1 hour later
      const newExpectedTimeText = new RegExp(`expires at ${formatExpiryTime(newExpiryTime)}`, 'i');
      expect(screen.getByText(newExpectedTimeText)).toBeInTheDocument();
    });
  });
  
  test('Handles session refresh failure', async () => {
    // Mock session refresh failure
    supabase.auth.refreshSession.mockReset();
    supabase.auth.refreshSession.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid refresh token' }
    });

    // Render session manager
    render(
      <AuthProvider>
        <SessionManager />
      </AuthProvider>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    });
    
    // Click refresh button
    await user.click(screen.getByRole('button', { name: /refresh session/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/invalid refresh token/i)).toBeInTheDocument();
    });
    
    // Verify sign out is suggested
    expect(screen.getByText(/please sign in again/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });
});
