# UI Test Helper - Chrome Extension

This directory contains all the Chrome extension files for the UI Test Helper.

## 📁 Extension Structure

```
extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker handling keyboard commands & injection
├── sidepanel.html         # Optional side panel UI
├── sidepanel.js           # Side panel logic
├── inspector.js           # Main content script
├── inspector.css          # Inspector UI styles
├── icons/                 # Extension icons
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
├── test.html              # Test page for development
└── test-buttons.html      # Button functionality test page
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
- Defines extension permissions and configuration
- Specifies popup and content script files
- Sets up Chrome extension API access

### sidepanel.html/js
- Optional side panel UI for toggling the inspector and docs link
- Opened automatically when clicking the toolbar icon (if supported)

### inspector.js/css
- Main content script injected into web pages
- Handles element inspection and highlighting
- Generates testing queries and displays results panel
- Manages clipboard operations

## 🔧 Configuration

The extension uses Manifest V3 with these key permissions:
- `activeTab` - Access to the current active tab
- `scripting` - Programmatic content script injection

Keyboard and icon support:
- `commands` → `toggle-inspector` bound to `Alt+Shift+U`
- Toolbar icon click toggles the inspector and opens the side panel
- Both are handled in `background.js` via `chrome.scripting`

## 🐛 Debugging

1. **Extension Console**: Right-click extension icon → "Inspect popup"
2. **Content Script**: Open DevTools on any webpage, check Console tab
3. **Service Worker**: Go to `chrome://extensions/` → click `Service worker` link under the extension to inspect logs

## 📦 Building for Distribution

When ready to publish:

1. Ensure all files are in this directory
2. Create a ZIP file of the entire `extension/` folder
3. Upload to Chrome Web Store Developer Dashboard

## 🧪 Testing

Run tests from the project root:

```bash
# Run all tests
npm test

# Run E2E tests (tests the actual extension)
npm run test:e2e
```

The E2E tests will automatically load this extension directory into a test browser instance. 