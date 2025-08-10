# Testing Strategy - UI Test Helper

This document outlines the comprehensive testing approach for the UI Test Helper Chrome extension.

## 📋 Overview

Our testing strategy covers three levels:
- **Unit Tests**: Test individual functions and logic
- **Integration Tests**: Test component interactions and Chrome APIs
- **E2E Tests**: Test the complete user workflow in a real browser

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm run test:all

# Run specific test types
npm test              # Unit & integration tests
npm run test:e2e      # End-to-end tests
npm run test:coverage # Generate coverage report
npm run test:watch    # Watch mode for development
```

## 📁 Test Structure

```
tests/
├── setup.js                 # Jest setup with Chrome API mocks
├── jest.e2e.config.js       # E2E test configuration
├── unit/                    # Unit tests
│   ├── query-generator.test.js  # Query generation logic
│   └── clipboard.test.js        # Clipboard functionality
├── integration/             # Integration tests
│   ├── popup.test.js           # Popup component
│   └── results-panel.test.js   # Results panel UI
└── e2e/                     # End-to-end tests
    ├── setup.js                # Puppeteer configuration
    ├── global-setup.js         # Global E2E setup
    ├── global-teardown.js      # Global E2E cleanup
    └── extension.test.js       # Full workflow tests
```

## 🧪 Test Categories

### Unit Tests

**Query Generator Tests** (`tests/unit/query-generator.test.js`)
- ✅ Button elements with different attributes
- ✅ Input elements with labels and placeholders
- ✅ Image elements with alt text and titles
- ✅ Link elements and role attributes
- ✅ Priority ordering of queries
- ✅ Edge cases and error handling

**Clipboard Tests** (`tests/unit/clipboard.test.js`)
- ✅ Modern Clipboard API functionality
- ✅ Fallback method for older browsers
- ✅ Security context detection
- ✅ Special characters and long text
- ✅ Error handling scenarios

### Integration Tests

**Popup Tests** (`tests/integration/popup.test.js`)
- ✅ Initial state rendering
- ✅ Button state management
- ✅ Chrome extension API calls
- ✅ Content script injection
- ✅ Message passing between components
- ✅ Error handling and timeouts

**Results Panel Tests** (`tests/integration/results-panel.test.js`)
- ✅ Panel creation and structure
- ✅ Close button functionality
- ✅ Copy button behavior
- ✅ Multiple query handling
- ✅ Panel positioning
- ✅ Event propagation

### E2E Tests

**Extension Workflow Tests** (`tests/e2e/extension.test.js`)
- ✅ Extension loading and popup opening
- ✅ Complete inspection workflow
- ✅ ESC key to stop inspection
- ✅ Query generation for different elements
- ✅ Multi-tab functionality
- ✅ Error scenarios (page reload, restricted pages)
- ✅ Performance benchmarks

## 🔧 Test Configuration

### Jest Configuration

**Main Config** (`package.json`)
```json
{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"],
  "collectCoverageFrom": ["*.js", "!test-*.js", "!tests/**"]
}
```

**E2E Config** (`tests/jest.e2e.config.js`)
```json
{
  "testEnvironment": "node",
  "testTimeout": 60000,
  "setupFilesAfterEnv": ["<rootDir>/tests/e2e/setup.js"]
}
```

### Puppeteer Setup

E2E tests use Puppeteer to:
- Launch Chrome with the extension loaded
- Interact with the actual extension popup
- Test real browser behavior
- Measure performance metrics

## 📊 Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Query Generation | 95%+ | ✅ Comprehensive |
| Clipboard Operations | 90%+ | ✅ Complete |
| Popup Logic | 85%+ | ✅ Good |
| Results Panel | 90%+ | ✅ Complete |
| E2E Workflows | 80%+ | ✅ Covered |

## 🔍 Debugging Tests

### Debugging Unit/Integration Tests

```bash
# Run specific test file
npm test query-generator.test.js

# Run with verbose output
npm test -- --verbose

# Run in watch mode
npm run test:watch
```

### Debugging E2E Tests

```bash
# Run E2E with visible browser (headless: false)
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- --testNamePattern="complete inspection workflow"

# Check browser console logs
# (Automatically captured in test output)
```

## 🚨 Common Issues

### Unit Test Issues

**Chrome API Mocks Not Working**
- Ensure `tests/setup.js` is properly configured
- Check that `global.chrome` is available in tests

**DOM Manipulation Failing**
- Use `createTestElement()` helper for consistent DOM creation
- Clean up DOM with `afterEach(() => document.body.innerHTML = '')`

### E2E Test Issues

**Extension Not Loading**
- Verify extension path in `tests/e2e/setup.js`
- Check Chrome arguments for extension loading
- Ensure manifest.json is valid

**Timeouts**
- Increase timeout for slow operations: `jest.setTimeout(60000)`
- Use `waitForElement()` helper instead of fixed delays
- Check that content script injection completes

**Test Flakiness**
- Add proper waiting conditions
- Use `page.waitForFunction()` for dynamic content
- Avoid fixed timeouts when possible

## 🏃‍♂️ Running Tests in CI

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:e2e
```

### Local CI Simulation

```bash
# Run all tests with coverage
npm run test:coverage

# Run E2E in headless mode (CI-like)
HEADLESS=true npm run test:e2e
```

## ✅ Test Best Practices

### Unit Tests
- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions

### Integration Tests
- Test component interactions
- Mock Chrome APIs appropriately
- Test real DOM manipulation
- Verify event handling

### E2E Tests
- Test complete user workflows
- Use real browser interactions
- Test across different scenarios
- Measure performance when relevant

## 📈 Continuous Improvement

### Adding New Tests

1. **For new features**: Add unit tests first, then integration tests
2. **For bug fixes**: Write a failing test, then fix the bug
3. **For performance**: Add E2E performance benchmarks

### Maintenance

- Review test coverage monthly
- Update mocks when Chrome APIs change
- Refactor tests when code changes
- Remove obsolete tests

---

## 🎯 Test Coverage Report

Run `npm run test:coverage` to generate a detailed coverage report in `coverage/` directory.

The report shows:
- Line coverage per file
- Branch coverage for conditionals
- Function coverage
- Uncovered code highlights 