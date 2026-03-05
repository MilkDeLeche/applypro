import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Supported locales
export type Locale = "en" | "es-MX" | "es-CL";
export type Country = "us" | "mx" | "cl" | "other";

// Currency configuration per country
export const CURRENCY_CONFIG: Record<Country, { code: string; symbol: string; locale: string }> = {
  us: { code: "USD", symbol: "$", locale: "en-US" },
  mx: { code: "MXN", symbol: "$", locale: "es-MX" },
  cl: { code: "CLP", symbol: "$", locale: "es-CL" },
  other: { code: "USD", symbol: "$", locale: "en-US" },
};

// Pricing per country (yearly amounts; monthly: standard $7, pro $10)
export const PRICING: Record<Country, { standard: number; pro: number; standardMonthly: number; proMonthly: number }> = {
  us: { standard: 70, pro: 80, standardMonthly: 7, proMonthly: 10 },
  mx: { standard: 1300, pro: 1500, standardMonthly: 130, proMonthly: 150 },
  cl: { standard: 65000, pro: 75000, standardMonthly: 6500, proMonthly: 7500 },
  other: { standard: 70, pro: 80, standardMonthly: 7, proMonthly: 10 },
};

interface I18nContextType {
  locale: Locale;
  country: Country;
  setLocale: (locale: Locale) => void;
  setCountry: (country: Country) => void;
  t: (key: string) => string;
  formatPrice: (amount: number, currency?: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Detect country from browser settings
function detectCountry(): Country {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language.toLowerCase();
  
  // Check timezone first (more reliable)
  if (timezone.includes("Mexico") || timezone.includes("America/Mexico")) {
    return "mx";
  }
  if (timezone.includes("Santiago") || timezone.includes("America/Santiago")) {
    return "cl";
  }
  if (timezone.includes("America/New_York") || timezone.includes("America/Los_Angeles") || 
      timezone.includes("America/Chicago") || timezone.includes("America/Denver")) {
    return "us";
  }
  
  // Fallback to language
  if (language.includes("es-mx") || language === "es-419") {
    return "mx";
  }
  if (language.includes("es-cl")) {
    return "cl";
  }
  if (language.startsWith("en")) {
    return "us";
  }
  
  return "other";
}

function getLocaleFromCountry(country: Country): Locale {
  switch (country) {
    case "mx": return "es-MX";
    case "cl": return "es-CL";
    default: return "en";
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [country, setCountryState] = useState<Country>(() => {
    const saved = localStorage.getItem("postulapro-country");
    return (saved as Country) || detectCountry();
  });
  
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("postulapro-locale");
    return (saved as Locale) || getLocaleFromCountry(country);
  });

  // When country changes, also update locale
  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    setLocale(getLocaleFromCountry(newCountry));
  };

  useEffect(() => {
    localStorage.setItem("postulapro-country", country);
    localStorage.setItem("postulapro-locale", locale);
  }, [country, locale]);

  const t = (key: string): string => {
    const translations = TRANSLATIONS[locale] || TRANSLATIONS["en"];
    return translations[key] || TRANSLATIONS["en"][key] || key;
  };

