import '@testing-library/jest-dom';

declare module '@testing-library/jest-dom' {
  export interface Matchers<R = unknown> {
    toBeInTheDocument(): R;
    toBeDisabled(): R;
    toBeEnabled(): R;
    toBeEmpty(): R;
    toBeEmptyDOMElement(): R;
    toBeInvalid(): R;
    toBeRequired(): R;
    toBeValid(): R;
    toBeVisible(): R;
    toContainElement(element: HTMLElement | null): R;
    toContainHTML(html: string): R;
    toHaveAttribute(attr: string, value?: string | number | RegExp): R;
    toHaveClass(...classNames: string[]): R;
    toHaveFocus(): R;
    toHaveFormValues(expectedValues: { [key: string]: any }): R;
    toHaveStyle(css: string | object): R;
    toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): R;
    toHaveValue(value?: string | string[] | number): R;
    toBeChecked(): R;
    toBePartiallyChecked(): R;
    toHaveDescription(text?: string | RegExp): R;
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R;
    toHaveErrorMessage(text?: string | RegExp): R;
  }
} 