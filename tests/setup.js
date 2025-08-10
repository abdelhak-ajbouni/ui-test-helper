// Test setup for UI Test Helper extension
// Provides mocks for Chrome APIs and test utilities

// Mock Chrome extension APIs
global.chrome = {
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn(),
    executeScript: vi.fn(),
    insertCSS: vi.fn()
  },
  scripting: {
    executeScript: vi.fn(),
    insertCSS: vi.fn()
  },
  action: {
    onClicked: {
      addListener: vi.fn()
    }
  },
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn()
    },
    sendMessage: vi.fn(),
    lastError: null
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn()
    }
  }
};

// Create persistent clipboard mock
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
};

// Mock DOM APIs for clipboard testing
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: mockClipboard
});

Object.defineProperty(window, 'isSecureContext', {
  writable: true,
  value: true
});

// Mock document.execCommand for fallback clipboard testing
document.execCommand = vi.fn().mockReturnValue(true);

// Test utility functions
global.createTestElement = function(tagName, attributes = {}, textContent = '') {
  const element = document.createElement(tagName);
  
  // Set attributes
  Object.keys(attributes).forEach(key => {
    if (key === 'value') {
      element.value = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  });
  
  // Set text content
  if (textContent) {
    element.textContent = textContent;
  }
  
  // Add to DOM for realistic testing
  document.body.appendChild(element);
  
  return element;
};

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
  vi.clearAllMocks();
});

// Additional DOM setup for tests
beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Restore clipboard API mock if it was modified by tests
  Object.defineProperty(navigator, 'clipboard', {
    writable: true,
    value: mockClipboard
  });
  mockClipboard.writeText.mockClear();
  
  // Reset secure context
  Object.defineProperty(window, 'isSecureContext', {
    writable: true,
    value: true
  });
  
  // Reset execCommand mock
  if (document.execCommand) {
    document.execCommand.mockClear();
    document.execCommand.mockReturnValue(true);
  }
});