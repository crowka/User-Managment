/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/project/src/$1',
    '^@components/(.*)$': '<rootDir>/project/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/project/src/lib/$1',
    '^@utils/(.*)$': '<rootDir>/project/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/project/src/hooks/$1',
    '^@stores/(.*)$': '<rootDir>/project/src/stores/$1',
    '^@types/(.*)$': '<rootDir>/project/src/types/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic'
          }
        }
      }
    }]
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).[jt]s?(x)'
  ],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json'
    }
  }
};

export default config; 