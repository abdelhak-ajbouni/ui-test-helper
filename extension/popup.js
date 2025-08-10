document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startInspection');
  const status = document.getElementById('status');

  let isInspecting = false;

  // Check if inspection is already active (only if content script is loaded)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getInspectionStatus' }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not loaded yet, that's normal
        return;
      }
      if (response && response.isInspecting) {
        setInspectingState(true);
      }
    });
  });

  // Add keyboard support for closing popup with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Popup will close automatically in Chrome extensions when Escape is pressed
      // This is just for user feedback
      document.body.style.opacity = '0.5';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    }
  });

  startBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!isInspecting) {
        // Inject content script first
        await injectContentScript(tab.id);

        // Start inspection
        chrome.tabs.sendMessage(tab.id, { action: 'startInspection' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error starting inspection:', chrome.runtime.lastError);
            showError('Could not start inspection. Please try reloading the page.');
            return;
          }
          if (response && response.success) {
            setInspectingState(true);
          }
        });
      } else {
        // Stop inspection
        chrome.tabs.sendMessage(tab.id, { action: 'stopInspection' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error stopping inspection:', chrome.runtime.lastError);
            return;
          }
          if (response && response.success) {
            setInspectingState(false);
          }
        });
      }

      // Close the popup after action for a snappy UX
      window.close();
    } catch (error) {
      console.error('Error in inspection toggle:', error);
      showError('Could not access the current tab. Make sure you\'re on a regular webpage (not chrome:// or extension pages).');
    }
  });

  async function injectContentScript(tabId) {
    try {
      // Check if content script is already injected
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
          if (chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve(response);
          }
        });
      });

      if (!response) {
        // Inject CSS first
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['inspector.css']
        });

        // Then inject JavaScript - query generator first, then inspector
        await chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['query-generator.js'] });
        await chrome.scripting.executeScript({ target: { tabId: tabId }, files: ['inspector.js'] });
      }
    } catch (error) {
      console.error('Failed to inject content script:', error);
      console.error('Error details:', error.message);
      showError('Failed to load extension scripts. This may happen on special pages like chrome:// URLs.');
      throw error;
    }
  }

  function setInspectingState(inspecting) {
    isInspecting = inspecting;

    if (inspecting) {
      startBtn.textContent = '🛑 Stop Inspection';
      startBtn.classList.add('active');
      status.classList.remove('hidden');
      status.querySelector('.status-text').textContent = 'Inspection mode active - Click any element';
    } else {
      startBtn.innerHTML = '<span class="icon">🔍</span>Start Inspection';
      startBtn.classList.remove('active');
      status.classList.add('hidden');
    }
  }

  // Error handling function
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background: #fed7d7;
      color: #c53030;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 12px 0;
      font-size: 12px;
      border: 1px solid #feb2b2;
    `;

    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(error => error.remove());

    // Add new error message
    const container = document.querySelector('.container');
    container.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }

  // Listen for inspection status changes
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.action === 'inspectionStopped') {
      setInspectingState(false);
    }
  });
});
