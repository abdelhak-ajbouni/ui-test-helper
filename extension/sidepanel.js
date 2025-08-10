/* global chrome */

async function queryActiveTabId() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

async function sendMessage(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) return resolve(undefined);
      resolve(response);
    });
  });
}

async function ensureInjected(tabId) {
  const ping = await sendMessage(tabId, { action: 'ping' });
  if (ping && ping.success) return;
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['inspector.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['query-generator.js'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['inspector.js'] });
}

async function refreshStatus() {
  const tabId = await queryActiveTabId();
  if (!tabId) return;
  const statusEl = document.getElementById('status');
  try {
    const res = await sendMessage(tabId, { action: 'getInspectionStatus' });
    const active = !!(res && res.isInspecting);
    statusEl.classList.toggle('active', active);
  } catch (_) {
    statusEl.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle');
  const docsBtn = document.getElementById('openDocs');

  toggleBtn.addEventListener('click', async () => {
    const tabId = await queryActiveTabId();
    if (!tabId) return;
    await ensureInjected(tabId);
    const res = await sendMessage(tabId, { action: 'getInspectionStatus' });
    if (res && res.isInspecting) {
      await sendMessage(tabId, { action: 'stopInspection' });
    } else {
      await sendMessage(tabId, { action: 'startInspection' });
    }
    refreshStatus();
  });

  docsBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://testing-library.com/docs/queries/about/' });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.action === 'inspectionStopped') refreshStatus();
  });

  refreshStatus();
});


