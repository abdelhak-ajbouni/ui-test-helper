// Shared query generation logic for UI Test Helper
// This module can be used in both the extension and tests

class QueryGenerator {
  generateQueries(element) {
    const queries = [];

    // Get element information
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || this.getImplicitRole(element);
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    // const id = element.id;
    // const name = element.getAttribute('name');
    const placeholder = element.getAttribute('placeholder');
    const alt = element.getAttribute('alt');
    const title = element.getAttribute('title');
    const value = element.value;
    const textContent = element.textContent?.trim();
    const testId = element.getAttribute('data-testid') || element.getAttribute('data-test-id');

    // Priority 1: getByRole
    if (role) {
      let roleQuery = `getByRole('${role}'`;

      if (ariaLabel) {
        roleQuery += `, { name: '${ariaLabel}' }`;
      } else if (textContent && textContent.length < 50) {
        roleQuery += `, { name: '${textContent}' }`;
      }

      roleQuery += ')';
      queries.push({ type: 'getByRole', query: roleQuery, priority: 1 });
    }

    // Priority 2: getByLabelText
    if (ariaLabel) {
      queries.push({ type: 'getByLabelText', query: `getByLabelText('${ariaLabel}')`, priority: 2 });
    }

    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement && labelElement.textContent) {
        queries.push({
          type: 'getByLabelText',
          query: `getByLabelText('${labelElement.textContent.trim()}')`,
          priority: 2
        });
      }
    }

    // For form elements, look for associated label
    if (['input', 'textarea', 'select'].includes(tagName)) {
      const label = this.findAssociatedLabel(element);
      if (label) {
        queries.push({
          type: 'getByLabelText',
          query: `getByLabelText('${label}')`,
          priority: 2
        });
      }
    }

    // Priority 3: getByPlaceholderText
    if (placeholder) {
      queries.push({
        type: 'getByPlaceholderText',
        query: `getByPlaceholderText('${placeholder}')`,
        priority: 3
      });
    }

    // Priority 4: getByText (only for elements with direct text content)
    if (textContent && textContent.length > 0) {
      // Check if element has direct text content (not nested in child elements)
      const hasDirectText = this.hasDirectTextContent(element);
      
      if (hasDirectText) {
        // Short text: use exact string
        if (textContent.length < 50) {
          queries.push({ type: 'getByText', query: `getByText('${textContent}')`, priority: 4 });
        } else {
          const snippet = this.buildTextSnippet(textContent, 8, 50);
          if (snippet) {
            const regex = this.escapeRegex(snippet);
            queries.push({ type: 'getByText', query: `getByText(/${regex}/i)`, priority: 4 });
          }
        }
      }
    }

    // Priority 5: getByAltText
    if (alt) {
      queries.push({
        type: 'getByAltText',
        query: `getByAltText('${alt}')`,
        priority: 5
      });
    }

    // Priority 6: getByTitle
    if (title) {
      queries.push({
        type: 'getByTitle',
        query: `getByTitle('${title}')`,
        priority: 6
      });
    }

    // Priority 7: getByDisplayValue
    if (value && ['input', 'textarea', 'select'].includes(tagName)) {
      queries.push({
        type: 'getByDisplayValue',
        query: `getByDisplayValue('${value}')`,
        priority: 7
      });
    }

    // Priority 8: getByTestId (fallback)
    if (testId) {
      queries.push({
        type: 'getByTestId',
        query: `getByTestId('${testId}')`,
        priority: 8
      });
    }

    // Sort by priority and remove duplicates
    return queries
      .sort((a, b) => a.priority - b.priority)
      .filter((query, index, self) =>
        index === self.findIndex(q => q.query === query.query)
      );
  }

  // Builds a short snippet from the start of the text (up to maxWords and maxChars)
  buildTextSnippet(text, maxWords = 8, maxChars = 50) {
    const words = text.trim().split(/\s+/).slice(0, maxWords);
    let snippet = words.join(' ');
    if (snippet.length > maxChars) {
      snippet = snippet.slice(0, maxChars);
      // Trim to last complete word
      const lastSpace = snippet.lastIndexOf(' ');
      if (lastSpace > 0) snippet = snippet.slice(0, lastSpace);
    }
    return snippet.trim();
  }

  // Escapes regex special characters for safe inline /.../ patterns
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getImplicitRole(element) {
    const tagName = element.tagName.toLowerCase();
    const type = element.getAttribute('type');

    const roleMap = {
      'button': 'button',
      'a': element.href ? 'link' : null,
      'input': {
        'button': 'button',
        'submit': 'button',
        'reset': 'button',
        'checkbox': 'checkbox',
        'radio': 'radio',
        'range': 'slider',
        'text': 'textbox',
        'email': 'textbox',
        'password': 'textbox',
        'search': 'searchbox',
        'tel': 'textbox',
        'url': 'textbox'
      },
      'textarea': 'textbox',
      'select': 'combobox',
      'img': 'img',
      'h1': 'heading',
      'h2': 'heading',
      'h3': 'heading',
      'h4': 'heading',
      'h5': 'heading',
      'h6': 'heading'
    };

    if (tagName === 'input' && type) {
      return roleMap.input[type] || 'textbox';
    }

    return roleMap[tagName] || null;
  }

  findAssociatedLabel(element) {
    // Check for explicit label association
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent?.trim();
      }
    }

    // Check for implicit label association (input inside label)
    const parentLabel = element.closest('label');
    if (parentLabel) {
      return parentLabel.textContent?.trim();
    }

    return null;
  }

  hasDirectTextContent(element) {
    // Check if the element has text nodes as direct children
    for (let child of element.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        return true;
      }
    }
    return false;
  }
}

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment (tests)
  module.exports = QueryGenerator;
} else if (typeof window !== 'undefined') {
  // Browser environment (extension)
  window.QueryGenerator = QueryGenerator;
}
