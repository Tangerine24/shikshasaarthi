import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import bhTranslation from './locales/bh.json';
import satTranslation from './locales/sat.json';
import gonTranslation from './locales/gon.json';
import kruTranslation from './locales/kru.json';

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('ss_lang') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      hi: { translation: hiTranslation },
      bh: { translation: bhTranslation },
      sat: { translation: satTranslation },
      gon: { translation: gonTranslation },
      kru: { translation: kruTranslation },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
