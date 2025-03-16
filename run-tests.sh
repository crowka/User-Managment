#!/bin/bash

# Run tests with coverage
echo "Running tests with coverage..."
npm run test:coverage

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
  echo "Coverage report available at: ./coverage/lcov-report/index.html"
else
  echo "❌ Tests failed. Please fix the issues before proceeding."
  exit 1
fi 