  const formatPrice = (amount: number, currencyCode?: string): string => {
    const config = CURRENCY_CONFIG[country];
    const code = currencyCode || config.code;
    
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "CLP" ? 0 : 2,
      maximumFractionDigits: code === "CLP" ? 0 : 2,
    }).format(amount);
  };

  return (
    <I18nContext.Provider value={{ locale, country, setLocale, setCountry, t, formatPrice }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

// Translation strings
type TranslationKeys = Record<string, string>;

const TRANSLATIONS: Record<Locale, TranslationKeys> = {
  "en": {
    // Navigation
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.pricing": "Pricing",
    "nav.extension": "Extension",
    "nav.settings": "Settings",
    "nav.login": "Log In",
    "nav.logout": "Log Out",
    
    // Landing page
    "landing.hero.title": "Apply to Jobs",
    "landing.hero.highlight": "10x Faster",
    "landing.hero.subtitle": "Stop the endless copy-paste. No more Google autofill mixing your name with usernames. Upload once—we fill everywhere. Cover letters, interview prep—we've got you.",
    "landing.hero.cta": "Get Started Free",
    "landing.hero.badge": "The LATAM Remote Job Engine",
    "landing.hero.welcome": "Your resume data stays yours. Never sold. Never shared.",
    "landing.hero.welcome.secondary": "Fill applications in seconds, not hours.",
    "landing.cta.chrome": "Add to Chrome — Free",
    "landing.cta.howItWorks": "See How It Works",
    "landing.hero.extensionPlaceholder": "Extension UI Placeholder",
    "landing.features.ai.title": "AI Parsing",
    "landing.features.ai.desc": "We use advanced LLMs to extract every detail from your PDF resume correctly.",
    "landing.features.autofill.title": "One-Click Fill",
    "landing.features.autofill.desc": "Our Chrome extension automatically fills job applications on any website.",
    "landing.features.autofill.bullet1": "No more Google autofill mixing your name with usernames",
    "landing.features.autofill.bullet2": "Injects the correct PDF per persona",
    "landing.features.autofill.bullet3": "Works on Workday, Taleo, and Greenhouse",
    "landing.features.autofill.placeholder": "PDF Injection UI Placeholder",
    "landing.features.latam.title": "LATAM Support",
    "landing.features.latam.desc": "AI translates and adapts your application to perfectly fit Mexico and Chile—local formats, RUT, RFC, CURP, dual last names. Apply with confidence.",
    "landing.features.latam.bullet1": "AI translation to perfectly fit local needs",
    "landing.features.latam.bullet2": "RUT, RFC, CURP, dual last names—handled",
    "landing.features.latam.bullet3": "Bypasses strict US ATS validation errors",
    "landing.features.latam.placeholder": "LATAM Formatting UI Placeholder",
    "landing.features.persona.title": "Multi-Persona Profiles",
    "landing.features.persona.desc": "Save different resumes for different roles. Switch profiles in one click.",
    "landing.features.persona.bullet1": "Save different resumes for different roles",
    "landing.features.persona.bullet2": "Switch profiles in one single click",
    "landing.features.persona.bullet3": "Zero redundant data entry",
    "landing.features.persona.placeholder": "Multi-Persona Switcher UI Placeholder",
    "landing.features.privacy.title": "Privacy First",
    "landing.features.privacy.desc": "Your data is stored securely and never shared with third parties.",
    "landing.wegetit.title": "We're job seekers too. We get it.",
    "landing.wegetit.subtitle": "No more filling out the same info after uploading your resume. No more Google autofill mistaking your name with usernames. Cover letters, interview prep—we handle the important stuff so you can focus on landing the offer.",
    "landing.pain.loop": "The endless loop of copy pasting your resume into forms feels like a second full time job that pays nothing.",
    "landing.pain.ghosted": "That sinking feeling when you spend 45 minutes tweaking one application just to get ghosted instantly.",
    "landing.benefit.time": "Taking your time back so you can actually prep for the interviews instead of doing mindless data entry.",
    "landing.benefit.confidence": "The confidence boost when you can send out 50 high quality applications while just drinking your morning coffee.",
    "landing.benefit.first": "Beating the competition by being the first one to apply the second a new job drops.",
    "landing.pain.section.pain": "Sound familiar?",
    "landing.pain.section.benefit": "With PostulaPro",
    "landing.manifesto.title": "We're one of you.",
    "landing.manifesto.body": "We hate filling out the same information right after inserting our resume. We built PostulaPro because job hunting shouldn't feel like a second full-time job that pays nothing. Upload once. Fill everywhere. Cover letters, interview prep—we've got you. Apply to more roles in less time, and land the offer you deserve.",
    "landing.pricing.title": "Invest in your career speed",
    "landing.pricing.subtitle": "Stop doing free data entry. Pick the engine that fits your job hunt.",
    "landing.pricing.free.desc": "Strict manual. Type your words.",
    "landing.pricing.free.feature1": "Manual entry only",
    "landing.pricing.free.feature2": "No resume upload",
    "landing.pricing.free.feature3": "Plain autofill, 1 profile, 10 apps",
    "landing.pricing.standard.desc": "For focused job hunts",
    "landing.pricing.standard.feature1": "Resume Personas",
    "landing.pricing.standard.feature2": "Universal Text Autofill",
    "landing.pricing.standard.feature3": "PDF Injection",
    "landing.pricing.standard.feature4": "No Cover Letter Gen",
    "landing.pricing.standard.cta": "Choose Standard",
    "landing.pricing.pro.desc": "The ultimate application engine",
    "landing.pricing.pro.feature1": "Unlimited Personas",
    "landing.pricing.pro.feature2": "One-Click PDF Injection",
    "landing.pricing.pro.feature3": "Full LATAM/US Toggles",
    "landing.pricing.pro.feature4": "AI Cover Letter Generation",
    "landing.pricing.pro.feature5": "Priority ATS Parsing",
    "landing.pricing.popular": "Most Popular",
    "landing.privacy.tagline": "Locally encrypted. Never sold to third parties. Delete anytime.",
    
    // Privacy section
    "privacy.badge": "Your Data, Your Control",
    "privacy.title": "Privacy is our",
    "privacy.highlight": "promise",
    "privacy.tagline": "Your data is worth gold. Don't give it away for free.",
    "privacy.subtitle": "Unlike other autofill tools that monetize your data, we never sell, share, or profit from your information. You own your data completely.",
    "privacy.never_sold.title": "Never Sold or Shared",
    "privacy.never_sold.desc": "Your resume and personal information are never sold to recruiters, advertisers, or anyone else. Period.",
    "privacy.delete.title": "Delete Anytime",
    "privacy.delete.desc": "One-click to permanently erase all your data from our servers. No questions asked.",
    "privacy.encrypted.title": "Encrypted Storage",
    "privacy.encrypted.desc": "Your resume data is encrypted at rest and in transit. Only you can access it.",
    "privacy.latam.title": "LATAM Support",
    "privacy.latam.desc": "Full support for Mexican and Chilean CV formats with local autofill.",
    
    // Pricing
    "pricing.title": "Simple Pricing",
    "pricing.subtitle": "Choose the plan that works for you",
    "pricing.free.title": "Free",
    "pricing.free.price": "Free",
    "pricing.free.desc": "Strict manual. Type your words. No resume upload.",
    "pricing.free.feature1": "Manual entry only—type your words",
    "pricing.free.feature2": "No resume upload",
    "pricing.free.feature3": "Plain autofill",
    "pricing.free.feature4": "1 profile",
    "pricing.free.feature5": "10 applications/month",
    "pricing.standard.title": "Standard",
    "pricing.standard.desc": "For active job seekers",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "For power users and agencies",
    "pricing.per_year": "/year",
    "pricing.per_month": "/month",
    "pricing.or": "or",
    "pricing.cta.free": "Get Started",
    "pricing.cta.upgrade": "Upgrade Now",
    "pricing.feature.profiles": "profiles",
    "pricing.feature.uploads": "resume uploads",
    "pricing.feature.applications": "applications/month",
    "pricing.feature.unlimited": "Unlimited",
    
    // Dashboard
    "dashboard.title": "Your Profile",
    "dashboard.upload.title": "Upload Resume",
    "dashboard.upload.desc": "Drag and drop your PDF resume here, or click to browse",
    "dashboard.profile.personal": "Personal Information",
    "dashboard.profile.experience": "Work Experience",
    "dashboard.profile.education": "Education",
    "dashboard.save": "Save Changes",
    "dashboard.saving": "Saving...",
    
    // Account Settings
    "settings.title": "Account Settings",
    "settings.subtitle": "Manage your account preferences and settings.",
    "settings.privacy.title": "Your Privacy Commitment",
    "settings.privacy.desc": "At PostulaPro, your privacy is not a feature - it's our foundation. Unlike other autofill tools, we never monetize your data.",
    "settings.delete.title": "Danger Zone",
    "settings.delete.button": "Delete Account",
    "settings.delete.confirm": "Type DELETE to confirm",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.success": "Success!",
    "common.error": "Error",
  },
  
  "es-MX": {
    // Navigation
    "nav.home": "Inicio",
    "nav.dashboard": "Panel",
    "nav.pricing": "Precios",
    "nav.extension": "Extensión",
    "nav.settings": "Configuración",
    "nav.login": "Iniciar Sesión",
    "nav.logout": "Cerrar Sesión",
    
    // Landing page
    "landing.hero.title": "Aplica a Empleos",
    "landing.hero.highlight": "10 Veces Más Rápido",
    "landing.hero.subtitle": "Acaba con el ciclo de copiar y pegar. No más autofill de Google confundiendo tu nombre con usuarios. Sube una vez—llenamos todo. Cartas de presentación, preparación para entrevistas—nosotros te apoyamos.",
    "landing.hero.cta": "Comenzar Gratis",
    "landing.hero.badge": "El Motor de Empleos Remotos para LATAM",
    "landing.hero.welcome": "CV profesional, formato impecable. Tu información protegida.",
    "landing.hero.welcome.secondary": "Llena solicitudes al instante.",
    "landing.cta.chrome": "Add to Chrome — Gratis",
    "landing.cta.howItWorks": "Ver Cómo Funciona",
    "landing.hero.extensionPlaceholder": "Extension UI Placeholder",
    "landing.features.ai.title": "Análisis con IA",
    "landing.features.ai.desc": "Usamos modelos avanzados de IA para extraer cada detalle de tu currículum PDF correctamente.",
    "landing.features.autofill.title": "Llenado con Un Clic",
    "landing.features.autofill.desc": "Nuestra extensión de Chrome llena automáticamente las solicitudes de empleo en cualquier sitio web.",
    "landing.features.autofill.bullet1": "No más autofill de Google confundiendo tu nombre con usuarios",
    "landing.features.autofill.bullet2": "Inyecta el PDF correcto por perfil",
    "landing.features.autofill.bullet3": "Funciona en Workday, Taleo y Greenhouse",
    "landing.features.autofill.placeholder": "PDF Injection UI Placeholder",
    "landing.features.latam.title": "Soporte para México",
    "landing.features.latam.desc": "La IA traduce y adapta tu postulación para México—formatos locales, RFC, CURP, apellidos duales. Postula con confianza.",
    "landing.features.latam.bullet1": "Traducción con IA para adaptarse a necesidades locales",
    "landing.features.latam.bullet2": "RFC, CURP, apellidos duales—manejados",
    "landing.features.latam.bullet3": "Evita errores de validación ATS de EE.UU.",
    "landing.features.latam.placeholder": "LATAM Formatting UI Placeholder",
    "landing.wegetit.title": "Somos buscadores de empleo también. Te entendemos.",
    "landing.wegetit.subtitle": "No más llenar la misma información después de subir tu CV. No más autofill de Google confundiendo tu nombre. Cartas de presentación, preparación para entrevistas—nosotros nos encargamos.",
    "landing.pain.loop": "El ciclo infinito de copiar y pegar tu CV en los formularios se siente como un segundo trabajo a tiempo completo que no paga nada.",
    "landing.pain.ghosted": "Ese nudo en el estómago cuando pasas 45 minutos en una sola postulación solo para que te ignoren por completo.",
    "landing.benefit.time": "Recuperar tu tiempo libre para que puedas prepararte bien para las entrevistas en lugar de estar llenando datos a lo loco.",
    "landing.benefit.confidence": "La tranquilidad y confianza de poder enviar 50 postulaciones de alta calidad mientras te tomas tu café en la mañana.",
    "landing.benefit.first": "Ganarle a la competencia siendo el primero en aplicar justo en el segundo que publican la oferta de trabajo.",
    "landing.pain.section.pain": "¿Te suena familiar?",
    "landing.pain.section.benefit": "Con PostulaPro",
    "landing.manifesto.title": "Somos uno de ustedes.",
    "landing.manifesto.body": "Odiamos llenar la misma información después de subir nuestro currículum. Creamos PostulaPro porque buscar empleo no debería sentirse como un segundo trabajo a tiempo completo que no paga nada. Sube una vez. Llena en todos lados. Cartas de presentación, preparación para entrevistas—te tenemos. Postula a más empleos en menos tiempo y consigue la oferta que mereces.",
    "landing.features.persona.title": "Perfiles Multi-Persona",
    "landing.features.persona.desc": "Guarda diferentes currículums para diferentes roles. Cambia de perfil en un clic.",
    "landing.features.persona.bullet1": "Guarda diferentes resumes para diferentes roles",
    "landing.features.persona.bullet2": "Cambia de perfil en un solo clic",
    "landing.features.persona.bullet3": "Cero entrada de datos redundante",
    "landing.features.persona.placeholder": "Multi-Persona Switcher UI Placeholder",
    "landing.features.privacy.title": "Privacidad Primero",
    "landing.features.privacy.desc": "Tus datos se almacenan de forma segura y nunca se comparten con terceros.",
    "landing.pricing.title": "Invierte en tu velocidad de carrera",
    "landing.pricing.subtitle": "Deja de hacer data entry gratis. Elige el motor que te acomode.",
    "landing.pricing.free.desc": "Manual estricto. Escribe tus datos.",
    "landing.pricing.free.feature1": "Solo entrada manual",
    "landing.pricing.free.feature2": "Sin subir currículum",
    "landing.pricing.free.feature3": "Autofill básico, 1 perfil, 10 apps",
    "landing.pricing.standard.desc": "Para búsquedas enfocadas",
    "landing.pricing.standard.feature1": "Perfiles de Currículum",
    "landing.pricing.standard.feature2": "Autofill Universal de Texto",
    "landing.pricing.standard.feature3": "Inyección PDF",
    "landing.pricing.standard.feature4": "Sin Generación de Cover Letter",
    "landing.pricing.standard.cta": "Elegir Estándar",
    "landing.pricing.pro.desc": "El motor de aplicaciones definitivo",
    "landing.pricing.pro.feature1": "Personas Ilimitadas",
    "landing.pricing.pro.feature2": "Inyección PDF con Un Clic",
    "landing.pricing.pro.feature3": "Toggles LATAM/US Completos",
    "landing.pricing.pro.feature4": "Generación de Cover Letter con IA",
    "landing.pricing.pro.feature5": "Parsing ATS Prioritario",
    "landing.pricing.popular": "Más Popular",
    "landing.privacy.tagline": "Cifrado localmente. Nunca vendido a terceros. Borra cuando quieras.",
    
    // Privacy section
    "privacy.badge": "Tus Datos, Tu Control",
    "privacy.title": "La privacidad es nuestra",
    "privacy.highlight": "promesa",
    "privacy.tagline": "Tus datos valen oro. No los regales.",
    "privacy.subtitle": "A diferencia de otras herramientas que monetizan tus datos, nosotros jamás vendemos, compartimos ni lucran con tu información. Tus datos son tuyos.",
    "privacy.never_sold.title": "Nunca Vendidos ni Compartidos",
    "privacy.never_sold.desc": "Tu currículum e información personal nunca se venden a reclutadores, anunciantes ni nadie más. Punto.",
    "privacy.delete.title": "Borra Cuando Quieras",
    "privacy.delete.desc": "Un clic para borrar permanentemente todos tus datos. Sin preguntas.",
    "privacy.encrypted.title": "Almacenamiento Cifrado",
    "privacy.encrypted.desc": "Los datos de tu currículum están cifrados en reposo y en tránsito. Solo tú puedes acceder.",
    "privacy.latam.title": "Soporte para México",
    "privacy.latam.desc": "Soporte completo para formatos de CV mexicanos con RFC, CURP y autocompletado local.",
    
    // Pricing
    "pricing.title": "Precios Simples",
    "pricing.subtitle": "Elige el plan que funcione para ti",
    "pricing.free.title": "Gratis",
    "pricing.free.price": "Gratis",
    "pricing.free.desc": "Manual estricto. Escribe tus datos. Sin subir currículum.",
    "pricing.free.feature1": "Solo entrada manual—escribe tus datos",
    "pricing.free.feature2": "Sin subir currículum",
    "pricing.free.feature3": "Autofill básico",
    "pricing.free.feature4": "1 perfil",
    "pricing.free.feature5": "10 aplicaciones/mes",
    "pricing.standard.title": "Estándar",
    "pricing.standard.desc": "Para buscadores de empleo activos",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "Para usuarios avanzados y agencias",
    "pricing.per_year": "/año",
    "pricing.per_month": "/mes",
    "pricing.or": "o",
    "pricing.cta.free": "Comenzar",
    "pricing.cta.upgrade": "Mejorar Ahora",
    "pricing.feature.profiles": "perfiles",
    "pricing.feature.uploads": "cargas de currículum",
    "pricing.feature.applications": "aplicaciones/mes",
    "pricing.feature.unlimited": "Ilimitado",
    
    // Dashboard
    "dashboard.title": "Tu Perfil",
    "dashboard.upload.title": "Subir Currículum",
    "dashboard.upload.desc": "Arrastra y suelta tu currículum PDF aquí, o haz clic para buscar",
    "dashboard.profile.personal": "Información Personal",
    "dashboard.profile.experience": "Experiencia Laboral",
    "dashboard.profile.education": "Educación",
    "dashboard.save": "Guardar Cambios",
    "dashboard.saving": "Guardando...",
    
    // Account Settings
    "settings.title": "Configuración de Cuenta",
    "settings.subtitle": "Administra tus preferencias y configuración de cuenta.",
    "settings.privacy.title": "Tu Compromiso de Privacidad",
    "settings.privacy.desc": "En PostulaPro, tu privacidad no es una característica, es nuestra base. A diferencia de otras herramientas, nunca monetizamos tus datos.",
    "settings.delete.title": "Zona de Peligro",
    "settings.delete.button": "Eliminar Cuenta",
    "settings.delete.confirm": "Escribe ELIMINAR para confirmar",
    
    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.success": "¡Éxito!",
    "common.error": "Error",
  },
  
  "es-CL": {
    // Navigation - Chilean Spanish with subtle local flavor
    "nav.home": "Inicio",
    "nav.dashboard": "Panel",
    "nav.pricing": "Precios",
    "nav.extension": "Extensión",
    "nav.settings": "Configuración",
    "nav.login": "Iniciar Sesión",
    "nav.logout": "Cerrar Sesión",
    
    // Landing page - Chilean Spanish with "ya" and "po" flavor
    "landing.hero.title": "Postula a Pegas",
    "landing.hero.highlight": "10 Veces Más Rápido",
    "landing.hero.subtitle": "Acaba con el ciclo de copiar y pegar. No más autofill de Google confundiendo tu nombre con usuarios. Sube una vez—llenamos todo. Cartas de presentación, preparación para entrevistas—nosotros te apoyamos.",
    "landing.hero.cta": "Partir Gratis",
    "landing.hero.badge": "El Motor de Empleos Remotos para LATAM",
    "landing.hero.welcome": "RUT, comuna, región - todo listo. Tus datos seguros.",
    "landing.hero.welcome.secondary": "Tus postulaciones al tiro.",
    "landing.cta.chrome": "Add to Chrome — Gratis",
    "landing.cta.howItWorks": "Ver Cómo Funciona",
    "landing.hero.extensionPlaceholder": "Extension UI Placeholder",
    "landing.features.ai.title": "Análisis con IA",
    "landing.features.ai.desc": "Usamos modelos bacanes de IA para sacar cada detalle de tu currículum PDF correctamente.",
    "landing.features.autofill.title": "Llenado con Un Clic",
    "landing.features.autofill.desc": "Nuestra extensión de Chrome llena automáticamente las postulaciones de pega en cualquier sitio web.",
    "landing.features.autofill.bullet1": "No más autofill de Google confundiendo tu nombre con usuarios",
    "landing.features.autofill.bullet2": "Inyecta el PDF correcto por perfil",
    "landing.features.autofill.bullet3": "Funciona en Workday, Taleo y Greenhouse",
    "landing.features.autofill.placeholder": "PDF Injection UI Placeholder",
    "landing.features.latam.title": "Soporte para Chile",
    "landing.features.latam.desc": "La IA traduce y adapta tu postulación para Chile—formatos locales, RUT, comuna, región. Postula con confianza.",
    "landing.features.latam.bullet1": "Traducción con IA para adaptarse a necesidades locales",
    "landing.features.latam.bullet2": "RUT, comuna, apellidos duales—manejados",
    "landing.features.latam.bullet3": "Evita errores de validación ATS de EE.UU.",
    "landing.features.latam.placeholder": "LATAM Formatting UI Placeholder",
    "landing.wegetit.title": "Somos buscadores de empleo también. Te entendemos.",
    "landing.wegetit.subtitle": "No más llenar la misma información después de subir tu CV. No más autofill de Google confundiendo tu nombre. Cartas de presentación, preparación para entrevistas—nosotros nos encargamos.",
    "landing.pain.loop": "El ciclo infinito de copiar y pegar tu CV en los formularios se siente como un segundo trabajo a tiempo completo que no paga nada.",
    "landing.pain.ghosted": "Ese nudo en el estómago cuando pasas 45 minutos en una sola postulación solo para que te ignoren por completo.",
    "landing.benefit.time": "Recuperar tu tiempo libre para que puedas prepararte bien para las entrevistas en lugar de estar llenando datos a lo loco.",
    "landing.benefit.confidence": "La tranquilidad y confianza de poder enviar 50 postulaciones de alta calidad mientras te tomas tu café en la mañana.",
    "landing.benefit.first": "Ganarle a la competencia siendo el primero en aplicar justo en el segundo que publican la oferta de trabajo.",
    "landing.pain.section.pain": "¿Te suena familiar?",
    "landing.pain.section.benefit": "Con PostulaPro",
    "landing.manifesto.title": "Somos uno de ustedes.",
    "landing.manifesto.body": "Odiamos llenar la misma información después de subir nuestro currículum. Creamos PostulaPro porque buscar pega no debería sentirse como un segundo trabajo a tiempo completo que no paga nada. Sube una vez. Llena en todos lados. Cartas de presentación, preparación para entrevistas—te tenemos. Postula a más pegas en menos tiempo y consigue la oferta que mereces.",
    "landing.features.persona.title": "Perfiles Multi-Persona",
    "landing.features.persona.desc": "Guarda diferentes currículums para diferentes roles. Cambia de perfil en un clic.",
    "landing.features.persona.bullet1": "Guarda diferentes resumes para diferentes roles",
    "landing.features.persona.bullet2": "Cambia de perfil en un solo clic",
    "landing.features.persona.bullet3": "Cero entrada de datos redundante",
    "landing.features.persona.placeholder": "Multi-Persona Switcher UI Placeholder",
    "landing.features.privacy.title": "Privacidad Primero",
    "landing.features.privacy.desc": "Tus datos se guardan de forma segura y nunca se comparten con terceros.",
    "landing.pricing.title": "Invierte en tu velocidad de carrera",
    "landing.pricing.subtitle": "Deja de hacer data entry gratis. Elige el motor que te acomode.",
    "landing.pricing.free.desc": "Manual estricto. Escribe tus datos.",
    "landing.pricing.free.feature1": "Solo entrada manual",
    "landing.pricing.free.feature2": "Sin subir currículum",
    "landing.pricing.free.feature3": "Autofill básico, 1 perfil, 10 apps",
    "landing.pricing.standard.desc": "Para búsquedas enfocadas",
    "landing.pricing.standard.feature1": "Perfiles de Currículum",
    "landing.pricing.standard.feature2": "Autofill Universal de Texto",
    "landing.pricing.standard.feature3": "Inyección PDF",
    "landing.pricing.standard.feature4": "Sin Generación de Cover Letter",
    "landing.pricing.standard.cta": "Elegir Estándar",
    "landing.pricing.pro.desc": "El motor de aplicaciones definitivo",
    "landing.pricing.pro.feature1": "Personas Ilimitadas",
    "landing.pricing.pro.feature2": "Inyección PDF con Un Clic",
    "landing.pricing.pro.feature3": "Toggles LATAM/US Completos",
    "landing.pricing.pro.feature4": "Generación de Cover Letter con IA",
    "landing.pricing.pro.feature5": "Parsing ATS Prioritario",
    "landing.pricing.popular": "Más Popular",
    "landing.privacy.tagline": "Cifrado localmente. Nunca vendido a terceros. Borra cuando quieras.",
    
    // Privacy section - Chilean flavor
    "privacy.badge": "Tus Datos, Tu Control",
    "privacy.title": "La privacidad es nuestra",
    "privacy.highlight": "promesa",
    "privacy.tagline": "Tus datos valen oro. No los regales po.",
    "privacy.subtitle": "A diferencia de otras herramientas que venden tus datos, nosotros jamás vendemos, compartimos ni lucramos con tu info. Tus datos son tuyos, así de simple.",
    "privacy.never_sold.title": "Nunca Vendidos ni Compartidos",
    "privacy.never_sold.desc": "Tu currículum e información personal nunca se venden a reclutadores, anunciantes ni nadie. Palabra.",
    "privacy.delete.title": "Borra Cuando Quieras",
    "privacy.delete.desc": "Un clic y listo, se borran todos tus datos de nuestros servidores. Sin preguntas.",
    "privacy.encrypted.title": "Almacenamiento Cifrado",
    "privacy.encrypted.desc": "Los datos de tu currículum están cifrados y protegidos. Solo tú puedes acceder.",
    "privacy.latam.title": "Soporte para Chile",
    "privacy.latam.desc": "Soporte completo para formatos de CV chilenos con RUT, comuna y autocompletado local.",
    
    // Pricing - Chilean flavor
    "pricing.title": "Precios Claros",
    "pricing.subtitle": "Elige el plan que te acomode",
    "pricing.free.title": "Gratis",
    "pricing.free.price": "Gratis",
    "pricing.free.desc": "Manual estricto. Escribe tus datos. Sin subir currículum.",
    "pricing.free.feature1": "Solo entrada manual—escribe tus datos",
    "pricing.free.feature2": "Sin subir currículum",
    "pricing.free.feature3": "Autofill básico",
    "pricing.free.feature4": "1 perfil",
    "pricing.free.feature5": "10 aplicaciones/mes",
    "pricing.standard.title": "Estándar",
    "pricing.standard.desc": "Para los que buscan pega activamente",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "Para usuarios power y agencias",
    "pricing.per_year": "/año",
    "pricing.per_month": "/mes",
    "pricing.or": "o",
    "pricing.cta.free": "Partir",
    "pricing.cta.upgrade": "Mejorar Ahora",
    "pricing.feature.profiles": "perfiles",
    "pricing.feature.uploads": "cargas de currículum",
    "pricing.feature.applications": "postulaciones/mes",
    "pricing.feature.unlimited": "Ilimitado",
    
    // Dashboard - Chilean flavor
    "dashboard.title": "Tu Perfil",
    "dashboard.upload.title": "Subir Currículum",
    "dashboard.upload.desc": "Arrastra tu currículum PDF acá, o haz clic para buscar",
    "dashboard.profile.personal": "Información Personal",
    "dashboard.profile.experience": "Experiencia Laboral",
    "dashboard.profile.education": "Educación",
    "dashboard.save": "Guardar Cambios",
    "dashboard.saving": "Guardando...",
    
    // Account Settings - Chilean flavor
    "settings.title": "Configuración de Cuenta",
    "settings.subtitle": "Administra tus preferencias y configuración de cuenta.",
    "settings.privacy.title": "Tu Compromiso de Privacidad",
    "settings.privacy.desc": "En PostulaPro, tu privacidad no es una característica, es nuestra base. A diferencia de otras herramientas, nunca monetizamos tus datos. Así de simple.",
    "settings.delete.title": "Zona de Peligro",
    "settings.delete.button": "Eliminar Cuenta",
    "settings.delete.confirm": "Escribe ELIMINAR para confirmar",
    
    // Common
    "common.loading": "Cargando...",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.success": "¡Listo!",
    "common.error": "Error",
  },
};
