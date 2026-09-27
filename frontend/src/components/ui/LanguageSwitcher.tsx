import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <Globe className="w-3.5 h-3.5 text-text-muted" />
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-surface border border-border rounded px-2 py-1 text-xs font-semibold focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer text-text-primary"
        aria-label={t('common.language', 'Language')}
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  );
};
