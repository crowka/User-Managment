// File: __tests__/components/ProfileEditor.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileEditor } from '../../project/src/components/profile/ProfileEditor';
import { useProfileStore } from '../../project/src/lib/stores/profile.store';

// Mock the profile store
jest.mock('../../project/src/lib/stores/profile.store', () => ({
  useProfileStore: jest.fn()
}));

describe('ProfileEditor', () => {
  let user;

  beforeEach(() => {
    // Setup default mocks
    jest.clearAllMocks();
    user = userEvent.setup();
    
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      fetchProfile: jest.fn(),
      updateProfile: jest.fn().mockResolvedValue({}),
      uploadAvatar: jest.fn().mockResolvedValue({}),
      removeAvatar: jest.fn().mockResolvedValue({}),
      clearError: jest.fn()
    });
  });

  test('renders the profile form correctly', async () => {
    render(<ProfileEditor />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    
    // Check if the avatar section is rendered
    expect(screen.getByAltText(/profile avatar/i)).toBeInTheDocument();
    expect(screen.getByText(/change avatar/i)).toBeInTheDocument();
  });

  test('submits the form with correct data', async () => {
    const mockUpdateProfile = jest.fn().mockResolvedValue({});
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Fill form data
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), 'New Name');
    
    await user.clear(screen.getByLabelText(/bio/i));
    await user.type(screen.getByLabelText(/bio/i), 'Updated bio');
    
    // Submit the form
    await user.click(screen.getByRole('button', { name: /save profile/i }));
    
    // Check if updateProfile was called with correct data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          email: 'test@example.com',
          bio: 'Updated bio',
        })
      );
    });
  });

  test('shows loading state during form submission', async () => {
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com'
      },
      isLoading: true,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Check if the submit button is disabled
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });

  test('handles profile update error', async () => {
    const mockUpdateProfile = jest.fn().mockRejectedValue(new Error('Failed to update profile'));
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
      },
      isLoading: false,
      error: 'Failed to update profile',
      updateProfile: mockUpdateProfile,
      uploadAvatar: jest.fn(),
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Check if error message is displayed
    expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
  });

  test('handles avatar upload', async () => {
    const mockUploadAvatar = jest.fn().mockResolvedValue({
      avatarUrl: 'https://example.com/new-avatar.jpg'
    });
    
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: mockUploadAvatar,
      removeAvatar: jest.fn(),
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Create a mock file
    const file = new File(['test'], 'new-avatar.jpg', { type: 'image/jpeg' });
    
    // Find file input and upload file
    const fileInput = screen.getByLabelText(/upload new avatar/i);
    await user.upload(fileInput, file);
    
    // Check if uploadAvatar was called with the file
    await waitFor(() => {
      expect(mockUploadAvatar).toHaveBeenCalledWith(file);
    });
  });

  test('handles avatar removal', async () => {
    const mockRemoveAvatar = jest.fn().mockResolvedValue({});
    
    (useProfileStore as jest.Mock).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.jpg'
      },
      isLoading: false,
      error: null,
      updateProfile: jest.fn(),
      uploadAvatar: jest.fn(),
      removeAvatar: mockRemoveAvatar,
      clearError: jest.fn()
    });

    render(<ProfileEditor />);
    
    // Click remove avatar button
    await user.click(screen.getByRole('button', { name: /remove avatar/i }));
    
    // Check if removeAvatar was called
    await waitFor(() => {
      expect(mockRemoveAvatar).toHaveBeenCalled();
    });
  });
});
