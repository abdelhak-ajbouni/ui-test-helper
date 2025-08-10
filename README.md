# UI Test Helper Chrome Extension

A Chrome extension that helps developers generate testing queries for UI elements by simply inspecting them. Perfect for creating tests with Testing Library, Cypress, Playwright, and other testing frameworks.

## Features

- 🔍 **One-click element inspection** - Click any element to generate testing queries
- 🎯 **Smart query prioritization** - Prioritizes accessible queries like `getByRole` and `getByLabelText`
- 📋 **Easy copy-paste** - Copy queries directly to your clipboard
- ✨ **Visual feedback** - Hover effects and clear visual cues during inspection
- 🎨 **Clean UI** - Non-intrusive floating panel with results

## Supported Query Types

The extension generates queries in order of priority:

1. **getByRole** - Best for accessibility (buttons, links, inputs with roles)
2. **getByLabelText** - For form elements with labels
3. **getByPlaceholderText** - For inputs with placeholder text
4. **getByText** - For elements with visible text content
5. **getByAltText** - For images with alt attributes
6. **getByTitle** - For elements with title attributes
7. **getByDisplayValue** - For form inputs with values
8. **getByTestId** - Fallback for elements with test IDs

## Installation

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" button
5. Select the `extension/` directory
6. The extension should now appear in your extensions toolbar

### Method 2: Manual Installation

1. Download the extension files
2. Ensure you have all required files:
   - `manifest.json`
   - `popup.html`, `popup.css`, `popup.js`
   - `inspector.js`, `inspector.css`
   - `icons/` directory (SVG icons included)

## Usage

1. **Open any webpage** you want to test
2. **Click the UI Test Helper extension icon** in your browser toolbar
3. **Click "Start Inspection"** in the popup
4. **Hover over elements** to see them highlighted
5. **Click any element** to generate testing queries
6. **Copy the queries** you want to use in your tests
7. **Press ESC** or click "Stop Inspection" to exit

## Example Output

When you click on a button element, you might see:

```javascript
getByRole('button', { name: 'Submit Form' })
getByText('Submit Form')
getByTestId('submit-btn')
```

## Project Structure

```
ui-test-helper/
├── extension/            # Chrome extension files
│   ├── manifest.json        # Extension configuration
│   ├── popup.html          # Extension popup interface
│   ├── popup.css           # Popup styles
│   ├── popup.js            # Popup functionality
│   ├── inspector.js        # Main content script
│   ├── inspector.css       # Inspector UI styles
│   ├── icons/              # Extension icons
│   ├── test.html           # Test page
│   └── test-buttons.html   # Button test page

├── tests/                # Test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests
│   └── jest.e2e.config.js  # E2E test configuration
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Development

### Prerequisites

- Chrome browser
- Basic knowledge of Chrome extension development

### Local Development

1. Make changes to the files in the `extension/` directory
2. Go to `chrome://extensions/`
3. Click the refresh icon on the UI Test Helper extension
4. Test your changes on any webpage

### Testing

For testing the extension, you can use the included test pages:

1. Open `extension/test.html` in your browser
2. Load the extension
3. Test the inspection functionality on various elements
4. Use `extension/test-buttons.html` for specific button testing

### Running Tests

```bash
# Install dependencies
npm install

# Run unit and integration tests
npm test

# Run end-to-end browser tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## Roadmap

### Phase 2: Polish & Usability (Planned)
- Draggable results panel
- Better viewport positioning
- Toast notifications
- More query types (getByDisplayValue, etc.)

### Future Features
- Configuration options
- Framework-specific toggles (Testing Library, Cypress, Playwright)
- Accessibility insights
- Query validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ⚠️ Firefox (requires manifest modifications)
- ❌ Safari (not supported)

## License

MIT License - feel free to use this extension in your projects!

## Feedback

Found a bug or have a feature request? Please open an issue on the repository or contact the development team.

---

**Happy Testing!** 🧪✨ 