/**
 * FILE: src/pages/PublicLanding.jsx
 * UPDATED: 2025-01-19
 * DESCRIPTION: LinguaCoon landing page - "Nocturnal Intelligence" design
 * 
 * Design philosophy:
 * - Nocturnal: Deep indigo palette, sophisticated not childish
 * - Smart: Clean Inter typography, generous spacing
 * - Tactile: Micro-interactions with depth (3D buttons)
 * - Focus-first: Minimal distractions, breathable layout
 * - Distinctive: Indigo + Coral accent
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/PublicLanding.css';

// Raccoon mascot SVG - refined version with more character
const RaccoonMascot = ({ className = '', size = 'default' }) => (
  <svg 
    className={`raccoon-mascot ${className} raccoon-${size}`}
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="headGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0"/>
      </radialGradient>
      <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#1E1B4B" floodOpacity="0.3"/>
      </filter>
    </defs>
    
    <circle cx="100" cy="110" r="90" fill="url(#headGlow)"/>
    
    <ellipse cx="55" cy="50" rx="28" ry="32" fill="#3F3F46"/>
    <ellipse cx="145" cy="50" rx="28" ry="32" fill="#3F3F46"/>
    <ellipse cx="55" cy="48" rx="16" ry="20" fill="#A1A1AA"/>
    <ellipse cx="145" cy="48" rx="16" ry="20" fill="#A1A1AA"/>
    
    <ellipse cx="100" cy="115" rx="72" ry="68" fill="#E4E4E7" filter="url(#softShadow)"/>
    
    <path 
      d="M30 100 Q100 75 170 100 Q165 138 100 130 Q35 138 30 100" 
      fill="#27272A"
    />
    
    <ellipse cx="68" cy="105" rx="20" ry="22" fill="#FAFAFA"/>
    <ellipse cx="132" cy="105" rx="20" ry="22" fill="#FAFAFA"/>
    
    <ellipse cx="71" cy="102" rx="11" ry="14" fill="#18181B"/>
    <ellipse cx="135" cy="102" rx="11" ry="14" fill="#18181B"/>
    
    <ellipse cx="71" cy="102" rx="8" ry="10" fill="#27272A"/>
    <ellipse cx="135" cy="102" rx="8" ry="10" fill="#27272A"/>
    
    <circle cx="75" cy="97" r="5" fill="white"/>
    <circle cx="139" cy="97" r="5" fill="white"/>
    <circle cx="68" cy="107" r="2" fill="white" opacity="0.6"/>
    <circle cx="132" cy="107" r="2" fill="white" opacity="0.6"/>
    
    <ellipse cx="100" cy="145" rx="28" ry="22" fill="#F4F4F5"/>
    
    <ellipse cx="100" cy="138" rx="12" ry="9" fill="#27272A"/>
    <ellipse cx="97" cy="136" rx="4" ry="2.5" fill="#52525B" opacity="0.6"/>
    
    <path 
      d="M88 152 Q100 160 112 152" 
      stroke="#27272A" 
      strokeWidth="2.5" 
      fill="none"
      strokeLinecap="round"
    />
    
    <circle cx="72" cy="148" r="2.5" fill="#A1A1AA"/>
    <circle cx="78" cy="154" r="2" fill="#A1A1AA"/>
    <circle cx="128" cy="148" r="2.5" fill="#A1A1AA"/>
    <circle cx="122" cy="154" r="2" fill="#A1A1AA"/>
    
    <ellipse cx="50" cy="125" rx="12" ry="8" fill="#F97316" opacity="0.15"/>
    <ellipse cx="150" cy="125" rx="12" ry="8" fill="#F97316" opacity="0.15"/>
  </svg>
);

const LanguageFlag = ({ code }) => {
  const flags = {
    en: (
      <svg viewBox="0 0 24 24" className="flag-icon">
        <circle cx="12" cy="12" r="11" fill="#012169"/>
        <path d="M12 1 L12 23 M1 12 L23 12" stroke="white" strokeWidth="3"/>
        <path d="M12 1 L12 23 M1 12 L23 12" stroke="#C8102E" strokeWidth="1.5"/>
        <path d="M3 3 L21 21 M21 3 L3 21" stroke="white" strokeWidth="2"/>
        <path d="M3 3 L21 21 M21 3 L3 21" stroke="#C8102E" strokeWidth="1"/>
      </svg>
    ),
    it: (
      <svg viewBox="0 0 24 24" className="flag-icon">
        <circle cx="12" cy="12" r="11" fill="white"/>
        <path d="M1 12 A11 11 0 0 1 12 1 L12 23 A11 11 0 0 1 1 12" fill="#009246"/>
        <path d="M23 12 A11 11 0 0 1 12 23 L12 1 A11 11 0 0 1 23 12" fill="#CE2B37"/>
      </svg>
    ),
    uk: (
      <svg viewBox="0 0 24 24" className="flag-icon">
        <circle cx="12" cy="12" r="11" fill="#005BBB"/>
        <path d="M1 12 L23 12 L23 23 A11 11 0 0 1 1 23 Z" fill="#FFD500"/>
      </svg>
    ),
    fr: (
      <svg viewBox="0 0 24 24" className="flag-icon">
        <circle cx="12" cy="12" r="11" fill="white"/>
        <path d="M1 12 A11 11 0 0 1 8 2 L8 22 A11 11 0 0 1 1 12" fill="#002395"/>
        <path d="M23 12 A11 11 0 0 1 16 22 L16 2 A11 11 0 0 1 23 12" fill="#ED2939"/>
      </svg>
    ),
  };
  return flags[code] || flags.en;
};

const FeatureIcon = ({ type }) => {
  const icons = {
    ai: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
        <path d="M2 17L12 22L22 17"/>
        <path d="M2 12L12 17L22 12"/>
      </svg>
    ),
    time: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6V12L16 14" strokeLinecap="round"/>
      </svg>
    ),
    free: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/>
        <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };
  return icons[type] || icons.ai;
};

function PublicLanding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showCookies, setShowCookies] = useState(false);
  const [mascotHovered, setMascotHovered] = useState(false);
  const [primaryBtnPressed, setPrimaryBtnPressed] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'it', name: 'Italiano' },
    { code: 'uk', name: 'Українська' },
    { code: 'fr', name: 'Français' },
  ];

  useEffect(() => {
    const consent = localStorage.getItem('lc_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShowCookies(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handleClick = (e) => {
      if (!e.target.closest('.lc-lang-select')) setLangDropdownOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [langDropdownOpen]);

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('lc_language', code);
    setLangDropdownOpen(false);
  };

  const acceptCookies = () => {
    localStorage.setItem('lc_cookie_consent', 'yes');
    setShowCookies(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('lc_cookie_consent', 'no');
    setShowCookies(false);
  };

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="lc-landing">
      <header className="lc-header">
        <div className="lc-header-inner">
          <div className="lc-brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <RaccoonMascot size="tiny" />
            <span className="lc-brand-name">LinguaCoon</span>
          </div>

          <div className="lc-header-right">
            <div className="lc-lang-select">
              <button
                className="lc-lang-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
              >
                <LanguageFlag code={currentLang.code} />
                <span>{currentLang.name}</span>
                <svg 
                  className={`lc-chevron ${langDropdownOpen ? 'open' : ''}`} 
                  viewBox="0 0 16 16"
                >
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>

              {langDropdownOpen && (
                <ul className="lc-lang-dropdown" role="listbox">
                  {languages.map(lang => (
                    <li key={lang.code}>
                      <button
                        className={`lc-lang-option ${lang.code === currentLang.code ? 'active' : ''}`}
                        onClick={() => changeLang(lang.code)}
                        role="option"
                        aria-selected={lang.code === currentLang.code}
                      >
                        <LanguageFlag code={lang.code} />
                        <span>{lang.name}</span>
                        {lang.code === currentLang.code && (
                          <svg className="lc-check" viewBox="0 0 16 16">
                            <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button className="lc-login-btn" onClick={() => navigate('/login')}>
              {t('landing.login_button')}
            </button>
          </div>
        </div>
      </header>

      <main className="lc-main">
        <section className="lc-hero">
          <div 
            className={`lc-mascot-wrapper ${mascotHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setMascotHovered(true)}
            onMouseLeave={() => setMascotHovered(false)}
          >
            <div className="lc-mascot-glow" />
            <RaccoonMascot size="hero" className={mascotHovered ? 'wiggle' : ''} />
          </div>

          <div className="lc-hero-content">
            <h1 className="lc-headline">
              {t('landing.hero_title')}
            </h1>
            
            <p className="lc-subheadline">
              {t('landing.hero_subtitle')}
            </p>

            <div className="lc-cta-stack">
              <button 
                className={`lc-btn lc-btn-primary ${primaryBtnPressed ? 'pressed' : ''}`}
                onClick={() => navigate('/onboarding')}
                onMouseDown={() => setPrimaryBtnPressed(true)}
                onMouseUp={() => setPrimaryBtnPressed(false)}
                onMouseLeave={() => setPrimaryBtnPressed(false)}
              >
                <span>{t('landing.cta_primary')}</span>
                <svg className="lc-arrow" viewBox="0 0 20 20">
                  <path d="M4 10H16M12 5L17 10L12 15" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button className="lc-btn lc-btn-secondary" onClick={() => navigate('/login')}>
                {t('landing.cta_secondary')}
              </button>
            </div>

            <div className="lc-trust-row">
              <div className="lc-trust-badge">
                <FeatureIcon type="ai" />
                <span>{t('landing.features.personalized')}</span>
              </div>
              <div className="lc-trust-badge">
                <FeatureIcon type="time" />
                <span>{t('landing.features.five_mins')}</span>
              </div>
              <div className="lc-trust-badge">
                <FeatureIcon type="free" />
                <span>{t('landing.features.no_card')}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showCookies && (
        <div className="lc-cookies" role="dialog" aria-labelledby="cookie-heading">
          <div className="lc-cookies-inner">
            <RaccoonMascot size="small" />
            <div className="lc-cookies-text">
              <h3 id="cookie-heading">{t('cookies.title')}</h3>
              <p>{t('cookies.description')}</p>
            </div>
            <div className="lc-cookies-actions">
              <button className="lc-btn lc-btn-accept" onClick={acceptCookies}>
                {t('cookies.accept')}
              </button>
              <button className="lc-btn lc-btn-reject" onClick={rejectCookies}>
                {t('cookies.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicLanding;
