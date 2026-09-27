import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<string>(
    localStorage.getItem('ss_lang') || 'en'
  );

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('ss_lang', lang);
    i18n.changeLanguage(lang);
    // Immediate refresh so language updates across entire app
    window.location.reload();
  };

  useEffect(() => {
    const saved = localStorage.getItem('ss_lang');
    if (saved && saved !== i18n.language) {
      i18n.changeLanguage(saved);
      setLanguageState(saved);
    }
  }, [i18n]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
