import { Mock } from 'jest-mock';

// Type helper for Jest mock functions
export type JestMockFunction<TReturn, TArgs extends any[]> = jest.Mock<TReturn, TArgs>;

// Type helper for mocked promises
export type MockedPromise<T> = Promise<T> & {
  mockResolvedValue: (value: T) => void;
  mockRejectedValue: (error: Error) => void;
}; 