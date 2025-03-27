// File: __tests__/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../../project/src/components/profile/Profile';

// Import our standardized mock
jest.mock('../../project/src/lib/supabase', () => require('../__mocks__/supabase'));
import { supabase } from '../../project/src/lib/supabase';

// Mock data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

const mockProfile = {
  id: 'test-user-id',
  full_name: 'John Doe',
  website: 'https://example.com',
  avatar_url: 'https://example.com/avatar.jpg',
};

describe('Profile Component', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
    
    // Set up the mocks for this test suite
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    supabase.from().single.mockResolvedValue({ data: mockProfile, error: null });
    supabase.storage.from().getPublicUrl.mockReturnValue({ data: { publicUrl: mockProfile.avatar_url } });
  });

  test('renders profile form with user data', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByAltText(/avatar/i)).toHaveAttribute('src', mockProfile.avatar_url);
    });
  });

  test('handles profile update', async () => {
    const updatedProfile = {
      ...mockProfile,
      full_name: 'Jane Smith',
      website: 'https://updated-example.com',
    };

    supabase.from().upsert.mockResolvedValueOnce({
      data: updatedProfile,
      error: null,
    });

    render(<Profile />);

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
    const file = new File(['test'], 'test-avatar.jpg', { type: 'image/jpeg' });
    
    render(<Profile />);

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
    supabase.from().upsert.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to update profile' },
    });

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /update profile/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  test('handles avatar upload error', async () => {
    const file = new File(['test'], 'test-avatar.jpg', { type: 'image/jpeg' });
    
    // Mock storage upload error
    supabase.storage.from().upload.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to upload avatar' },
    });
    
    render(<Profile />);

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
