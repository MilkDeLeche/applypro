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

// Pricing per country (yearly amounts)
export const PRICING: Record<Country, { standard: number; pro: number }> = {
  us: { standard: 35, pro: 45 },
  mx: { standard: 650, pro: 850 },
  cl: { standard: 30000, pro: 40000 },
  other: { standard: 35, pro: 45 },
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
    const saved = localStorage.getItem("sudofillr-country");
    return (saved as Country) || detectCountry();
  });
  
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("sudofillr-locale");
    return (saved as Locale) || getLocaleFromCountry(country);
  });

  // When country changes, also update locale
  const setCountry = (newCountry: Country) => {
    setCountryState(newCountry);
    setLocale(getLocaleFromCountry(newCountry));
  };

  useEffect(() => {
    localStorage.setItem("sudofillr-country", country);
    localStorage.setItem("sudofillr-locale", locale);
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
    "landing.hero.subtitle": "Upload your resume once. Our AI extracts your info. Our Chrome extension fills applications instantly.",
    "landing.hero.cta": "Get Started Free",
    "landing.hero.welcome": "Your resume data stays yours. Never sold. Never shared.",
    "landing.hero.welcome.secondary": "Fill applications in seconds, not hours.",
    "landing.features.ai.title": "AI Parsing",
    "landing.features.ai.desc": "We use advanced LLMs to extract every detail from your PDF resume correctly.",
    "landing.features.autofill.title": "One-Click Fill",
    "landing.features.autofill.desc": "Our Chrome extension automatically fills job applications on any website.",
    "landing.features.privacy.title": "Privacy First",
    "landing.features.privacy.desc": "Your data is stored securely and never shared with third parties.",
    
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
    "pricing.free.desc": "Perfect for trying out SudoFillr",
    "pricing.standard.title": "Standard",
    "pricing.standard.desc": "For active job seekers",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "For power users and agencies",
    "pricing.per_year": "/year",
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
    "settings.privacy.desc": "At SudoFillr, your privacy is not a feature - it's our foundation. Unlike other autofill tools, we never monetize your data.",
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
    "landing.hero.subtitle": "Sube tu currículum una vez. Nuestra IA extrae tu información. Nuestra extensión de Chrome llena las solicitudes al instante.",
    "landing.hero.cta": "Comenzar Gratis",
    "landing.hero.welcome": "CV profesional, formato impecable. Tu información protegida.",
    "landing.hero.welcome.secondary": "Llena solicitudes al instante.",
    "landing.features.ai.title": "Análisis con IA",
    "landing.features.ai.desc": "Usamos modelos avanzados de IA para extraer cada detalle de tu currículum PDF correctamente.",
    "landing.features.autofill.title": "Llenado con Un Clic",
    "landing.features.autofill.desc": "Nuestra extensión de Chrome llena automáticamente las solicitudes de empleo en cualquier sitio web.",
    "landing.features.privacy.title": "Privacidad Primero",
    "landing.features.privacy.desc": "Tus datos se almacenan de forma segura y nunca se comparten con terceros.",
    
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
    "pricing.free.desc": "Perfecto para probar SudoFillr",
    "pricing.standard.title": "Estándar",
    "pricing.standard.desc": "Para buscadores de empleo activos",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "Para usuarios avanzados y agencias",
    "pricing.per_year": "/año",
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
    "settings.privacy.desc": "En SudoFillr, tu privacidad no es una característica, es nuestra base. A diferencia de otras herramientas, nunca monetizamos tus datos.",
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
    "landing.hero.subtitle": "Sube tu currículum una vez y listo. Nuestra IA extrae tu info. Nuestra extensión de Chrome llena las postulaciones al tiro.",
    "landing.hero.cta": "Partir Gratis",
    "landing.hero.welcome": "RUT, comuna, región - todo listo. Tus datos seguros.",
    "landing.hero.welcome.secondary": "Tus postulaciones al tiro.",
    "landing.features.ai.title": "Análisis con IA",
    "landing.features.ai.desc": "Usamos modelos bacanes de IA para sacar cada detalle de tu currículum PDF correctamente.",
    "landing.features.autofill.title": "Llenado con Un Clic",
    "landing.features.autofill.desc": "Nuestra extensión de Chrome llena automáticamente las postulaciones de pega en cualquier sitio web.",
    "landing.features.privacy.title": "Privacidad Primero",
    "landing.features.privacy.desc": "Tus datos se guardan de forma segura y nunca se comparten con terceros.",
    
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
    "pricing.free.desc": "Ideal para probar SudoFillr",
    "pricing.standard.title": "Estándar",
    "pricing.standard.desc": "Para los que buscan pega activamente",
    "pricing.pro.title": "Pro",
    "pricing.pro.desc": "Para usuarios power y agencias",
    "pricing.per_year": "/año",
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
    "settings.privacy.desc": "En SudoFillr, tu privacidad no es una característica, es nuestra base. A diferencia de otras herramientas, nunca monetizamos tus datos. Así de simple.",
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
