// Unit tests for query generation functionality
const QueryGenerator = require('../../extension/query-generator.js');

describe('Query Generator', () => {
  let queryGenerator;

  beforeEach(() => {
    queryGenerator = new QueryGenerator();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Button Elements', () => {
    test('generates getByRole and getByText for button with text', () => {
      const button = createTestElement('button', {}, 'Submit Form');
      const queries = queryGenerator.generateQueries(button);

      expect(queries[0]).toEqual({
        type: 'getByRole',
        query: 'getByRole(\'button\', { name: \'Submit Form\' })',
        priority: 1
      });
      expect(queries.some(q => q.type === 'getByText')).toBe(true);
    });

    test('generates getByTestId query for button with test-id', () => {
      const button = createTestElement('button', { 'data-testid': 'submit-btn' }, 'Submit');
      const queries = queryGenerator.generateQueries(button);

      expect(queries.some(q => q.type === 'getByTestId')).toBe(true);
      expect(queries.find(q => q.type === 'getByTestId').query).toBe('getByTestId(\'submit-btn\')');
    });

    test('handles button with aria-label', () => {
      const button = createTestElement('button', { 'aria-label': 'Close dialog' });
      const queries = queryGenerator.generateQueries(button);

      expect(queries[0]).toEqual({
        type: 'getByRole',
        query: 'getByRole(\'button\', { name: \'Close dialog\' })',
        priority: 1
      });
      expect(queries[1]).toEqual({
        type: 'getByLabelText',
        query: 'getByLabelText(\'Close dialog\')',
        priority: 2
      });
    });
  });

  describe('Input Elements', () => {
    test('generates queries for text input with label', () => {
      document.body.innerHTML = `
        <label for="username">Username</label>
        <input id="username" type="text" placeholder="Enter username">
      `;

      const input = document.getElementById('username');
      const queries = queryGenerator.generateQueries(input);

      expect(queries).toContainEqual({
        type: 'getByLabelText',
        query: 'getByLabelText(\'Username\')',
        priority: 2
      });
      expect(queries).toContainEqual({
        type: 'getByPlaceholderText',
        query: 'getByPlaceholderText(\'Enter username\')',
        priority: 3
      });
    });

    test('generates getByRole for input with implicit role', () => {
      const input = createTestElement('input', { type: 'email' });
      const queries = queryGenerator.generateQueries(input);

      expect(queries[0]).toEqual({
        type: 'getByRole',
        query: 'getByRole(\'textbox\')',
        priority: 1
      });
    });

    test('generates getByDisplayValue for input with value', () => {
      const input = createTestElement('input', { type: 'text', value: 'existing value' });
      input.value = 'existing value';
      const queries = queryGenerator.generateQueries(input);

      expect(queries).toContainEqual({
        type: 'getByDisplayValue',
        query: 'getByDisplayValue(\'existing value\')',
        priority: 7
      });
    });
  });

  describe('Image Elements', () => {
    test('generates getByAltText for images', () => {
      const img = createTestElement('img', {
        src: 'test.jpg',
        alt: 'Test image',
        title: 'Image title'
      });
      const queries = queryGenerator.generateQueries(img);

      expect(queries).toContainEqual({
        type: 'getByAltText',
        query: 'getByAltText(\'Test image\')',
        priority: 5
      });
      expect(queries).toContainEqual({
        type: 'getByTitle',
        query: 'getByTitle(\'Image title\')',
        priority: 6
      });
    });
  });

  describe('Link Elements', () => {
    test('generates getByRole for links', () => {
      const link = createTestElement('a', { href: '/test' }, 'Go to page');
      const queries = queryGenerator.generateQueries(link);

      expect(queries[0]).toEqual({
        type: 'getByRole',
        query: 'getByRole(\'link\', { name: \'Go to page\' })',
        priority: 1
      });
    });

    test('handles link with role=button', () => {
      const link = createTestElement('a', { role: 'button' }, 'Action Link');
      const queries = queryGenerator.generateQueries(link);

      expect(queries[0]).toEqual({
        type: 'getByRole',
        query: 'getByRole(\'button\', { name: \'Action Link\' })',
        priority: 1
      });
    });
  });

  describe('Priority Ordering', () => {
    test('orders queries by priority correctly (includes getByText for buttons)', () => {
      const button = createTestElement('button', {
        'data-testid': 'my-btn',
        'title': 'Button title'
      }, 'Click me');

      const queries = queryGenerator.generateQueries(button);

      // Should be ordered: getByRole (1), getByText (4), getByTitle (6), getByTestId (8)
      expect(queries.map(q => q.priority)).toEqual([1, 4, 6, 8]);
      expect(queries.map(q => q.type)).toEqual(['getByRole', 'getByText', 'getByTitle', 'getByTestId']);
    });
  });

  describe('getByText Direct Text Content', () => {
    test('generates getByText for elements with direct text content', () => {
      // Create a div with direct text: <div>text</div>
      const div = createTestElement('div', {}, 'Direct text content');
      const queries = queryGenerator.generateQueries(div);

      const byText = queries.find(q => q.type === 'getByText');
      expect(byText).toBeDefined();
      expect(byText.query).toBe('getByText(\'Direct text content\')');
    });

    test('does not generate getByText for elements with nested text content', () => {
      // Create a div with nested text: <div><p>text</p></div>
      document.body.innerHTML = '<div id="parent"><p>Nested text content</p></div>';
      const div = document.getElementById('parent');
      
      const queries = queryGenerator.generateQueries(div);

      const byText = queries.find(q => q.type === 'getByText');
      expect(byText).toBeUndefined();
    });

    test('generates getByText for mixed content when direct text exists', () => {
      // Create element with both direct text and child elements
      document.body.innerHTML = '<div id="mixed">Direct text <span>nested</span></div>';
      const div = document.getElementById('mixed');
      
      const queries = queryGenerator.generateQueries(div);

      const byText = queries.find(q => q.type === 'getByText');
      expect(byText).toBeDefined();
      // Should match the full textContent including nested elements
      expect(byText.query).toBe('getByText(\'Direct text nested\')');
    });

    test('handles elements with only whitespace as direct children', () => {
      // Create element with only whitespace and nested elements
      document.body.innerHTML = '<div id="whitespace">   <p>Only nested</p>   </div>';
      const div = document.getElementById('whitespace');
      
      const queries = queryGenerator.generateQueries(div);

      const byText = queries.find(q => q.type === 'getByText');
      expect(byText).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    test('handles elements with no identifiable attributes', () => {
      const div = createTestElement('div');
      const queries = queryGenerator.generateQueries(div);

      expect(queries).toHaveLength(0);
    });

    test('handles very long text content', () => {
      const longText = 'This is a button with extremely long text content that exceeds normal length limits and should test how the extension handles very lengthy button labels and text content that might be truncated or cause issues with query generation';
      const para = createTestElement('p', {}, longText);
      const queries = queryGenerator.generateQueries(para);

      // Should generate both regex-based and full text getByText queries for long text
      const byTextQueries = queries.filter(q => q.type === 'getByText');
      expect(byTextQueries.length).toBeGreaterThanOrEqual(1);
      
      // Should have at least one regex-based query
      const regexQuery = byTextQueries.find(q => q.query.startsWith('getByText(/'));
      expect(regexQuery).toBeDefined();
      
      // Should have the full text query as well
      const fullTextQuery = byTextQueries.find(q => q.query === `getByText('${longText}')`);
      expect(fullTextQuery).toBeDefined();
    });

    test('removes duplicate queries', () => {
      const input = createTestElement('input', {
        'aria-label': 'Username',
        'placeholder': 'Username'
      });

      const queries = queryGenerator.generateQueries(input);
      const queryStrings = queries.map(q => q.query);
      const uniqueQueries = [...new Set(queryStrings)];

      expect(queryStrings.length).toEqual(uniqueQueries.length);
    });
  });
});
