// Global setup for Playwright E2E tests
// This runs once before all tests

export default async function globalSetup() {
  console.log('🚀 Starting E2E test setup...');
  
  // Any global setup logic can go here
  // For example: starting test servers, database seeding, etc.
  
  console.log('✅ E2E test setup complete');
}