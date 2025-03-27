// __tests__/utils/hook-testing-utils.js

import { renderHook, act } from '@testing-library/react';
import React from 'react';

/**
 * Creates a wrapper component with provided context providers
 * @param {Object} providers - Object with provider components and their props
 * @returns {Function} Wrapper component for renderHook
 */
export function createWrapper(providers = {}) {
  return ({ children }) => {
    // Wrap children in each provider
    return Object.entries(providers).reduce((wrapped, [Provider, props]) => {
      const ProviderComponent = Provider;
      return <ProviderComponent {...props}>{wrapped}</ProviderComponent>;
    }, children);
  };
}

/**
 * Renders a hook with convenient helpers for testing
 * @param {Function} hook - The hook to test
 * @param {Object} options - Options for renderHook
 * @returns {Object} Enhanced result object
 */
export function renderCustomHook(hook, options = {}) {
  const {
    providers = {},
    initialProps,
    ...renderOptions
  } = options;

  // Create wrapper with providers
  const wrapper = createWrapper(providers);
  
  // Render the hook
  const result = renderHook(hook, {
    wrapper,
    initialProps,
    ...renderOptions
  });
  
  return {
    ...result,
    /**
     * Updates hook state with an action
     * @param {Function} action - Function that updates hook state
     * @returns {Promise<void>}
     */
    act: async (action) => {
      await act(async () => {
        await action(result.result.current);
      });
    },
    
    /**
     * Updates hook props
     * @param {Object} props - New props
     */
    updateProps: (props) => {
      result.rerender(props);
    },
    
    /**
     * Gets current hook state
     * @returns {any} Current hook state
     */
    getState: () => result.result.current
  };
}

/**
 * Creates a mock for useState hook
 * @param {any} initialValue - Initial state value
 * @returns {Array} Mock useState hook
 */
export function createMockState(initialValue) {
  let state = initialValue;
  const setState = jest.fn().mockImplementation((newValue) => {
    if (typeof newValue === 'function') {
      state = newValue(state);
    } else {
      state = newValue;
    }
  });
  
  return [state, setState];
}

/**
 * Creates a mock for useContext hook
 * @param {any} contextValue - Value to return from useContext
 * @returns {Function} Mock useContext hook
 */
export function createMockContext(contextValue) {
  return jest.fn().mockReturnValue(contextValue);
}

/**
 * Creates a mock for useRef hook
 * @param {any} initialValue - Initial ref value
 * @returns {Object} Mock ref object
 */
export function createMockRef(initialValue) {
  return { current: initialValue };
}

/**
 * Tests a hook's effect cleanups
 * @param {Function} hook - The hook to test
 * @param {Array} deps - Dependencies to change
 * @param {Function} mockCleanup - Mock function to track cleanup
 * @returns {Object} Test results
 */
export function testHookCleanup(hook, deps = [], mockCleanup = jest.fn()) {
  // Mock useEffect to track cleanup
  const originalUseEffect = React.useEffect;
  React.useEffect = jest.fn().mockImplementation((callback, effectDeps) => {
    const cleanup = callback();
    if (typeof cleanup === 'function') {
      mockCleanup.mockImplementation(cleanup);
    }
  });
  
  // Render the hook
  const { result, rerender, unmount } = renderHook(hook, {
    initialProps: deps[0]
  });
  
  // Re-render with new deps to trigger cleanup
  if (deps.length > 1) {
    rerender(deps[1]);
  }
  
  // Restore original useEffect
  React.useEffect = originalUseEffect;
  
  return {
    result,
    cleanup: mockCleanup,
    unmount
  };
}
