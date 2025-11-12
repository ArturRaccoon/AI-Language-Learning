/**
 * FILE: src/pages/PublicLanding.jsx
 * CREATED: 2025-01-19
 * DESCRIPTION: Duolingo-style public landing page with language selector and cookie consent
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/PublicLanding.css';

function PublicLanding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  // Available languages with flags
  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'sv', name: 'svenska', flag: '🇸🇪' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'th', name: 'ภาษาไทย', flag: '🇹🇭' },
    { code: 'tl', name: 'Tagalog', flag: '🇵🇭' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'uk', name: 'Українською', flag: '🇺🇦' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  useEffect(() => {
    // Check if user has accepted cookies
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setShowCookieConsent(true);
    }
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageSelector(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowCookieConsent(false);
  };

  const handleRejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowCookieConsent(false);
  };

  const getCurrentLanguage = () => {
    const current = languages.find(lang => lang.code === i18n.language);
    return current || languages.find(lang => lang.code === 'en');
  };

  return (
    <div className="landing-container">
      {/* Header with Language Selector */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo">
            <img src="/logo.svg" alt="Logo" />
            <span className="logo-text">duolingo</span>
          </div>
          
          <button 
            className="language-selector-btn"
            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
          >
            LINGUA SITO: {getCurrentLanguage().name.toUpperCase()}
            <span className="dropdown-icon">{showLanguageSelector ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Language Dropdown */}
        {showLanguageSelector && (
          <div className="language-dropdown">
            <div className="language-grid">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`language-item ${i18n.language === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className="language-flag">{lang.flag}</span>
                  <span className="language-name">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="content-wrapper">
          {/* Illustration */}
          <div className="illustration">
            <div className="characters">
              <div className="character character-1">
                <div className="character-body">
                  <div className="character-head">😊</div>
                  <div className="character-torso"></div>
                </div>
              </div>
              <div className="character character-2">
                <div className="character-body">
                  <div className="character-head">🤗</div>
                  <div className="character-torso"></div>
                </div>
              </div>
              <div className="character character-mascot">
                <div className="duo-mascot">
                  <div className="duo-body">
                    <div className="duo-eye duo-eye-left"></div>
                    <div className="duo-eye duo-eye-right"></div>
                    <div className="duo-beak"></div>
                  </div>
                </div>
              </div>
              <div className="character character-3">
                <div className="character-body">
                  <div className="character-head">🧑</div>
                  <div className="character-torso"></div>
                </div>
              </div>
              <div className="character character-4">
                <div className="character-body">
                  <div className="character-head">👨</div>
                  <div className="character-torso"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <h1 className="main-title">
              {t('landing.title', 'Il modo più divertente e famoso al mondo per imparare l\'italiano online')}
            </h1>
            
            <div className="cta-buttons">
              <button 
                className="btn-get-started"
                onClick={() => navigate('/onboarding')}
              >
                {t('landing.getStarted', 'INIZIA ORA')}
              </button>
              
              <button 
                className="btn-login"
                onClick={() => navigate('/login')}
              >
                {t('landing.login', 'HO GIÀ UN ACCOUNT')}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="cookie-consent">
          <div className="cookie-content">
            <h3>{t('cookies.title', 'Duo adora i cookie')}</h3>
            <p>
              {t('cookies.description', 
                'Sia Duolingo che terze parti, come i nostri partner pubblicitari e fornitori di servizi, utilizzano cookie e tecnologie simili per fornire i nostri servizi, aiutare a personalizzare i contenuti e analizzare gli annunci. Cliccando su "Accetta Cookie", acconsenti alla nostra Informativa sull\'uso dei Cookie.'
              )}
            </p>
            <div className="cookie-actions">
              <button 
                className="btn-accept-cookies"
                onClick={handleAcceptCookies}
              >
                {t('cookies.accept', 'ACCETTA COOKIE')}
              </button>
              <button 
                className="btn-reject-cookies"
                onClick={handleRejectCookies}
              >
                {t('cookies.reject', 'RIFIUTA TUTTO')}
              </button>
            </div>
            <a href="#" className="cookie-policy-link">
              {t('cookies.readMore', 'Leggi la nostra Informativa sull\'uso dei Cookie')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicLanding;
