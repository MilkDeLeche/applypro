// PostulaPro Content Script
// Adds floating autofill button and handles form filling

(function() {
  // Prevent multiple injections
  if (window.postulaProInjected) return;
  window.postulaProInjected = true;

  let floatingButton = null;
  let isLoading = false;

  // Create the floating autofill button
  function createFloatingButton() {
    if (floatingButton) return;

    floatingButton = document.createElement('div');
    floatingButton.id = 'postulapro-button';
    floatingButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <span class="postulapro-text">Fill</span>
    `;
    
    // Apply styles
    const style = document.createElement('style');
    style.textContent = `
      #postulapro-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 10px 14px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        border-radius: 50px;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
        opacity: 0;
        transform: translateY(10px) scale(0.95);
        pointer-events: none;
      }
      #postulapro-button.visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      #postulapro-button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5), 0 3px 6px rgba(0,0,0,0.15);
      }
      #postulapro-button:active {
        transform: translateY(0) scale(0.98);
      }
      #postulapro-button.loading {
        pointer-events: none;
        opacity: 0.7;
      }
      #postulapro-button.loading .postulapro-text {
        display: none;
      }
      #postulapro-button.loading::after {
        content: 'Filling...';
      }
      #postulapro-button.success {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }
      #postulapro-button.success .postulapro-text {
        display: none;
      }
      #postulapro-button.success::after {
        content: 'Done!';
      }
      #postulapro-button svg {
        flex-shrink: 0;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(floatingButton);
    
    floatingButton.addEventListener('click', handleAutofillClick);
  }

  // Check if page has fillable form fields
  function hasFillableFields() {
    const inputs = document.querySelectorAll(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([disabled]):not([readonly]), ' +
      'textarea:not([disabled]):not([readonly])'
    );
    return inputs.length > 0;
  }

  // Show/hide the floating button based on form fields
  function updateButtonVisibility() {
    if (!floatingButton) createFloatingButton();
    
    if (hasFillableFields()) {
      floatingButton.classList.add('visible');
    } else {
      floatingButton.classList.remove('visible');
    }
  }

  // Handle autofill button click
  async function handleAutofillClick() {
    if (isLoading) return;
    
    isLoading = true;
    floatingButton.classList.add('loading');
    floatingButton.classList.remove('success');
    
    try {
      const { serverUrl } = await chrome.storage.sync.get(['serverUrl']);
      
      if (!serverUrl) {
        alert('Please configure PostulaPro: Click the extension icon and enter your server URL.');
        isLoading = false;
        floatingButton.classList.remove('loading');
        return;
      }
      
      const response = await fetch(`${serverUrl}/api/autofill-data`, { 
        credentials: 'include' 
      });
      
      if (response.status === 401) {
        alert('Please log in to PostulaPro first, then try again.');
        window.open(serverUrl, '_blank');
        isLoading = false;
        floatingButton.classList.remove('loading');
        return;
      }
      
      if (response.status === 403) {
        const err = await response.json();
        alert(err.message || 'Autofill limit reached. Please upgrade your plan.');
        isLoading = false;
        floatingButton.classList.remove('loading');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      
      const profile = await response.json();
      fillForm(profile);
      
      floatingButton.classList.remove('loading');
      floatingButton.classList.add('success');
      
      setTimeout(() => {
        floatingButton.classList.remove('success');
      }, 2000);
      
    } catch (err) {
      console.error('PostulaPro error:', err);
      alert('Error filling form. Please check your connection and try again.');
      floatingButton.classList.remove('loading');
    }
    
    isLoading = false;
  }

  // Initialize on page load
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(updateButtonVisibility, 500);
      });
    } else {
      setTimeout(updateButtonVisibility, 500);
    }
    
    // Watch for dynamic content changes
    const observer = new MutationObserver(() => {
      updateButtonVisibility();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  init();

  // Listen for messages from popup (legacy support)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fill') {
      fillForm(request.data);
      sendResponse({ status: 'done' });
    }
  });

  // ============================================
  // FORM FILLING LOGIC
  // ============================================

  function fillForm(profile) {
    console.log("PostulaPro: Starting autofill with profile data:", profile);
    
    // Get user data from the nested structure
    const user = profile.user || profile;
    const experience = profile.experience || [];
    const education = profile.education || [];
    
    console.log("PostulaPro: User data:", user);
    console.log("PostulaPro: Experience:", experience);
    console.log("PostulaPro: Education:", education);
    
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
      
      console.log(`PostulaPro: Filled "${input.name || input.id || 'unknown'}" with "${value}"`);
      return true;
    }
    
    // Helper to split camelCase/PascalCase before lowercasing
    function splitCamelCase(str) {
      return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .toLowerCase();
    }
    
    // Get all text for an input (name, id, placeholder, label, aria-label)
    function getFieldIdentifiers(el) {
      const texts = [];
      
      if (el.name) texts.push(splitCamelCase(el.name));
      if (el.id) texts.push(splitCamelCase(el.id));
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
        // Strict word boundary matching to avoid false positives
        const regex = new RegExp(`(^|[^a-z0-9])${keyword}([^a-z0-9]|$)`, 'i');
        return regex.test(text);
      });
    }
    
    // Check if field matches any exclusion keywords
    function matchesExclusion(el, exclusions) {
      const text = getFieldIdentifiers(el);
      return exclusions.some(keyword => {
        // For exclusions, match if the keyword appears as a separate word
        const regex = new RegExp(`(^|[^a-z0-9])${keyword}([^a-z0-9]|$)`, 'i');
        return regex.test(text);
      });
    }
    
    // Detect if user has LATAM profile (double last names)
    const isLatam = user.paternalLastName || user.maternalLastName;
    
    // Build full name based on profile type
    const fullName = isLatam
      ? [user.firstName, user.paternalLastName, user.maternalLastName].filter(Boolean).join(' ')
      : [user.firstName, user.lastName].filter(Boolean).join(' ');
    
    // Combined last name for LATAM (some forms want single field)
    const combinedLastName = isLatam
      ? [user.paternalLastName, user.maternalLastName].filter(Boolean).join(' ')
      : user.lastName;
    
    // Get all fillable inputs
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea');
    
    let filledCount = 0;
    
    inputs.forEach(input => {
      // Skip if input is disabled, readonly, or already filled
      if (input.disabled || input.readOnly) return;
      
      // First Name / Nombre
      if (matchesField(input, ['firstname', 'first_name', 'first-name', 'fname', 'given-name', 'givenname', 'nombre', 'nombres', 'primer_nombre'])) {
        if (setValue(input, user.firstName)) filledCount++;
        return;
      }
      
      // Paternal Last Name / Apellido Paterno (LATAM)
      if (matchesField(input, ['paternal', 'apellido_paterno', 'apellidopaterno', 'apellido-paterno', 'ap_paterno', 'primer_apellido', 'primerapellido'])) {
        if (setValue(input, user.paternalLastName)) filledCount++;
        return;
      }
      
      // Maternal Last Name / Apellido Materno (LATAM)
      if (matchesField(input, ['maternal', 'apellido_materno', 'apellidomaterno', 'apellido-materno', 'ap_materno', 'segundo_apellido', 'segundoapellido'])) {
        if (setValue(input, user.maternalLastName)) filledCount++;
        return;
      }
      
      // Regular Last Name / Apellido (combines both for LATAM if needed)
      if (matchesField(input, ['lastname', 'last_name', 'last-name', 'lname', 'surname', 'family-name', 'familyname', 'apellido', 'apellidos'])) {
        if (setValue(input, combinedLastName)) filledCount++;
        return;
      }
      
      // Full Name (check after first/last to avoid conflicts)
      const nameExclusions = ['company', 'employer', 'organization', 'job', 'title', 'position', 'school', 'university', 'file', 'domain', 'user'];
      if (matchesField(input, ['fullname', 'full_name', 'full-name', 'your-name', 'yourname', 'applicant-name', 'nombre_completo', 'nombrecompleto']) && 
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
        if (matchesField(input, ['country', 'nation', 'pais'])) {
          // Map country codes to full names for some forms
          const countryNames = {
            'us': 'United States',
            'mx': 'Mexico',
            'cl': 'Chile'
          };
          const countryValue = countryNames[user.country] || user.country;
          if (setValue(input, countryValue)) filledCount++;
          return;
        }
      }
      
      // LATAM-specific fields
      
      // RFC (Mexico tax ID)
      if (user.rfc) {
        if (matchesField(input, ['rfc', 'registro_federal', 'registrofederal', 'taxid_mx'])) {
          if (setValue(input, user.rfc)) filledCount++;
          return;
        }
      }
      
      // CURP (Mexico ID)
      if (user.curp) {
        if (matchesField(input, ['curp', 'clave_unica', 'claveunica'])) {
          if (setValue(input, user.curp)) filledCount++;
          return;
        }
      }
      
      // RUT (Chile tax ID)
      if (user.rut) {
        if (matchesField(input, ['rut', 'run', 'rut_run', 'taxid_cl'])) {
          if (setValue(input, user.rut)) filledCount++;
          return;
        }
      }
      
      // Colonia (Mexico neighborhood)
      if (user.colonia) {
        if (matchesField(input, ['colonia', 'neighborhood', 'barrio'])) {
          if (setValue(input, user.colonia)) filledCount++;
          return;
        }
      }
      
      // Delegacion/Municipio (Mexico)
      if (user.delegacion) {
        if (matchesField(input, ['delegacion', 'municipio', 'alcaldia', 'delegation'])) {
          if (setValue(input, user.delegacion)) filledCount++;
          return;
        }
      }
      
      // Comuna (Chile)
      if (user.comuna) {
        if (matchesField(input, ['comuna', 'commune', 'district'])) {
          if (setValue(input, user.comuna)) filledCount++;
          return;
        }
      }
      
      // Region (Chile)
      if (user.region) {
        if (matchesField(input, ['region', 'provincia'])) {
          if (setValue(input, user.region)) filledCount++;
          return;
        }
      }
      
      // Phone Country Code
      if (user.phoneCountryCode) {
        if (matchesField(input, ['countrycode', 'country_code', 'phone_code', 'codigo_pais', 'lada'])) {
          if (setValue(input, user.phoneCountryCode)) filledCount++;
          return;
        }
      }
    });
    
    // Detect if page is likely English-based (for deciding which version to use)
    const isEnglishPage = document.documentElement.lang?.startsWith('en') || 
                          !document.documentElement.lang ||
                          /linkedin|indeed|workday|greenhouse|lever|ashby|bamboo/i.test(window.location.hostname);
    
    // Helper to get title/description - prefer English translation for English sites, original for Spanish sites
    function getLocalizedValue(original, english) {
      if (isEnglishPage && english) return english;
      return original;
    }
    
    // Experience fields - try to fill company and title if present
    if (experience.length > 0) {
      const companyInputs = Array.from(inputs).filter(i => matchesField(i, ['company', 'employer', 'organization', 'companyname', 'company_name', 'empresa']));
      const titleInputs = Array.from(inputs).filter(i => matchesField(i, ['title', 'position', 'role', 'jobtitle', 'job_title', 'job-title', 'puesto', 'cargo']));
      const descriptionInputs = Array.from(inputs).filter(i => matchesField(i, ['description', 'responsibilities', 'duties', 'summary', 'descripcion', 'funciones']));
      
      experience.forEach((exp, i) => {
        if (companyInputs[i] && exp.company) {
          if (setValue(companyInputs[i], exp.company)) filledCount++;
        }
        if (titleInputs[i]) {
          const title = getLocalizedValue(exp.title, exp.titleEnglish);
          if (title && setValue(titleInputs[i], title)) filledCount++;
        }
        if (descriptionInputs[i]) {
          const desc = getLocalizedValue(exp.description, exp.descriptionEnglish);
          if (desc && setValue(descriptionInputs[i], desc)) filledCount++;
        }
      });
      
      // If there's just one company/title field, fill with most recent experience
      if (companyInputs.length === 1 && experience[0]?.company) {
        setValue(companyInputs[0], experience[0].company);
      }
      if (titleInputs.length === 1 && experience[0]) {
        const title = getLocalizedValue(experience[0].title, experience[0].titleEnglish);
        if (title) setValue(titleInputs[0], title);
      }
    }
    
    // Education fields
    if (education.length > 0) {
      const schoolInputs = Array.from(inputs).filter(i => matchesField(i, ['school', 'university', 'college', 'institution', 'schoolname', 'universidad', 'escuela', 'institucion']));
      const degreeInputs = Array.from(inputs).filter(i => matchesField(i, ['degree', 'qualification', 'certification', 'titulo', 'grado']));
      const majorInputs = Array.from(inputs).filter(i => matchesField(i, ['major', 'field', 'fieldofstudy', 'field_of_study', 'concentration', 'specialization', 'carrera', 'especialidad']));
      
      education.forEach((edu, i) => {
        if (schoolInputs[i] && edu.school) {
          if (setValue(schoolInputs[i], edu.school)) filledCount++;
        }
        if (degreeInputs[i]) {
          const degree = getLocalizedValue(edu.degree, edu.degreeEnglish);
          if (degree && setValue(degreeInputs[i], degree)) filledCount++;
        }
        if (majorInputs[i]) {
          const major = getLocalizedValue(edu.major, edu.majorEnglish);
          if (major && setValue(majorInputs[i], major)) filledCount++;
        }
      });
      
      // If there's just one school/degree field, fill with most recent education
      if (schoolInputs.length === 1 && education[0]?.school) {
        setValue(schoolInputs[0], education[0].school);
      }
      if (degreeInputs.length === 1 && education[0]) {
        const degree = getLocalizedValue(education[0].degree, education[0].degreeEnglish);
        if (degree) setValue(degreeInputs[0], degree);
      }
    }
    
    // Cover Letter filling
    const activeProfile = profile.profile || profile;
    const coverLetter = activeProfile.coverLetter;
    if (coverLetter) {
      console.log("PostulaPro: Looking for cover letter fields...");
      const coverLetterInputs = Array.from(inputs).filter(i => {
        return i.tagName === 'TEXTAREA' && 
          matchesField(i, ['coverletter', 'cover_letter', 'cover-letter', 'coverlettertext', 'carta_presentacion', 'carta-presentacion', 'cartapresentacion', 'motivation', 'motivationletter', 'whyhire', 'why_hire', 'about_yourself', 'aboutyourself', 'tell_us', 'tellus']);
      });
      
      // Also check for textareas with common cover letter patterns in labels/placeholders
      const allTextareas = document.querySelectorAll('textarea:not([disabled]):not([readonly])');
      allTextareas.forEach(textarea => {
        const text = getFieldIdentifiers(textarea);
        if ((text.includes('cover') && text.includes('letter')) ||
            (text.includes('carta') && text.includes('presentacion')) ||
            text.includes('why should we hire') ||
            text.includes('tell us about yourself') ||
            text.includes('why are you interested') ||
            text.includes('motivation')) {
          if (!coverLetterInputs.includes(textarea)) {
            coverLetterInputs.push(textarea);
          }
        }
      });
      
      coverLetterInputs.forEach(textarea => {
        if (setValue(textarea, coverLetter)) {
          filledCount++;
          console.log("PostulaPro: Filled cover letter field");
        }
      });
    }
    
    console.log(`PostulaPro: Autofill complete! Filled ${filledCount} fields.`);
  }
})();
