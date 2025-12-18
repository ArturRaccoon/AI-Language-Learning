/**
 * FILE: src/components/LanguageSelector.jsx
 * DATA CREAZIONE: 2025-01-19
 * DESCRIZIONE: Selettore lingua riutilizzabile e accessibile
 */

import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const AVAILABLE_LANGUAGES = [
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'uk', label: 'UK', name: 'Українська' },
  { code: 'fr', label: 'FR', name: 'Français' }
];

function LanguageSelector({ variant = 'default' }) {
  const { i18n } = useTranslation();

  function changeLanguage(langCode) {
    i18n.changeLanguage(langCode);
    console.log(' Lingua cambiata:', langCode);
  }

  const currentLang = i18n.language.split('-')[0]; // Example: 'it-IT' becomes 'it'

  if (variant === 'dropdown') {
    return (
      <select
        value={currentLang}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-selector-dropdown"
        aria-label="Seleziona lingua"
      >
        {AVAILABLE_LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    );
  }

  // Variant: buttons (default)
  return (
    <div className="language-selector-buttons" role="group" aria-label="Language selector">
      {AVAILABLE_LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`lang-btn ${currentLang === lang.code ? 'active' : ''}`}
          aria-label={`Change language to ${lang.name}`}
          aria-pressed={currentLang === lang.code}
          title={lang.name}
        >
          <span className="lang-code">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSelector;