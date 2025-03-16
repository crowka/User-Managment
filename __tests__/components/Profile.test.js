import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Profile } from '../../project/src/components/profile/Profile';
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

// Mock Supabase client
jest.mock('../../project/src/lib/supabase', () => ({
  supabase: {
    auth: {
      user: () => mockUser,
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: { path: 'avatar.jpg' }, error: null }),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: mockProfile.avatar_url } })),
      })),
    },
  },
}));

describe('Profile Component', () => {
  let user;

  beforeEach(() => {
    jest.clearAllMocks();
    user = userEvent.setup();
  });

  test('renders profile form with user data', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /avatar/i })).toHaveAttribute('src', mockProfile.avatar_url);
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
}); 