// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fill') {
    fillForm(request.data);
    sendResponse({ status: 'done' });
  }
});

function fillForm(profile) {
  console.log("SudoFillr: Filling form with", profile);
  
  const inputs = document.querySelectorAll('input, textarea, select');
  
  // Helper to match label/name
  const match = (el, keywords) => {
    const name = (el.name || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const label = el.labels && el.labels[0] ? el.labels[0].innerText.toLowerCase() : '';
    const placeholder = (el.placeholder || '').toLowerCase();
    
    return keywords.some(k => name.includes(k) || id.includes(k) || label.includes(k) || placeholder.includes(k));
  };

  // 1. Basic Info
  inputs.forEach(input => {
    if (match(input, ['first name', 'firstname'])) input.value = profile.name ? profile.name.split(' ')[0] : '';
    if (match(input, ['last name', 'lastname', 'surname'])) input.value = profile.name ? profile.name.split(' ').slice(1).join(' ') : '';
    if (match(input, ['full name', 'fullname'])) input.value = profile.name || '';
    if (match(input, ['email', 'e-mail'])) input.value = profile.email || '';
    if (match(input, ['phone', 'mobile', 'cell'])) input.value = profile.phone || '';
    if (match(input, ['linkedin'])) input.value = profile.linkedin || '';
    if (match(input, ['portfolio', 'website', 'personal site'])) input.value = profile.portfolio || '';
  });

  // 2. Experience (Repeater)
  // This is tricky. We need to find "sets" of inputs.
  // Many sites use fieldsets or divs with class "job-entry" etc.
  // Simple heuristic: Look for inputs with 'company', 'title' in close proximity.
  
  if (profile.experience && profile.experience.length > 0) {
     // Try to find experience sections
     // This is a naive implementation. Real world requires more complex heuristics.
     const companyInputs = Array.from(inputs).filter(i => match(i, ['company', 'employer']));
     const titleInputs = Array.from(inputs).filter(i => match(i, ['title', 'position', 'role']));
     
     profile.experience.forEach((exp, i) => {
        if (companyInputs[i]) {
            companyInputs[i].value = exp.company;
            companyInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (titleInputs[i]) {
            titleInputs[i].value = exp.title;
            titleInputs[i].dispatchEvent(new Event('input', { bubbles: true }));
        }
        // ... dates, description
     });
  }
  
  // Trigger change events
  inputs.forEach(input => {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('blur', { bubbles: true }));
  });
}
