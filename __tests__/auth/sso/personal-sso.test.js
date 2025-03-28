// __tests__/auth/sso/personal-sso.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SSOAuth } from '../../../project/src/components/auth/SSOAuth';

// Import our standardized mock
jest.mock('../../../project/src/lib/supabase', () => require('../../__mocks__/supabase'));
import { supabase } from '../../../project/src/lib/supabase';

// Mock window.location for redirects
const mockWindowLocation = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    assign: mockWindowLocation,
    origin: 'https://app.example.com'
  },
  writable: true
});

describe('Personal SSO Authentication Flows', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Mock auth state
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });
  });

  test('User can sign in with GitHub', async () => {
    // Mock successful GitHub auth
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'github', url: 'https://supabase-auth.io/github-redirect' },
      error: null
    });

    // Render SSO auth component
    render(<SSOAuth />);
    
    // Click GitHub button
    await user.click(screen.getByRole('button', { name: /github/i }));
    
    // Verify Supabase auth method was called with correct params
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining(window.location.origin)
      })
    });
    
    // Verify user is redirected to GitHub auth URL
    expect(mockWindowLocation).toHaveBeenCalledWith('https://supabase-auth.io/github-redirect');
  });

  test('User can sign in with Google', async () => {
    // Mock successful Google auth
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://supabase-auth.io/google-redirect' },
      error: null
    });

    // Render SSO auth component
    render(<SSOAuth />);
    
    // Click Google button
    await user.click(screen.getByRole('button', { name: /google/i }));
    
    // Verify Supabase auth method was called
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining(window.location.origin)
      })
    });
    
    // Verify user is redirected to Google auth URL
    expect(mockWindowLocation).toHaveBeenCalledWith('https://supabase-auth.io/google-redirect');
  });

  test('Handles SSO error gracefully', async () => {
    // Mock auth error
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: null,
      error: { message: 'Authentication failed' }
    });

    // Render SSO auth component
    render(<SSOAuth />);
    
    // Click Facebook button
    await user.click(screen.getByRole('button', { name: /facebook/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
    });
    
    // Verify no redirect happened
    expect(mockWindowLocation).not.toHaveBeenCalled();
  });

  test('User can authenticate with Apple', async () => {
    // Mock successful Apple auth
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'apple', url: 'https://supabase-auth.io/apple-redirect' },
      error: null
    });

    // Render SSO auth component
    render(<SSOAuth />);
    
    // Click Apple button
    await user.click(screen.getByRole('button', { name: /apple/i }));
    
    // Verify Supabase auth method was called
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'apple',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining(window.location.origin)
      })
    });
    
    // Verify user is redirected to Apple auth URL
    expect(mockWindowLocation).toHaveBeenCalledWith('https://supabase-auth.io/apple-redirect');
  });

  test('SSO auth with scopes and additional options', async () => {
    // Mock successful GitHub auth with scopes
    supabase.auth.signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'github', url: 'https://supabase-auth.io/github-redirect' },
      error: null
    });

    // Render SSO auth component with extra scopes
    render(<SSOAuth providerScopes={{ github: 'repo,user' }} />);
    
    // Click GitHub button
    await user.click(screen.getByRole('button', { name: /github/i }));
    
    // Verify Supabase auth method was called with correct scopes
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: expect.objectContaining({
        scopes: 'repo,user'
      })
    });
  });

  test('Handles SSO callback URL parameters correctly', async () => {
    // Mock window.location with hash parameters from SSO callback
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://app.example.com',
        hash: '#access_token=test-token&provider=github&type=sso',
        href: 'https://app.example.com/auth/callback#access_token=test-token&provider=github&type=sso'
      },
      writable: true
    });
    
    // Mock successful token exchange
    supabase.auth.getSession.mockResolvedValueOnce({
      data: { 
        session: { 
          access_token: 'test-token',
          user: { id: 'user-123', email: 'user@example.com' } 
        }
      },
      error: null
    });
    
    // Render SSO auth component with callback detection
    render(<SSOAuth detectCallback={true} />);
    
    // Verify session check was performed
    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
    
    // Verify successful login detection
    expect(screen.getByText(/successfully authenticated/i)).toBeInTheDocument();
    
    // Clean up
    Object.defineProperty(window, 'location', {
      value: {
        assign: mockWindowLocation,
        origin: 'https://app.example.com',
        hash: '',
        href: 'https://app.example.com/auth'
      },
      writable: true
    });
  });
});
