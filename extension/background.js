// Background service worker for handling keyboard commands and on-demand injection

/* global chrome */

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs.length > 0 ? tabs[0] : null;
}

function isScriptableUrl(url) {
  if (!url) return false;
  // Disallow chrome://, edge://, chrome-extension://, about:blank, etc.
  return /^(http|https|file):/i.test(url);
}

async function sendMessageSafe(tabId, message) {
  return new Promise((resolve) => {
    try {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        if (chrome.runtime.lastError) {
          resolve(undefined);
        } else {
          resolve(response);
        }
      });
    } catch (_e) {
      resolve(undefined);
    }
  });
}

async function ensureContentScripts(tabId) {
  // Try to ping first
  const ping = await sendMessageSafe(tabId, { action: 'ping' });
  if (ping && ping.success) return;

  // Inject CSS then scripts
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['inspector.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['query-generator.js'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['inspector.js'] });
}

async function toggleInspectorOnActiveTab() {
  const tab = await getActiveTab();
  if (!tab || !isScriptableUrl(tab.url)) {
    return; // Not a scriptable page
  }

  try {
    await ensureContentScripts(tab.id);

    // Check inspection state
    const status = await sendMessageSafe(tab.id, { action: 'getInspectionStatus' });
    if (status && status.isInspecting) {
      await sendMessageSafe(tab.id, { action: 'stopInspection' });
    } else {
      await sendMessageSafe(tab.id, { action: 'startInspection' });
    }
  } catch (error) {
    // Swallow errors; MV3 service worker should not crash
    console.error('Failed to toggle inspector:', error);
  }
}

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-inspector') {
    toggleInspectorOnActiveTab();
  }
});

// Click on toolbar icon toggles inspector and opens side panel on first run
chrome.action.onClicked.addListener(async () => {
  await toggleInspectorOnActiveTab();
  try {
    // Open side panel to show instructions the first time per tab
    const tab = await getActiveTab();
    if (tab && isScriptableUrl(tab.url)) {
      await chrome.sidePanel.open({ tabId: tab.id });
      await chrome.sidePanel.setOptions({ tabId: tab.id, path: 'sidepanel.html', enabled: true });
    }
  } catch (e) {
    // Side panel may not be available in all Chrome versions
  }
});


