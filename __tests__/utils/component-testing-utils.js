// __tests__/utils/component-testing-utils.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { supabase } from '../../lib/supabase';

/**
 * Creates a mock user event setup
 * @returns {Object} Configured user event instance
 */
export function createUserEvent() {
  return userEvent.setup();
}

/**
 * Sets up authentication mocks for component testing
 * @param {Object} user - User object to return (null for unauthenticated)
 * @param {boolean} loading - Whether auth should appear to be loading
 */
export function mockAuthState(user = null, loading = false) {
  // Mock getUser
  if (user) {
    supabase.auth.getUser.mockResolvedValue({
      data: { user },
      error: null
    });
  } else {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });
  }

  // Set up auth state change mock to allow triggering auth state changes in tests
  const listeners = [];
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    listeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: jest.fn().mockImplementation(() => {
            const index = listeners.indexOf(callback);
            if (index > -1) {
              listeners.splice(index, 1);
            }
          })
        }
      }
    };
  });

  // Return function to trigger auth state changes
  return {
    triggerAuthChange: (event, session) => {
      listeners.forEach(callback => callback(event, session));
    }
  };
}

/**
 * Custom render function with common providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Additional render options
 * @returns {Object} Object containing standard render results plus custom additions
 */
export function renderWithProviders(ui, options = {}) {
  const {
    route = '/',
    authUser = null,
    ...renderOptions
  } = options;

  // Set up auth mocks if user is provided
  const authControls = mockAuthState(authUser);

  // Create a wrapper with any providers needed
  const Wrapper = ({ children }) => {
    return children;
  };

  // Render with wrapper
  const result = render(ui, {
    wrapper: Wrapper,
    ...renderOptions
  });

  // Return render result with added helpers
  return {
    ...result,
    user: createUserEvent(),
    rerender: (ui, options = {}) => renderWithProviders(ui, { ...options, container: result.container }),
    ...authControls
  };
}

/**
 * Waits for loading state to finish
 * @returns {Promise<void>}
 */
export async function waitForLoadingToFinish() {
  return waitFor(
    () => {
      const loaders = [
        ...screen.queryAllByRole('progressbar'),
        ...screen.queryAllByText(/loading/i),
        ...screen.queryAllByLabelText(/loading/i)
      ];
      
      if (loaders.length > 0) {
        throw new Error('Still loading');
      }
    },
    { timeout: 4000 }
  );
}

/**
 * Mocks fetching a profile for a user
 * @param {string} userId - User ID to fetch profile for
 * @param {Object} profile - Profile data to return
 * @param {Object|null} error - Optional error to return
 */
export function mockProfileFetch(userId, profile, error = null) {
  const mockResponse = { data: profile, error };
  
  // Set up the chain of mocks
  supabase.from.mockImplementation((table) => {
    if (table === 'profiles') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockImplementation((field, value) => {
          if (field === 'id' && value === userId) {
            return {
              single: jest.fn().mockResolvedValue(mockResponse)
            };
          }
          return { single: jest.fn().mockResolvedValue({ data: null, error: null }) };
        })
      };
    }
    return { select: jest.fn().mockReturnThis() };
  });
}

/**
 * Creates a mock file for testing file uploads
 * @param {string} name - File name
 * @param {string} type - MIME type
 * @param {number} size - File size in bytes
 * @returns {File} Mock file object
 */
export function createMockFile(name = 'test.jpg', type = 'image/jpeg', size = 1024) {
  const file = new File(['test file content'], name, { type });
  
  // Mock file size and lastModified
  Object.defineProperty(file, 'size', {
    get() { return size; }
  });
  Object.defineProperty(file, 'lastModified', {
    get() { return Date.now(); }
  });
  
  return file;
}

/**
 * Finds a form element by its label text
 * @param {string} labelText - Text of the label
 * @returns {HTMLElement} Form element
 */
export function getFormElementByLabel(labelText) {
  return screen.getByLabelText(new RegExp(labelText, 'i'));
}

/**
 * Fills a form with the provided data
 * @param {Object} formData - Object with label text as keys and values to enter
 * @param {Object} userEventInstance - User event instance
 */
export async function fillForm(formData, userEventInstance) {
  for (const [label, value] of Object.entries(formData)) {
    const element = getFormElementByLabel(label);
    await userEventInstance.clear(element);
    await userEventInstance.type(element, value);
  }
}
