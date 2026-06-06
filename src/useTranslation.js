import { useState, useEffect } from 'react';
import { translations } from './i18n';

export function useTranslation() {
  const [lang, setLang] = useState(() => localStorage.getItem('nuracare_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('nuracare_lang', lang);
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return { t, lang, setLang };
}
