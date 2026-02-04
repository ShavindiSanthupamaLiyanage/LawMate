import i18n from 'i18next';
import en from '@assets/locale/en.json';
import sn from '@assets/locale/sn.json';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';

// Define the type for supported languages
export type TranslationKeys = keyof typeof en;

// Detect the device language
const getDeviceLanguage = (): string => {
  const locales = getLocales();
  return locales[0]?.languageTag || 'en';
};

// Initialize i18next
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    sn: { translation: sn },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export const i18nLocale = i18n;