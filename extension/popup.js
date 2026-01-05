document.addEventListener('DOMContentLoaded', () => {
  const serverUrlInput = document.getElementById('serverUrl');
  const saveBtn = document.getElementById('saveBtn');
  const fillBtn = document.getElementById('fillBtn');
  const statusDiv = document.getElementById('status');
  const profileSelect = document.getElementById('profileSelect');
  const profileSection = document.getElementById('profileSection');

  let selectedProfileId = null;

  function setStatus(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
  }

  async function loadProfiles() {
    const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);
    if (!serverUrl) {
      profileSection.classList.remove('visible');
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/profiles`, { credentials: 'include' });
      
      if (response.status === 401) {
        profileSection.classList.remove('visible');
        return;
      }

      const data = await response.json();
      
      if (data.profiles && data.profiles.length > 0) {
        profileSection.classList.add('visible');
        profileSelect.innerHTML = data.profiles.map(p => 
          `<option value="${p.id}" ${p.id === data.activeProfileId ? 'selected' : ''}>${p.name}</option>`
        ).join('');
        selectedProfileId = data.activeProfileId || data.profiles[0].id;
      } else {
        profileSection.classList.remove('visible');
      }
    } catch (err) {
      profileSection.classList.remove('visible');
    }
  }

  chrome.storage.sync.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
      serverUrlInput.value = result.serverUrl;
      loadProfiles();
    }
  });

  saveBtn.addEventListener('click', () => {
    const url = serverUrlInput.value.replace(/\/$/, '');
    chrome.storage.sync.set({ serverUrl: url }, () => {
      setStatus('URL saved!', 'success');
      setTimeout(() => setStatus(''), 2000);
      loadProfiles();
    });
  });

  profileSelect.addEventListener('change', (e) => {
    selectedProfileId = e.target.value;
  });

  fillBtn.addEventListener('click', async () => {
    const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);
    if (!serverUrl) {
      setStatus('Please save your Server URL first.', 'error');
      return;
    }

    setStatus('Fetching profile...');
    fillBtn.disabled = true;

    try {
      let apiUrl = `${serverUrl}/api/autofill-data`;
      if (selectedProfileId) {
        apiUrl += `?profileId=${selectedProfileId}`;
      }
      
      const response = await fetch(apiUrl, { credentials: 'include' });
      
      if (response.status === 401) {
        setStatus('Please log in to SudoFillr first.', 'error');
        window.open(serverUrl, '_blank');
        fillBtn.disabled = false;
        return;
      }
      
      if (response.status === 403) {
        const err = await response.json();
        setStatus(err.message || 'Limit reached. Please upgrade.', 'error');
        fillBtn.disabled = false;
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const profile = await response.json();
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'fill', data: profile }, (response) => {
          if (chrome.runtime.lastError) {
            setStatus('Could not fill - refresh the page and try again.', 'error');
          } else {
            setStatus('Form filled successfully!', 'success');
          }
          fillBtn.disabled = false;
        });
      }
      
    } catch (err) {
      setStatus('Error: ' + err.message, 'error');
      fillBtn.disabled = false;
    }
  });
});
