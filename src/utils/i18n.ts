export type Language = 'de' | 'en';

export const translations = {
  de: {
    // Navigation & General
    home: 'Startseite',
    search: 'Suche',
    cart: 'Warenkorb',
    wishlist: 'Wunschliste',
    profile: 'Profil',
    back: 'Zurück',
    save: 'Speichern',
    cancel: 'Abbrechen',
    close: 'Schließen',
    confirm: 'Bestätigen',
    
    // Eco / Sustainability
    ecoScore: 'Umweltbewertung',
    co2Emissions: 'CO₂-Fußabdruck',
    co2Savings: 'CO₂-Einsparung',
    greenShipping: 'DHL GoGreen Versand',
    greenShippingDesc: '100% klimaneutraler Transport',
    pfandDeposit: 'Flaschenpfand (§ 6 VerpackG)',
    pfandIncluded: 'Inkl. Pfand',
    ecoFriendlyPackage: 'Nachhaltige Verpackung',
    sustainabilityScore: 'Nachhaltigkeits-Index',
    gCO2e: 'g CO₂e',
    kgCO2e: 'kg CO₂e',

    // DSGVO & Privacy & Legal
    privacySettings: 'Datenschutzeinstellungen (DSGVO)',
    privacyManager: 'Cookie & Tracking Verwaltung',
    essentialCookies: 'Erforderliche Cookies (Notwendig)',
    analyticsCookies: 'Analyse & Statistik',
    marketingCookies: 'Personalisierte Werbung',
    acceptAll: 'Alle akzeptieren',
    savePreferences: 'Auswahl speichern',
    exportData: 'Meine Daten herunterladen (DSGVO Art. 15)',
    deleteAccount: 'Konto löschen (Recht auf Vergessenwerden)',
    impressum: 'Impressum & Rechtliches',
    legalNotice: 'Anbieterkennzeichnung gemäß § 5 DDG',
    widerruf: '14-Tage Widerrufsbelehrung',
    vatIncluded: 'Inkl. MwSt.',
    standardVat: '19% MwSt. (Regelsatz)',
    reducedVat: '7% MwSt. (Ermäßigt)',
    netTotal: 'Nettobetrag',

    // Payment & Checkout
    checkout: 'Kasse',
    paymentMethod: 'Zahlungsart',
    klarnaPayLater: 'Klarna - Rechnung 30 Tage',
    sofortBank: 'Sofortüberweisung (Klarna)',
    sepaDebit: 'SEPA-Lastschrift',
    applePay: 'Apple Pay',
    creditCard: 'Kreditkarte',
    orderTotal: 'Gesamtsumme',
    placeOrder: 'Kostenpflichtig bestellen',
    payIn30Days: 'Erst in 30 Tagen bezahlen mit Klarna.',
    plzPlaceholder: 'PLZ (z.B. 10115)',
    cityPlaceholder: 'Stadt',
    streetPlaceholder: 'Straße und Hausnummer',

    // Cart & Wishlist
    emptyCart: 'Ihr Warenkorb ist leer',
    emptyWishlist: 'Ihre Wunschliste ist leer',
    addToCart: 'In den Warenkorb',
    addedToWishlist: 'Auf die Wunschliste',
    subtotal: 'Zwischensumme',
    freeShipping: 'Kostenloser Versand ab 39,00 €',

    // Offline & Connection
    offlineMode: 'Offline-Modus aktiv',
    offlineNotice: 'Änderungen werden synchronisiert, sobald Sie wieder online sind.',
  },
  en: {
    // Navigation & General
    home: 'Home',
    search: 'Search',
    cart: 'Cart',
    wishlist: 'Wishlist',
    profile: 'Profile',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',

    // Eco / Sustainability
    ecoScore: 'Eco Score',
    co2Emissions: 'CO₂ Footprint',
    co2Savings: 'CO₂ Savings',
    greenShipping: 'DHL GoGreen Shipping',
    greenShippingDesc: '100% climate-neutral transport',
    pfandDeposit: 'Bottle Deposit (Pfand)',
    pfandIncluded: 'Incl. Pfand',
    ecoFriendlyPackage: 'Eco-Friendly Packaging',
    sustainabilityScore: 'Sustainability Index',
    gCO2e: 'g CO₂e',
    kgCO2e: 'kg CO₂e',

    // DSGVO & Privacy & Legal
    privacySettings: 'Privacy Settings (GDPR)',
    privacyManager: 'Cookie & Consent Preferences',
    essentialCookies: 'Essential Cookies (Required)',
    analyticsCookies: 'Analytics & Performance',
    marketingCookies: 'Personalized Ads',
    acceptAll: 'Accept All',
    savePreferences: 'Save Selection',
    exportData: 'Export My Data (GDPR Art. 15)',
    deleteAccount: 'Delete Account (Right to be forgotten)',
    impressum: 'Legal Notice & Terms',
    legalNotice: 'Company Details (§ 5 German Digital Act)',
    widerruf: '14-Day Right of Withdrawal',
    vatIncluded: 'Incl. VAT',
    standardVat: '19% VAT (Standard rate)',
    reducedVat: '7% VAT (Reduced rate)',
    netTotal: 'Net Amount',

    // Payment & Checkout
    checkout: 'Checkout',
    paymentMethod: 'Payment Method',
    klarnaPayLater: 'Klarna - Pay in 30 days',
    sofortBank: 'Sofort Direct Banking',
    sepaDebit: 'SEPA Direct Debit',
    applePay: 'Apple Pay',
    creditCard: 'Credit Card',
    orderTotal: 'Order Total',
    placeOrder: 'Buy Now (Binding Order)',
    payIn30Days: 'Pay within 30 days with Klarna.',
    plzPlaceholder: 'Postal Code (e.g. 10115)',
    cityPlaceholder: 'City',
    streetPlaceholder: 'Street & Building No.',

    // Cart & Wishlist
    emptyCart: 'Your cart is empty',
    emptyWishlist: 'Your wishlist is empty',
    addToCart: 'Add to Cart',
    addedToWishlist: 'Added to Wishlist',
    subtotal: 'Subtotal',
    freeShipping: 'Free shipping over €39.00',

    // Offline & Connection
    offlineMode: 'Offline Mode Active',
    offlineNotice: 'Changes will sync automatically once connected.',
  },
};

let currentLanguage: Language = 'de'; // Default to German for DACH market app!
const listeners: Set<(lang: Language) => void> = new Set();

export const getLanguage = (): Language => currentLanguage;

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  listeners.forEach(fn => fn(lang));
};

export const subscribeLanguageChange = (fn: (lang: Language) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const translate = (key: keyof typeof translations['de']): string => {
  return translations[currentLanguage][key] || translations['en'][key] || key;
};

/**
 * Formats currency according to German locale standards (e.g. 1.299,00 €) or EN standard (€1,299.00)
 */
export const formatCurrency = (amount: number, lang: Language = currentLanguage): string => {
  if (lang === 'de') {
    const formatted = amount.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formatted} €`;
  }
  return `€${amount.toFixed(2)}`;
};

/**
 * Validates German Postal Code (PLZ): Must be 5 digits (e.g., 10115 for Berlin)
 */
export const validateGermanPLZ = (plz: string): boolean => {
  return /^[0-9]{5}$/.test(plz.trim());
};

/**
 * Format German Date (DD.MM.YYYY)
 */
export const formatGermanDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};
