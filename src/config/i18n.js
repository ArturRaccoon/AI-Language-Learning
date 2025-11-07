/**
 * FILE: src/config/i18n.js
 * DATA CREAZIONE: 2025-11-03
 * DESCRIZIONE: Configurazione i18next per internazionalizzazione app
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Traduzioni
import translationsIT from '../locales/it/translation.json';
import translationsEN from '../locales/en/translation.json';
import translationsES from '../locales/es/translation.json';
import translationsFR from '../locales/fr/translation.json';
import translationsDE from '../locales/de/translation.json';

const resources = {
  it: { translation: translationsIT },
  en: { translation: translationsEN },
  es: { translation: translationsES },
  fr: { translation: translationsFR },
  de: { translation: translationsDE }
};

i18n
  // Rileva lingua browser
  .use(LanguageDetector)
  // Passa i18n a react-i18next
  .use(initReactI18next)
  // Inizializza
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['it', 'en', 'es', 'fr', 'de'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false // React già gestisce XSS
    },
    react: {
      useSuspense: false
    }
  });

// Log inizializzazione
i18n.on('initialized', () => {
  console.log('✅ i18next inizializzato');
  console.log('📍 Lingua rilevata:', i18n.language);
  console.log('🌍 Lingue supportate:', i18n.languages);
});

// Log cambio lingua
i18n.on('languageChanged', (lng) => {
  console.log('🔄 Lingua cambiata:', lng);
});

export default i18n;
