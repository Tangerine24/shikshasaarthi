export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bh', name: 'Bhili', nativeName: 'भीली' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ' },
  { code: 'gon', name: 'Gondi', nativeName: 'गोंडी' },
  { code: 'kru', name: 'Kurukh', nativeName: 'कुड़ुख़' },
];
