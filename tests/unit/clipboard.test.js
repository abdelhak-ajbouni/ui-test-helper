// Unit tests for clipboard functionality

describe('Clipboard Operations', () => {
  let mockCopyToClipboard;

  beforeEach(() => {
    // Mock the copyToClipboard function from the extension
    mockCopyToClipboard = async function(text) {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (err) {
        console.warn('Clipboard API failed:', err);
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

        if (successful) {
          return true;
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        console.error('All copy methods failed:', err);
        throw err;
      }
    };
  });

  describe('Modern Clipboard API', () => {
    test('successfully copies text using modern API', async() => {
      const testText = 'getByRole(\'button\', { name: \'Submit\' })';

      await mockCopyToClipboard(testText);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);
    });

    test('handles clipboard API rejection', async() => {
      const testText = 'getByText(\'Click me\')';

      // Make clipboard API fail
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Permission denied'));

      await mockCopyToClipboard(testText);

      // Should fall back to execCommand
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('Fallback Method', () => {
    test('uses fallback when clipboard API unavailable', async() => {
      const testText = 'getByLabelText(\'Email\')';

      // Disable modern clipboard API
      Object.defineProperty(window, 'isSecureContext', { value: false, writable: true });

      await mockCopyToClipboard(testText);

      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    test('creates and removes textarea element', async() => {
      const testText = 'getByPlaceholderText(\'Search...\')';

      // Disable modern clipboard API
      Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true });

      const initialTextareas = document.querySelectorAll('textarea').length;

      await mockCopyToClipboard(testText);

      const finalTextareas = document.querySelectorAll('textarea').length;
      expect(finalTextareas).toBe(initialTextareas); // Should be cleaned up
    });

    test('handles execCommand failure', async() => {
      const testText = 'getByTestId(\'submit-button\')';

      // Disable modern clipboard API and make execCommand fail
      Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true });
      document.execCommand.mockReturnValueOnce(false);

      await expect(mockCopyToClipboard(testText)).rejects.toThrow('Copy command failed');
    });
  });

  describe('Text Content Handling', () => {
    test('handles empty string', async() => {
      await mockCopyToClipboard('');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('');
    });

    test('handles special characters', async() => {
      const specialText = 'getByText(\'User\'s "Profile" & Settings\')';
      await mockCopyToClipboard(specialText);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(specialText);
    });

    test('handles long text', async() => {
      const longText = 'a'.repeat(1000);
      await mockCopyToClipboard(longText);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longText);
    });

    test('handles multi-line text', async() => {
      const multilineText = 'getByRole(\'button\',\n  { name: \'Submit\' }\n)';
      await mockCopyToClipboard(multilineText);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(multilineText);
    });
  });

  describe('Security Context', () => {
    test('detects secure context correctly', async() => {
      Object.defineProperty(window, 'isSecureContext', { value: true, writable: true });

      await mockCopyToClipboard('test');

      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    test('falls back when not in secure context', async() => {
      Object.defineProperty(window, 'isSecureContext', { value: false, writable: true });

      await mockCopyToClipboard('test');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });
});
