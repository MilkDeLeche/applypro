document.addEventListener('DOMContentLoaded', () => {
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const fillBtn = document.getElementById('fillBtn');
  const statusDiv = document.getElementById('status');

  // Load saved URL
  chrome.storage.sync.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
      serverUrlInput.value = result.serverUrl;
    }
  });

  saveBtn.addEventListener('click', () => {
    const url = serverUrlInput.value.replace(/\/$/, ''); // Remove trailing slash
    chrome.storage.sync.set({ serverUrl: url }, () => {
      statusDiv.textContent = 'URL saved!';
      setTimeout(() => statusDiv.textContent = '', 2000);
    });
  });

  fillBtn.addEventListener('click', async () => {
    const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);
    if (!serverUrl) {
      statusDiv.textContent = 'Please save your Server URL first.';
      return;
    }

    statusDiv.textContent = 'Fetching profile...';

    try {
      // We need to fetch from the server. 
      // Note: The server must support CORS or we need host_permissions.
      // We added <all_urls> to host_permissions, so we can fetch from the extension context.
      // BUT, usually we want the content script to fill.
      // We'll send a message to the content script with the data.
      
      const response = await fetch(`${serverUrl}/api/profile`); // This might fail if not logged in?
      // Wait, if it's Replit Auth, the browser cookies *might* work if we fetch from the extension popup?
      // No, extension popup has its own cookie jar usually, unless we use "cookies" permission?
      // Actually, if the user logs in on the Replit tab, the cookie is set for that domain.
      // Fetching from extension popup to that domain *should* send cookies if we set credentials: 'include'.
      
      if (response.status === 401) {
        statusDiv.textContent = 'Please log in to SudoFillr in a new tab.';
        window.open(serverUrl, '_blank');
        return;
      }
      
      const profile = await response.json();
      
      // Send data to content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'fill', data: profile }, (response) => {
           statusDiv.textContent = 'Filled!';
        });
      }
      
    } catch (err) {
      statusDiv.textContent = 'Error: ' + err.message;
    }
  });
});
