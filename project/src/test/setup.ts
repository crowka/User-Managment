import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, afterEach, afterAll, beforeAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import React from 'react';

// Extend Vitest's expect with testing-library matchers
expect.extend(matchers);

// Configure React for testing
vi.stubGlobal('React', React);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup MSW server
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: vi.fn(({ children, ...props }) => {
    return React.createElement('button', props, children);
  })
}));

vi.mock('@/components/ui/label', () => ({
  Label: vi.fn(({ children, ...props }) => {
    return React.createElement('label', props, children);
  })
}));

vi.mock('@/components/ui/input', () => ({
  Input: vi.fn((props) => {
    return React.createElement('input', props);
  })
}));

vi.mock('@/components/ui/checkbox', () => ({
  Checkbox: vi.fn((props) => {
    return React.createElement('input', { type: 'checkbox', ...props });
  })
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: vi.fn(({ children, ...props }) => {
    return React.createElement('div', { role: 'alert', ...props }, children);
  })
}));

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    query: {},
  }),
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', { ...props, alt: props.alt || '' });
  },
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}); 