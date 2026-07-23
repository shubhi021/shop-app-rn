import { useState, useEffect, useCallback } from 'react';
import {
  Language,
  getLanguage,
  setLanguage as setAppLanguage,
  subscribeLanguageChange,
  translations,
  formatCurrency,
  validateGermanPLZ,
  formatGermanDate,
} from '../utils/i18n';

export const useTranslation = () => {
  const [lang, setLangState] = useState<Language>(getLanguage());

  useEffect(() => {
    const unsubscribe = subscribeLanguageChange((newLang) => {
      setLangState(newLang);
    });
    return unsubscribe;
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setAppLanguage(newLang);
  }, []);

  const t = useCallback(
    (key: keyof typeof translations['de']): string => {
      return translations[lang][key] || translations['en'][key] || key;
    },
    [lang]
  );

  const formatPrice = useCallback(
    (amount: number): string => {
      return formatCurrency(amount, lang);
    },
    [lang]
  );

  return {
    t,
    language: lang,
    changeLanguage,
    formatCurrency: formatPrice,
    validateGermanPLZ,
    formatGermanDate,
  };
};
