// Unit tests for query generation functionality
const QueryGenerator = require('../../extension/query-generator.js');

describe('Query Generator', () => {
  let queryGenerator;

  beforeEach(() => {
    queryGenerator = new QueryGenerator();
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

  describe('Edge Cases', () => {
    test('handles elements with no identifiable attributes', () => {
      const div = createTestElement('div');
      const queries = queryGenerator.generateQueries(div);

      expect(queries).toHaveLength(0);
    });

    test('handles very long text content', () => {
      const longText = 'a'.repeat(100);
      const para = createTestElement('p', {}, longText);
      const queries = queryGenerator.generateQueries(para);

      // Should generate regex-based getByText for long semantic text
      const byText = queries.find(q => q.type === 'getByText');
      expect(byText).toBeDefined();
      expect(byText.query.startsWith('getByText(/')).toBe(true);
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
