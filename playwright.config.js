import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve(__dirname, 'extension');
const TEST_PAGE_PATH = path.resolve(__dirname, 'tests/test.html');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Chrome extensions need sequential execution
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Chrome extension tests should run sequentially
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chrome Extension',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific arguments for extension testing
        launchOptions: {
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-default-apps'
          ],
          headless: false // Extensions require headed mode
        }
      },
    },
  ],
  // Global setup and teardown
  globalSetup: './tests/e2e/playwright-global-setup.js',
  globalTeardown: './tests/e2e/playwright-global-teardown.js',
  // Test timeout
  timeout: 60000,
  expect: {
    timeout: 10000
  }
});