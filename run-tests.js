// Simple test runner script
const { execSync } = require('child_process');

console.log('🧪 Running tests...\n');

try {
  // Run the simple test to verify Jest is working
  console.log('Running simple test...');
  execSync('npx jest __tests__/simple.test.js', { stdio: 'inherit' });
  
  console.log('\n✅ Tests completed successfully!');
  console.log('\nTest Summary:');
  console.log('-------------');
  console.log('✅ Simple test: Passed');
  console.log('\nNote: The more complex tests for Supabase client and other components');
  console.log('require additional setup. Please refer to the docs/TESTING.md file for');
  console.log('more information on how to run these tests.');
} catch (error) {
  console.error('\n❌ Tests failed!');
  process.exit(1);
} 