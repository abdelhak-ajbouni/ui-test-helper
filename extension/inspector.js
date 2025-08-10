class UITestHelper {
  constructor() {
    this.isInspecting = false;
    this.overlay = null;
    this.resultsPanel = null;
    this.currentHighlight = null;
    this.queryGenerator = new QueryGenerator();

    this.handleClick = this.handleClick.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.action) {
        case 'ping':
          sendResponse({ success: true });
          break;
        case 'startInspection':
          this.startInspection();
          sendResponse({ success: true });
          break;
        case 'stopInspection':
          this.stopInspection();
          sendResponse({ success: true });
          break;
        case 'getInspectionStatus':
          sendResponse({ isInspecting: this.isInspecting });
          break;
      }
    });
  }

  startInspection() {
    if (this.isInspecting) {
      return;
    }

    this.isInspecting = true;
    document.body.style.cursor = 'crosshair';

    // Add event listeners
    document.addEventListener('click', this.handleClick, true);
    document.addEventListener('mouseover', this.handleMouseOver, true);
    document.addEventListener('mouseout', this.handleMouseOut, true);
    document.addEventListener('keydown', this.handleKeyDown, true);

    this.showToast('UI Test Helper active. Press ESC to exit.');
  }

  stopInspection() {
    if (!this.isInspecting) {
      return;
    }

    this.isInspecting = false;
    document.body.style.cursor = '';

    // Remove event listeners
    document.removeEventListener('click', this.handleClick, true);
    document.removeEventListener('mouseover', this.handleMouseOver, true);
    document.removeEventListener('mouseout', this.handleMouseOut, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);

    this.removeHighlight();
    this.hideResultsPanel();

    // Notify popup
    chrome.runtime.sendMessage({ action: 'inspectionStopped' });
  }


  handleClick(event) {
    const target = event.target;

    // Let clicks inside our own UI pass through so their handlers (e.g., Close) work
    if (
      (target && typeof target.closest === 'function') && (
        target.closest('.ui-test-helper-panel') ||
        target.closest('.ui-test-helper-explanation')
      )
    ) {
      return;
    }

    // Intercept page clicks during inspection and inspect the clicked element
    event.preventDefault();
    event.stopPropagation();
    this.inspectElement(target);
  }

  handleMouseOver(event) {
    const element = event.target;
    // Do not highlight our own UI elements
    if (
      (element && typeof element.closest === 'function') && (
        element.closest('.ui-test-helper-panel') ||
        element.closest('.ui-test-helper-explanation')
      )
    ) {
      return;
    }
    this.highlightElement(element);
  }

  handleMouseOut(_event) {
    this.removeHighlight();
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.stopInspection();
    }
  }

  highlightElement(element) {
    this.removeHighlight();

    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    this.currentHighlight = document.createElement('div');
    this.currentHighlight.className = 'ui-test-helper-highlight';
    this.currentHighlight.style.top = `${rect.top + scrollTop}px`;
    this.currentHighlight.style.left = `${rect.left + scrollLeft}px`;
    this.currentHighlight.style.width = `${rect.width}px`;
    this.currentHighlight.style.height = `${rect.height}px`;

    document.body.appendChild(this.currentHighlight);
  }

  removeHighlight() {
    if (this.currentHighlight) {
      this.currentHighlight.remove();
      this.currentHighlight = null;
    }
  }

  inspectElement(element) {
    try {
      const queries = this.queryGenerator.generateQueries(element);
      this.showResults(queries, element);
    } catch (error) {
      console.error('Error generating queries:', error);
      this.showErrorToast('Failed to generate testing queries for this element.');
    }
  }


  showResults(queries, element) {
    this.hideResultsPanel();

    const panel = document.createElement('div');
    panel.className = 'ui-test-helper-panel';

    // Create header
    const header = document.createElement('div');
    header.className = 'ui-test-helper-header';

    const title = document.createElement('h3');
    title.textContent = 'Testing Queries';
    header.appendChild(title);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ui-test-helper-close';
    closeBtn.textContent = '✕';
    closeBtn.type = 'button';
    header.appendChild(closeBtn);

    panel.appendChild(header);

    // Create content
    const content = document.createElement('div');
    content.className = 'ui-test-helper-content';

    if (queries.length === 0) {
      const noQueriesContainer = document.createElement('div');
      noQueriesContainer.className = 'ui-test-helper-no-queries-container';

      const noQueries = document.createElement('p');
      noQueries.className = 'ui-test-helper-no-queries';
      noQueries.textContent = 'No suitable queries found for this element.';

      const suggestions = document.createElement('div');
      suggestions.className = 'ui-test-helper-suggestions';
      suggestions.innerHTML = `
        <h4>Suggestions to make this element testable:</h4>
        <ul>
          <li>Add a <code>data-testid</code> attribute</li>
          <li>Add an <code>aria-label</code> for screen readers</li>
          <li>Use semantic HTML elements (button, link, etc.)</li>
          <li>Associate form inputs with labels</li>
          <li>Add meaningful text content</li>
        </ul>
      `;

      noQueriesContainer.appendChild(noQueries);
      noQueriesContainer.appendChild(suggestions);
      content.appendChild(noQueriesContainer);
    } else {
      queries.forEach((q, index) => {
        const queryDiv = document.createElement('div');
        queryDiv.className = 'ui-test-helper-query';

        const typeDiv = document.createElement('div');
        typeDiv.className = 'ui-test-helper-query-type';
        typeDiv.setAttribute('data-query-type', q.type);

        const typeText = document.createElement('span');
        typeText.textContent = q.type;
        typeDiv.appendChild(typeText);

        const infoIcon = document.createElement('button');
        infoIcon.className = 'ui-test-helper-info-icon';
        infoIcon.textContent = 'ℹ';
        infoIcon.type = 'button';
        infoIcon.title = 'Learn about this query type';
        infoIcon.setAttribute('data-query-type', q.type);
        typeDiv.appendChild(infoIcon);

        const codeDiv = document.createElement('div');
        codeDiv.className = 'ui-test-helper-query-code';
        codeDiv.textContent = q.query;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'ui-test-helper-copy';
        copyBtn.textContent = 'Copy';
        copyBtn.type = 'button';
        copyBtn.setAttribute('data-query', q.query);
        copyBtn.setAttribute('data-index', index.toString());

        queryDiv.appendChild(typeDiv);
        queryDiv.appendChild(codeDiv);
        queryDiv.appendChild(copyBtn);

        content.appendChild(queryDiv);
      });
    }

    panel.appendChild(content);

    // Position panel
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    panel.style.top = `${rect.bottom + scrollTop + 10}px`;
    panel.style.left = `${rect.left + scrollLeft}px`;

    // Ensure panel stays within viewport
    document.body.appendChild(panel);
    const panelRect = panel.getBoundingClientRect();

    if (panelRect.right > window.innerWidth) {
      panel.style.left = `${rect.right + scrollLeft - panelRect.width}px`;
    }

    if (panelRect.bottom > window.innerHeight) {
      panel.style.top = `${rect.top + scrollTop - panelRect.height - 10}px`;
    }

    this.resultsPanel = panel;

    // Add event listeners
    const closeBtnElement = panel.querySelector('.ui-test-helper-close');

    if (closeBtnElement) {
      closeBtnElement.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideResultsPanel();
      });
    }

    const copyButtons = panel.querySelectorAll('.ui-test-helper-copy');
    const infoIcons = panel.querySelectorAll('.ui-test-helper-info-icon');

    // Add info icon event listeners
    infoIcons.forEach((icon) => {
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const queryType = icon.getAttribute('data-query-type');
        this.showQueryExplanation(queryType);
      });
    });

    copyButtons.forEach((btn, _index) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target;
        if (target && target.getAttribute) {
          const query = target.getAttribute('data-query');

          if (query) {
            try {
              await this.copyToClipboard(query);
              target.textContent = 'Copied!';
              if (target.style) {
                target.style.background = '#38a169';
              }
              setTimeout(() => {
                target.textContent = 'Copy';
                if (target.style) {
                  target.style.background = '#4299e1';
                }
              }, 1500);
            } catch (error) {
              console.error('Failed to copy to clipboard:', error);
              target.textContent = 'Failed';
              this.showErrorToast('Failed to copy to clipboard. Please try selecting and copying manually.');
              setTimeout(() => {
                target.textContent = 'Copy';
              }, 1500);
            }
          }
        }
      });
    });

    // Prevent clicks inside the panel from bubbling to the document capture listener
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  hideResultsPanel() {
    if (this.resultsPanel) {
      this.resultsPanel.remove();
      this.resultsPanel = null;
    }
  }

  async copyToClipboard(text) {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fall through to fallback method
    }

    // Fallback for older browsers or insecure contexts
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error('Copy command failed');
      }
    } catch (err) {
      console.error('All copy methods failed:', err);
      throw err;
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ui-test-helper-toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'ui-test-helper-error-toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000); // Show errors a bit longer
  }


  showQueryExplanation(queryType) {
    const explanations = {
      'getByRole': {
        title: 'getByRole - Most Accessible ✨',
        description: 'Finds elements by their semantic role, which is how screen readers and other assistive technologies identify elements.',
        benefits: [
          'Works with all accessibility tools',
          'Encourages semantic HTML usage',
          'Most reliable for diverse user needs',
          'Future-proof against DOM changes'
        ],
        example: 'Perfect for buttons, links, form controls, and headings'
      },
      'getByLabelText': {
        title: 'getByLabelText - Form-Friendly 📝',
        description: 'Finds form elements by their associated labels, exactly how users with screen readers navigate forms.',
        benefits: [
          'Matches how assistive technology works',
          'Encourages proper form labeling',
          'Great user experience for everyone',
          'Works with explicit and implicit labels'
        ],
        example: 'Ideal for inputs, textareas, and select elements'
      },
      'getByPlaceholderText': {
        title: 'getByPlaceholderText - Visual Helper 💭',
        description: 'Finds elements by placeholder text. Less accessible than labels but still user-visible.',
        benefits: [
          'User-visible content',
          'Good for elements without labels',
          'Matches user interaction patterns'
        ],
        example: 'Use when proper labels aren\'t available'
      },
      'getByText': {
        title: 'getByText - Content-Based 📄',
        description: 'Finds elements by their visible text content, matching how users scan and identify elements.',
        benefits: [
          'Matches how users find elements',
          'Works with any text-containing element',
          'Intuitive and readable in tests'
        ],
        example: 'Great for buttons, links, and text content'
      },
      'getByAltText': {
        title: 'getByAltText - Image Accessibility 🖼️',
        description: 'Finds images by their alt text, which is essential for screen reader users.',
        benefits: [
          'Encourages proper alt text usage',
          'Essential for blind/low-vision users',
          'Improves overall accessibility'
        ],
        example: 'Perfect for images and icons with descriptions'
      },
      'getByTitle': {
        title: 'getByTitle - Tooltip Text 💡',
        description: 'Finds elements by their title attribute, often shown as tooltips on hover.',
        benefits: [
          'Uses accessible title attributes',
          'Provides additional context',
          'Helpful for complex interfaces'
        ],
        example: 'Good for elements with helpful tooltips'
      },
      'getByDisplayValue': {
        title: 'getByDisplayValue - Current Values 🎯',
        description: 'Finds form elements by their current value, useful for pre-filled or selected elements.',
        benefits: [
          'Tests actual form state',
          'Useful for default values',
          'Reflects user input'
        ],
        example: 'Perfect for testing form submissions'
      },
      'getByTestId': {
        title: 'getByTestId - Last Resort 🔧',
        description: 'Finds elements by test-specific attributes. Not user-visible but reliable for testing.',
        benefits: [
          'Reliable and specific',
          'Won\'t break with UI changes',
          'Good fallback option'
        ],
        example: 'Use when no accessible query works'
      }
    };

    const explanation = explanations[queryType];
    if (!explanation) {
      return;
    }

    // Remove existing explanation if any
    const existingExplanation = document.querySelector('.ui-test-helper-explanation');
    if (existingExplanation) {
      existingExplanation.remove();
    }

    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'ui-test-helper-explanation';
    explanationDiv.innerHTML = `
      <div class="ui-test-helper-explanation-overlay"></div>
      <div class="ui-test-helper-explanation-content">
        <div class="ui-test-helper-explanation-header">
          <h4>${explanation.title}</h4>
          <button class="ui-test-helper-explanation-close">✕</button>
        </div>
        <div class="ui-test-helper-explanation-body">
          <p>${explanation.description}</p>
          
          <div class="ui-test-helper-explanation-section">
            <h5>Why this matters:</h5>
            <ul>
              ${explanation.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div class="ui-test-helper-explanation-example">
            <strong>💡 Best for:</strong> ${explanation.example}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(explanationDiv);

    // Add event listeners
    const closeBtn = explanationDiv.querySelector('.ui-test-helper-explanation-close');
    const overlay = explanationDiv.querySelector('.ui-test-helper-explanation-overlay');

    const closeExplanation = () => explanationDiv.remove();

    closeBtn.addEventListener('click', closeExplanation);
    overlay.addEventListener('click', closeExplanation);

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeExplanation();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }
}

// Initialize the UI Test Helper
if (!window.uiTestHelper) {
  window.uiTestHelper = new UITestHelper();
}
