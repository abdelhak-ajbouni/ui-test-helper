// Global teardown for Playwright E2E tests
// This runs once after all tests complete

export default async function globalTeardown() {
  console.log('🧹 Starting E2E test teardown...');
  
  // Any global cleanup logic can go here
  // For example: stopping test servers, cleaning up test data, etc.
  
  console.log('✅ E2E test teardown complete');
}