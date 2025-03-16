#!/usr/bin/env node

/**
 * Custom test runner script for the User Management System
 * 
 * This script runs Jest tests with detailed reporting and can be configured
 * to run specific test suites or generate coverage reports.
 */

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

// Configuration
const config = {
  // Test directories to run
  testDirs: [
    'components',
    'lib',
    'middleware',
    'pages',
  ],
  // Default Jest options
  jestOptions: {
    watch: false,
    coverage: false,
    verbose: true,
    runInBand: false,
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
let testPattern = '';
let specificDir = '';

// Process arguments
args.forEach(arg => {
  if (arg === '--watch' || arg === '-w') {
    config.jestOptions.watch = true;
  } else if (arg === '--coverage' || arg === '-c') {
    config.jestOptions.coverage = true;
  } else if (arg === '--verbose' || arg === '-v') {
    config.jestOptions.verbose = true;
  } else if (arg === '--runInBand' || arg === '-i') {
    config.jestOptions.runInBand = true;
  } else if (arg.startsWith('--dir=')) {
    specificDir = arg.split('=')[1];
  } else if (arg.startsWith('--pattern=')) {
    testPattern = arg.split('=')[1];
  } else if (arg === '--help' || arg === '-h') {
    printHelp();
    process.exit(0);
  }
});

/**
 * Print help information
 */
function printHelp() {
  console.log(`
User Management System Test Runner

Usage:
  node scripts/run-tests.js [options]

Options:
  --watch, -w         Run tests in watch mode
  --coverage, -c      Generate coverage report
  --verbose, -v       Run with verbose output
  --runInBand, -i     Run all tests serially
  --dir=<directory>   Run tests only in specified directory (components, lib, middleware, pages)
  --pattern=<pattern> Run tests matching the pattern
  --help, -h          Show this help message

Examples:
  node scripts/run-tests.js --dir=components
  node scripts/run-tests.js --pattern=auth --watch
  node scripts/run-tests.js --coverage
  `);
}

/**
 * Build the Jest command based on configuration
 */
function buildJestCommand() {
  let command = 'jest';
  
  // Add test pattern if specified
  if (testPattern) {
    command += ` ${testPattern}`;
  }
  
  // Add specific directory if specified
  if (specificDir) {
    if (config.testDirs.includes(specificDir)) {
      command += ` __tests__/${specificDir}`;
    } else {
      console.error(`Error: Invalid directory '${specificDir}'. Valid directories are: ${config.testDirs.join(', ')}`);
      process.exit(1);
    }
  }
  
  // Add Jest options
  if (config.jestOptions.watch) command += ' --watch';
  if (config.jestOptions.coverage) command += ' --coverage';
  if (config.jestOptions.verbose) command += ' --verbose';
  if (config.jestOptions.runInBand) command += ' --runInBand';
  
  return command;
}

/**
 * Print test summary
 */
function printSummary() {
  console.log('\n=== User Management System Test Summary ===\n');
  
  // Count test files in each directory
  config.testDirs.forEach(dir => {
    const dirPath = join(__dirname, '..', '__tests__', dir);
    if (readdirSync(dirPath).length > 0) {
      const files = readdirSync(dirPath).filter(file => file.match(/\.(test|spec)\.(js|ts|tsx)$/));
      console.log(`${dir}: ${files.length} test files`);
    } else {
      console.log(`${dir}: directory not found`);
    }
  });
  
  console.log('\nTest command:', buildJestCommand());
  console.log('\n===========================================\n');
}

// Main execution
try {
  printSummary();
  
  // Run the Jest command
  const command = buildJestCommand();
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✅ Tests completed successfully');
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
} 