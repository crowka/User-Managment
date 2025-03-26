import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileEditor } from '../../project/src/components/profile/ProfileEditor';
import { useProfileStore } from '../../project/src/lib/stores/profile.store';

// Mock the profile store
vi.mock('@/lib/stores/profile.store', () => ({
  useProfileStore: vi.fn()
}));

describe('ProfileEditor', () => {
  beforeEach(() => {
    // Setup default mocks
    (useProfileStore as any).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com',
        bio: 'Test bio',
        location: 'Test location',
        website: 'https://example.com',
        avatarUrl: null
      },
      isLoading: false,
      error: null,
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      removeAvatar: vi.fn(),
      clearError: vi.fn()
    });
  });

  it('renders the profile form correctly', () => {
    render(<ProfileEditor />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    
    // Check if the avatar section is rendered
    expect(screen.getByText(/change avatar/i)).toBeInTheDocument();
  });

  it('submits the form with correct data', async () => {
    const mockUpdateProfile = vi.fn().mockResolvedValue({});
    (useProfileStore as any).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com'
      },
      isLoading: false,
      error: null,
      updateProfile: mockUpdateProfile,
      uploadAvatar: vi.fn(),
      removeAvatar: vi.fn(),
      clearError: vi.fn()
    });

    render(<ProfileEditor />);
    
    // Fill form data
    fireEvent.change(screen.getByLabelText(/name/i), { 
      target: { value: 'New Name' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText(/save profile/i));
    
    // Check if updateProfile was called with correct data
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          email: 'test@example.com'
        })
      );
    });
  });

  it('shows loading state during form submission', () => {
    (useProfileStore as any).mockReturnValue({
      profile: {
        name: 'Test User',
        email: 'test@example.com'
      },
      isLoading: true,
      error: null,
      updateProfile: vi.fn(),
      uploadAvatar: vi.fn(),
      removeAvatar: vi.fn(),
      clearError: vi.fn()
    });

    render(<ProfileEditor />);
    
    // Check if the submit button is disabled
    expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/saving\.\.\./i)).toBeDisabled();
  });
});
