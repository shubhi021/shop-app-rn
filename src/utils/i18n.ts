import AsyncStorage from '@react-native-async-storage/async-storage';

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

    // Notifications Screen
    notifications: 'Benachrichtigungen',
    markAllRead: 'Alle lesen',
    emptyNotificationsTitle: 'Alles ruhig hier!',
    emptyNotificationsSubtitle: 'Du hast derzeit keine ungelesenen Benachrichtigungen. Wir halten dich auf dem Laufenden!',
    notifImpactTitle: 'Go Green Meilenstein! 🌱',
    notifImpactMsg: 'Du hast diese Woche bereits 2,4 kg CO2 durch deine bewusste Produktauswahl eingespart. Weiter so!',
    notifOrderTitle: 'Bestellung auf dem Weg 📦',
    notifOrderMsg: 'Deine Bestellung #DE-98721 wurde mit DHL GoGreen klimaneutral versandt. Voraussichtliche Lieferung: Freitag.',
    notifPromoTitle: 'Exklusiver 15% Rabatt ⚡',
    notifPromoMsg: 'Sichere dir 15% Extra-Rabatt auf alle A-Score bewerteten Produkte mit dem Code ECO15.',
    notifPriceTitle: 'Preissenkung auf Merkliste! ⭐',
    notifPriceMsg: 'Ein Produkt auf deiner Wunschliste ist jetzt 10% günstiger. Schau es dir direkt an!',
    notifSystemTitle: 'Sicherheits-Update',
    notifSystemMsg: 'Deine Anmeldung auf einem neuen Gerät wurde erfolgreich verifiziert.',
    notifTime2h: 'Vor 2 Std.',
    notifTime5h: 'Vor 5 Std.',
    notifTime1d: 'Vor 1 Tag',
    notifTime2d: 'Vor 2 Tagen',
    notifTime5d: 'Vor 5 Tagen',
    buyNow: 'Jetzt kaufen',
    description: 'Beschreibung',
    quantity: 'Menge',
    bestSeller: 'Bestseller',
    reviewsCount: 'Bewertungen',
    selectDesiredQty: 'Gewünschte Menge auswählen',
    secureCheckout: 'Sichere Kasse',
    sslEncrypted: 'SSL-verschlüsselt',
    easyReturns: 'Einfache Rückgabe',
    returnWindow: '30 Tage Rückgabe',
    freeShippingLabel: 'Gratisversand',
    freeShippingDesc: 'Ab 39 € Bestellwert',
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

    // Notifications Screen
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    emptyNotificationsTitle: 'All quiet here!',
    emptyNotificationsSubtitle: 'You currently have no unread notifications. We will keep you updated!',
    notifImpactTitle: 'Go Green Milestone! 🌱',
    notifImpactMsg: 'You saved 2.4 kg of CO2 this week through your conscious product choices. Keep it up!',
    notifOrderTitle: 'Order on the way 📦',
    notifOrderMsg: 'Your order #DE-98721 has been shipped climate-neutrally with DHL GoGreen. Estimated delivery: Friday.',
    notifPromoTitle: 'Exclusive 15% Discount ⚡',
    notifPromoMsg: 'Secure a 15% extra discount on all A-score rated products with code ECO15.',
    notifPriceTitle: 'Price drop on Wishlist! ⭐',
    notifPriceMsg: 'An item on your wishlist is now 10% cheaper. Check it out directly!',
    notifSystemTitle: 'Security Update',
    notifSystemMsg: 'Your login on a new device has been successfully verified.',
    notifTime2h: '2 hrs ago',
    notifTime5h: '5 hrs ago',
    notifTime1d: '1 day ago',
    notifTime2d: '2 days ago',
    notifTime5d: '5 days ago',
    buyNow: 'Buy Now',
    description: 'Description',
    quantity: 'Quantity',
    bestSeller: 'Best Choice',
    reviewsCount: 'Reviews',
    selectDesiredQty: 'Select desired amount',
    secureCheckout: 'Secure Checkout',
    sslEncrypted: 'SSL Encrypted',
    easyReturns: 'Easy Returns',
    returnWindow: '30-Day Window',
    freeShippingLabel: 'Free Shipping',
    freeShippingDesc: 'On orders over €39',
  },
};

let currentLanguage: Language = 'de'; // Default to German for DACH market app!
const listeners: Set<(lang: Language) => void> = new Set();

// Asynchronously load language preference on startup
AsyncStorage.getItem('shop_app_language')
  .then(savedLang => {
    if (savedLang === 'de' || savedLang === 'en') {
      setLanguage(savedLang);
    }
  })
  .catch(err => {
    console.error('Failed to load language from AsyncStorage:', err);
  });

export const getLanguage = (): Language => currentLanguage;

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
  AsyncStorage.setItem('shop_app_language', lang).catch(err => {
    console.error('Failed to save language to AsyncStorage:', err);
  });
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
