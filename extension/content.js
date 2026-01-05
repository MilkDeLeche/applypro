// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fill') {
    fillForm(request.data);
    sendResponse({ status: 'done' });
  }
});

function fillForm(profile) {
  console.log("SudoFillr: Starting autofill with profile data:", profile);
  
  // Get user data from the nested structure
  const user = profile.user || profile;
  const experience = profile.experience || [];
  const education = profile.education || [];
  
  console.log("SudoFillr: User data:", user);
  console.log("SudoFillr: Experience:", experience);
  console.log("SudoFillr: Education:", education);
  
  // Helper to set value and trigger events for React/Vue/Angular compatibility
  function setValue(input, value) {
    if (!value || !input) return false;
    
    // Skip if already filled with the same value
    if (input.value === value) return false;
    
    // For React, we need to set the native value setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
    
    if (input.tagName === 'INPUT' && nativeInputValueSetter) {
      nativeInputValueSetter.call(input, value);
    } else if (input.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(input, value);
    } else {
      input.value = value;
    }
    
    // Dispatch events that React/Vue/Angular listen to
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    
    console.log(`SudoFillr: Filled "${input.name || input.id || 'unknown'}" with "${value}"`);
    return true;
  }
  
  // Get all text for an input (name, id, placeholder, label, aria-label)
  function getFieldIdentifiers(el) {
    const texts = [];
    
    if (el.name) texts.push(el.name.toLowerCase());
    if (el.id) texts.push(el.id.toLowerCase());
    if (el.placeholder) texts.push(el.placeholder.toLowerCase());
    if (el.getAttribute('aria-label')) texts.push(el.getAttribute('aria-label').toLowerCase());
    if (el.getAttribute('autocomplete')) texts.push(el.getAttribute('autocomplete').toLowerCase());
    
    // Get associated label text
    if (el.labels && el.labels.length > 0) {
      for (const label of el.labels) {
        texts.push(label.innerText.toLowerCase().trim());
      }
    }
    
    // Check for label with matching "for" attribute
    if (el.id) {
      const labelFor = document.querySelector(`label[for="${el.id}"]`);
      if (labelFor) {
        texts.push(labelFor.innerText.toLowerCase().trim());
      }
    }
    
    // Check parent/sibling labels
    const parent = el.closest('.form-group, .field, .input-group, div');
    if (parent) {
      const nearbyLabel = parent.querySelector('label, .label, span');
      if (nearbyLabel && nearbyLabel.innerText) {
        texts.push(nearbyLabel.innerText.toLowerCase().trim());
      }
    }
    
    return texts.join(' ');
  }
  
  // Check if field matches any of the keywords using strict word boundaries
  function matchesField(el, keywords) {
    const text = getFieldIdentifiers(el);
    return keywords.some(keyword => {
      // Strict word boundary matching to avoid false positives (e.g., "name" matching "companyName")
      // This regex ensures the keyword is either at word boundary or separated by common delimiters
      const regex = new RegExp(`(^|[^a-z0-9])${keyword}([^a-z0-9]|$)`, 'i');
      return regex.test(text);
    });
  }
  
  // Check if field matches any exclusion keywords (uses substring matching for exclusions)
  function matchesExclusion(el, exclusions) {
    const text = getFieldIdentifiers(el);
    return exclusions.some(keyword => {
      // For exclusions, we want to match if the keyword appears anywhere as a separate word
      const regex = new RegExp(`(^|[^a-z0-9])${keyword}([^a-z0-9]|$)`, 'i');
      return regex.test(text);
    });
  }
  
  // Build full name from first and last
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  
  // Get all fillable inputs
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea');
  
  let filledCount = 0;
  
  inputs.forEach(input => {
    // Skip if input is disabled, readonly, or already filled
    if (input.disabled || input.readOnly) return;
    
    // First Name
    if (matchesField(input, ['firstname', 'first_name', 'first-name', 'fname', 'given-name', 'givenname'])) {
      if (setValue(input, user.firstName)) filledCount++;
      return;
    }
    
    // Last Name
    if (matchesField(input, ['lastname', 'last_name', 'last-name', 'lname', 'surname', 'family-name', 'familyname'])) {
      if (setValue(input, user.lastName)) filledCount++;
      return;
    }
    
    // Full Name (check after first/last to avoid conflicts)
    // Strict exclusion list to avoid filling company/job fields with person's name
    const nameExclusions = ['company', 'employer', 'organization', 'job', 'title', 'position', 'school', 'university', 'file', 'domain', 'user'];
    if (matchesField(input, ['fullname', 'full_name', 'full-name', 'your-name', 'yourname', 'applicant-name']) && 
        !matchesExclusion(input, nameExclusions)) {
      if (setValue(input, fullName)) filledCount++;
      return;
    }
    
    // Email
    if (matchesField(input, ['email', 'e-mail', 'emailaddress', 'email_address']) || input.type === 'email') {
      if (setValue(input, user.email)) filledCount++;
      return;
    }
    
    // Phone
    if (matchesField(input, ['phone', 'telephone', 'tel', 'mobile', 'cell', 'phonenumber', 'phone_number', 'phone-number']) || input.type === 'tel') {
      if (setValue(input, user.phone)) filledCount++;
      return;
    }
    
    // LinkedIn
    if (matchesField(input, ['linkedin', 'linked-in', 'linkedin-url', 'linkedinurl', 'linkedin_url'])) {
      if (setValue(input, user.linkedin)) filledCount++;
      return;
    }
    
    // Portfolio/Website
    if (matchesField(input, ['portfolio', 'website', 'personal-site', 'personalsite', 'homepage', 'personal-website', 'url']) &&
        !matchesField(input, ['linkedin', 'github', 'twitter'])) {
      if (setValue(input, user.portfolio)) filledCount++;
      return;
    }
    
    // Address fields (if user has them)
    if (user.address) {
      if (matchesField(input, ['address', 'street', 'streetaddress', 'street_address', 'address1', 'address-line-1', 'addressline1'])) {
        if (setValue(input, user.address)) filledCount++;
        return;
      }
    }
    
    if (user.city) {
      if (matchesField(input, ['city', 'town', 'locality'])) {
        if (setValue(input, user.city)) filledCount++;
        return;
      }
    }
    
    if (user.state) {
      if (matchesField(input, ['state', 'province', 'region', 'administrative-area'])) {
        if (setValue(input, user.state)) filledCount++;
        return;
      }
    }
    
    if (user.zip || user.zipcode || user.postalCode) {
      if (matchesField(input, ['zip', 'zipcode', 'zip_code', 'postal', 'postalcode', 'postal_code', 'postcode'])) {
        if (setValue(input, user.zip || user.zipcode || user.postalCode)) filledCount++;
        return;
      }
    }
    
    if (user.country) {
      if (matchesField(input, ['country', 'nation'])) {
        if (setValue(input, user.country)) filledCount++;
        return;
      }
    }
  });
  
  // Experience fields - try to fill company and title if present
  if (experience.length > 0) {
    const companyInputs = Array.from(inputs).filter(i => matchesField(i, ['company', 'employer', 'organization', 'companyname', 'company_name']));
    const titleInputs = Array.from(inputs).filter(i => matchesField(i, ['title', 'position', 'role', 'jobtitle', 'job_title', 'job-title']));
    const descriptionInputs = Array.from(inputs).filter(i => matchesField(i, ['description', 'responsibilities', 'duties', 'summary']));
    
    experience.forEach((exp, i) => {
      if (companyInputs[i] && exp.company) {
        if (setValue(companyInputs[i], exp.company)) filledCount++;
      }
      if (titleInputs[i] && exp.title) {
        if (setValue(titleInputs[i], exp.title)) filledCount++;
      }
      if (descriptionInputs[i] && exp.description) {
        if (setValue(descriptionInputs[i], exp.description)) filledCount++;
      }
    });
    
    // If there's just one company/title field, fill with most recent experience
    if (companyInputs.length === 1 && experience[0]?.company) {
      setValue(companyInputs[0], experience[0].company);
    }
    if (titleInputs.length === 1 && experience[0]?.title) {
      setValue(titleInputs[0], experience[0].title);
    }
  }
  
  // Education fields
  if (education.length > 0) {
    const schoolInputs = Array.from(inputs).filter(i => matchesField(i, ['school', 'university', 'college', 'institution', 'schoolname']));
    const degreeInputs = Array.from(inputs).filter(i => matchesField(i, ['degree', 'qualification', 'certification']));
    const majorInputs = Array.from(inputs).filter(i => matchesField(i, ['major', 'field', 'fieldofstudy', 'field_of_study', 'concentration', 'specialization']));
    
    education.forEach((edu, i) => {
      if (schoolInputs[i] && edu.school) {
        if (setValue(schoolInputs[i], edu.school)) filledCount++;
      }
      if (degreeInputs[i] && edu.degree) {
        if (setValue(degreeInputs[i], edu.degree)) filledCount++;
      }
      if (majorInputs[i] && edu.major) {
        if (setValue(majorInputs[i], edu.major)) filledCount++;
      }
    });
    
    // If there's just one school/degree field, fill with most recent education
    if (schoolInputs.length === 1 && education[0]?.school) {
      setValue(schoolInputs[0], education[0].school);
    }
    if (degreeInputs.length === 1 && education[0]?.degree) {
      setValue(degreeInputs[0], education[0].degree);
    }
  }
  
  console.log(`SudoFillr: Autofill complete! Filled ${filledCount} fields.`);
}
