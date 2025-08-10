import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    exclude: [
      './tests/e2e/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],
    include: ['./tests/**/*.test.js'],
    coverage: {
      include: ['extension/*.js'],
      exclude: [
        'extension/test-*.js',
        'tests/**',
        'node_modules/**',
        'coverage/**'
      ],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage'
    },
    globals: true
  }
});