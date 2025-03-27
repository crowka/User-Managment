// __tests__/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Profile } from '../../project/src/components/profile/Profile';

// Import our utility functions
import { setupTestEnvironment, mockNextRouter } from '../utils/environment-setup';
import { renderWithProviders, createMockFile } from '../utils/component-testing-utils';
import { createMockUser, createMockProfile, mockStorage } from '../utils/testing-utils';

// Import and use our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

describe('Profile Component', () => {
  // Setup test environment and router
  let cleanup;
  let router;
  
  beforeAll(() => {
    cleanup = setupTestEnvironment();
    router = mockNextRouter();
  });
  
  afterAll(() => {
    if (cleanup) cleanup();
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Create mock user and profile data
  const mockUser = createMockUser();
  const mockProfileData = createMockProfile({
    id: mockUser.id,
    full_name: 'John Doe',
    website: 'https://example.com',
    avatar_url: 'https://example.com/avatar.jpg'
  });

  test('renders profile form with user data', async () => {
    // Setup authentication and profile data mocks
    supabase.auth.getUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    supabase.from().single.mockResolvedValue({ 
      data: mockProfileData, 
      error: null 
    });
    
    // Setup storage mocks
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Render with our utility
    const { user } = renderWithProviders(<Profile />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', mockProfileData.avatar_url);
    });
  });

  test('handles profile update', async () => {
    // Setup initial data
    supabase.auth.getUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    supabase.from().single.mockResolvedValue({ 
      data: mockProfileData, 
      error: null 
    });
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Setup update mock
    const updatedProfile = {
      ...mockProfileData,
      full_name: 'Jane Smith',
      website: 'https://updated-example.com',
    };

    supabase.from().upsert.mockResolvedValueOnce({
      data: updatedProfile,
      error: null,
    });

    // Render component
    const { user } = renderWithProviders(<Profile />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Update form fields
    await user.clear(screen.getByLabelText(/full name/i));
    await user.type(screen.getByLabelText(/full name/i), updatedProfile.full_name);
    await user.clear(screen.getByLabelText(/website/i));
    await user.type(screen.getByLabelText(/website/i), updatedProfile.website);

    // Submit form
    await user.click(screen.getByRole('button', { name: /update profile/i }));

    // Verify update was called with correct data
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from().upsert).toHaveBeenCalledWith({
        id: mockUser.id,
        full_name: updatedProfile.full_name,
        website: updatedProfile.website,
      });
    });
  });

  test('handles avatar upload', async () => {
    // Setup initial data
    supabase.auth.getUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    supabase.from().single.mockResolvedValue({ 
      data: mockProfileData, 
      error: null 
    });
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } },
      upload: { data: { path: `${mockUser.id}/avatar.jpg` }, error: null }
    });

    // Create a mock file using our utility
    const file = createMockFile('test-avatar.jpg', 'image/jpeg', 1024);
    
    // Render component
    const { user } = renderWithProviders(<Profile />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });

    // Find the file input and upload a file
    const input = screen.getByLabelText(/upload avatar/i);
    await user.upload(input, file);

    await waitFor(() => {
      expect(supabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(supabase.storage.from().upload).toHaveBeenCalledWith(
        `${mockUser.id}/avatar.jpg`,
        file,
        { upsert: true }
      );
    });
  });

  test('displays error message on update failure', async () => {
    // Setup initial data
    supabase.auth.getUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    supabase.from().single.mockResolvedValue({ 
      data: mockProfileData, 
      error: null 
    });
    
    // Mock storage
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } }
    });

    // Mock update error
    supabase.from().upsert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to update profile' },
    });

    // Render component
    const { user } = renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    // Submit form without changes
    await user.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  test('handles avatar upload error', async () => {
    // Setup initial data
    supabase.auth.getUser.mockResolvedValue({ 
      data: { user: mockUser }, 
      error: null 
    });
    
    supabase.from().single.mockResolvedValue({ 
      data: mockProfileData, 
      error: null 
    });
    
    // Mock storage with upload error
    mockStorage('avatars', {
      getPublicUrl: { data: { publicUrl: mockProfileData.avatar_url } },
      upload: { data: null, error: { message: 'Failed to upload avatar' } }
    });
    
    // Create a mock file
    const file = createMockFile('test-avatar.jpg');
    
    // Render component
    const { user } = renderWithProviders(<Profile />);

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByAltText(/avatar/i)).toBeInTheDocument();
    });

    // Find the file input and upload a file
    const input = screen.getByLabelText(/upload avatar/i);
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/failed to upload avatar/i)).toBeInTheDocument();
    });
  });
});
