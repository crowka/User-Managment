/// <reference types="vitest" />
import '@testing-library/jest-dom';

interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R;
  toBeDisabled(): R;
  toBeVisible(): R;
  toHaveValue(value?: string | string[] | number): R;
  toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
  toBeChecked(): R;
  toBeEmpty(): R;
  toHaveAttribute(attr: string, value?: string | number | RegExp): R;
  toHaveClass(...classNames: string[]): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
} 