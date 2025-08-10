# UI Test Helper - Chrome Extension

This directory contains all the Chrome extension files for the UI Test Helper.

## 📁 Extension Structure

```
extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker handling keyboard commands & injection
├── popup.html             # Extension popup interface
├── popup.css              # Popup styles
├── popup.js               # Popup functionality
├── inspector.js           # Main content script for element inspection
├── inspector.css          # Inspector UI styles
├── query-generator.js     # Query generation logic
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # This file
```

## 🚀 Development

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked" button
4. Select this `extension/` directory
5. The extension should now appear in your extensions toolbar

### Testing

Use the test pages to verify functionality:

- **test.html** - Comprehensive test page with various UI elements
- **test-buttons.html** - Specific test page for debugging button functionality

### Making Changes

1. Edit the files in this directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the UI Test Helper extension
4. Test your changes on any webpage

## 📋 Key Files

### manifest.json
- Defines extension permissions and configuration (Manifest V3)
- Specifies popup, service worker, and content script files
- Sets up Chrome extension API access with minimal permissions

### popup.html/css/js
- Main extension interface (popup when clicking toolbar icon)
- Start/stop inspection functionality
- Documentation link to Testing Library queries
- Error handling and user feedback

### background.js
- Service worker for keyboard shortcuts
- Handles content script injection on demand
- No UI components - purely functional

### inspector.js/css + query-generator.js
- Main content script injected into web pages
- Handles element inspection, highlighting, and user interaction
- Generates accessibility-first testing queries
- Manages clipboard operations and results panel UI

## 🔧 Configuration

The extension uses **Manifest V3** with **minimal permissions**:
- `activeTab` - Access to the current active tab only when user activates extension
- `scripting` - Programmatic content script injection for inspection functionality

**No broad permissions** like `<all_urls>` - privacy-focused design!

Keyboard and icon support:
- `commands` → `toggle-inspector` bound to `Alt+Shift+U`
- Toolbar icon click opens popup interface
- Background service worker handles keyboard shortcuts and injection

## 🐛 Debugging

1. **Extension Popup**: Right-click extension icon → "Inspect popup"
2. **Content Script**: Open DevTools on any webpage, check Console tab for inspector logs
3. **Service Worker**: Go to `chrome://extensions/` → click `Service worker` link under the extension

### Common Issues
- **Not working on special pages**: Extension cannot run on `chrome://`, `edge://`, or extension pages
- **Permission errors**: Ensure you're on a regular webpage (http/https)
- **Script injection fails**: Try refreshing the page and reloading the extension

## 📦 Building for Distribution

### Chrome Web Store Preparation
1. Ensure all files are production-ready (no console.debug statements)
2. Verify icons are PNG format (16, 32, 48, 128px)
3. Test on multiple websites and Chrome versions
4. Create a ZIP file of the entire `extension/` folder
5. Upload to Chrome Web Store Developer Dashboard

### Privacy Policy
Required for Chrome Web Store: https://abdelhak-ajbouni.github.io/ui-test-helper/privacy-policy

### Store Assets Needed
- Screenshots of extension in action
- Promotional images (440x280, 920x680, 1400x560)
- Detailed description and feature list

## 🧪 Testing

Run tests from the project root:

```bash
# Run all tests
npm test

# Run E2E tests (tests the actual extension)
npm run test:e2e
```

The E2E tests will automatically load this extension directory into a test browser instance. 