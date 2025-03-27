// __tests__/utils/store-testing-utils.js

import { act } from '@testing-library/react';

/**
 * Creates a testing wrapper around a Zustand store
 * @param {Function} useStore - The store hook to test
 * @returns {Object} Store wrapper with helpers for testing
 */
export function createStoreWrapper(useStore) {
  // Get the initial state
  const initialState = useStore.getState();
  
  // Store for tracking subscription callbacks
  const storeCallbacks = new Set();
  
  // Subscribe to store changes immediately to keep track of state
  const unsubscribe = useStore.subscribe((state) => {
    storeCallbacks.forEach(callback => callback(state));
  });
  
  // Create a wrapper for testing
  const wrapper = {
    /**
     * Get the current state of the store
     * @returns {Object} Current store state
     */
    getState: () => useStore.getState(),
    
    /**
     * Subscribes to store changes
     * @param {Function} callback - Function to call when store changes
     * @returns {Function} Unsubscribe function
     */
    subscribe: (callback) => {
      storeCallbacks.add(callback);
      return () => storeCallbacks.delete(callback);
    },
    
    /**
     * Resets the store to initial state
     */
    reset: () => {
      act(() => {
        useStore.setState(initialState, true);
      });
    },
    
    /**
     * Sets the store state (partial or complete)
     * @param {Object} state - State to set
     * @param {boolean} replace - Whether to replace the entire state
     */
    setState: (state, replace = false) => {
      act(() => {
        useStore.setState(state, replace);
      });
    },
    
    /**
     * Executes a store action and waits for it to complete
     * @param {Function} action - Function that calls store actions
     * @returns {Promise<void>} Promise that resolves when action completes
     */
    runAction: async (action) => {
      await act(async () => {
        await action(useStore.getState());
      });
    },
    
    /**
     * Cleanup function to call when done testing
     */
    cleanup: () => {
      storeCallbacks.clear();
      unsubscribe();
      wrapper.reset();
    }
  };
  
  return wrapper;
}

/**
 * Creates a mock for async dependencies used in a store
 * @param {Object} dependencies - Object mapping dependency names to mock implementations
 * @returns {Object} Mocked dependencies
 */
export function createStoreDependencyMocks(dependencies) {
  const mocks = {};
  
  for (const [name, implementation] of Object.entries(dependencies)) {
    // If the implementation is a function, create a Jest mock for it
    if (typeof implementation === 'function') {
      mocks[name] = jest.fn().mockImplementation(implementation);
    } 
    // If it's an object, create mock functions for each method
    else if (typeof implementation === 'object' && implementation !== null) {
      mocks[name] = {};
      
      for (const [methodName, methodImpl] of Object.entries(implementation)) {
        if (typeof methodImpl === 'function') {
          mocks[name][methodName] = jest.fn().mockImplementation(methodImpl);
        } else {
          mocks[name][methodName] = methodImpl;
        }
      }
    }
    // Otherwise just use the value directly
    else {
      mocks[name] = implementation;
    }
  }
  
  return mocks;
}

/**
 * Tests a Zustand store action
 * @param {Object} options - Test options
 * @param {Function} options.store - The store hook to test
 * @param {Function} options.action - Function to call on the store
 * @param {Object} options.initialState - Initial state to set before action
 * @param {Function} options.assert - Function to assert on the final state
 * @returns {Promise<Object>} Final state after action
 */
export async function testStoreAction({ store, action, initialState, assert }) {
  const wrapper = createStoreWrapper(store);
  
  // Set initial state if provided
  if (initialState) {
    wrapper.setState(initialState);
  }
  
  // Initial state for comparison
  const stateBefore = wrapper.getState();
  
  // Run the action
  await wrapper.runAction(state => {
    if (typeof action === 'string') {
      // If action is a string, assume it's a method on the store
      return state[action]();
    } else if (typeof action === 'function') {
      // If action is a function, call it with the state
      return action(state);
    }
  });
  
  // Get final state
  const stateAfter = wrapper.getState();
  
  // Run assertions if provided
  if (assert) {
    assert(stateAfter, stateBefore);
  }
  
  // Clean up
  wrapper.cleanup();
  
  return stateAfter;
}
