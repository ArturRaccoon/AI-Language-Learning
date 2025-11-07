/**
 * FILE: src/i18n.js
 * CREATED: 2025-01-19
 * DESCRIPTION: i18next configuration for scalable internationalization
 * SUPPORTED LANGUAGES: IT, EN, UK, FR
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['it', 'en', 'uk', 'fr'],
    defaultNS: 'translation',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
    },
    
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      requestOptions: {
        cache: 'default',
        credentials: 'same-origin'
      }
    },
    
    detection: {
      order: ['localStorage', 'querystring', 'cookie', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng',
      lookupCookie: 'i18next',
      
      convertDetectedLanguage: (lng) => {
        const langMap = {
          'en-GB': 'en',
          'en-US': 'en',
          'it-IT': 'it',
          'fr-FR': 'fr',
          'uk-UA': 'uk'
        };
        return langMap[lng] || lng.split('-')[0];
      }
    },
    
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p']
    }
  });

i18n.on('initialized', (options) => {
  console.log('✅ i18next initialized');
  console.log('📍 Detected language:', i18n.language);
  console.log('🌍 Supported languages:', options.supportedLngs);
});

i18n.on('languageChanged', (lng) => {
  console.log('🔄 Language changed:', lng);
  document.documentElement.lang = lng;
});

i18n.on('failedLoading', (lng, ns, msg) => {
  console.error(`❌ Translation loading error [${lng}/${ns}]:`, msg);
});

export default i18n;
