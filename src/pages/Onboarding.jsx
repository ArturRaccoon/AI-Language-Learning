// File: src/pages/Onboarding.jsx
// Created: 2025-11-09
// Last-Updated: 2025-11-16
// Author: Claude
// Description: Public onboarding flow - Language selection, goals, and level (no auth required)

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { completeOnboarding } from '../services/userService';
import '../styles/Onboarding.css';

const STEPS = {
  LANGUAGE: 0,
  GOALS: 1,
  LEVEL: 2
};

const AVAILABLE_LANGUAGES = [
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'uk', name: 'Ukrainian', native: 'Українська', flag: '🇺🇦' }
];

const GOALS = [
  { id: 'travel', icon: '✈️', key: 'goals.travel' },
  { id: 'work', icon: '💼', key: 'goals.work' },
  { id: 'study', icon: '📚', key: 'goals.study' },
  { id: 'culture', icon: '🎭', key: 'goals.culture' },
  { id: 'conversation', icon: '💬', key: 'goals.conversation' },
  { id: 'other', icon: '🎯', key: 'goals.other' }
];

const LEVELS = [
  { code: 'beginner', icon: '🌱', key: 'levels.beginner' },
  { code: 'elementary', icon: '📖', key: 'levels.elementary' },
  { code: 'intermediate', icon: '💪', key: 'levels.intermediate' },
  { code: 'advanced', icon: '🚀', key: 'levels.advanced' },
  { code: 'native', icon: '⭐', key: 'levels.native' }
];

function Onboarding() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, setUserProfile } = useAuthentication();
  const [currentStep, setCurrentStep] = useState(STEPS.LANGUAGE);
  const [preferences, setPreferences] = useState({
    targetLanguage: '',
    goals: [],
    level: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthenticated = Boolean(currentUser);
  const resolvedInterfaceLanguage = userProfile?.interfaceLanguage || i18n.language || 'en';

  useEffect(() => {
    if (isAuthenticated && userProfile?.onboardingCompleted) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, userProfile, navigate]);

  const totalSteps = Object.keys(STEPS).length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleLanguageSelect = (langCode) => {
    setPreferences(prev => ({ ...prev, targetLanguage: langCode }));
  };

  const handleGoalToggle = (goalId) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const handleLevelSelect = (levelCode) => {
    setPreferences(prev => ({ ...prev, level: levelCode }));
  };

  const handleNext = async () => {
    if (currentStep === STEPS.LANGUAGE && !preferences.targetLanguage) {
      alert(t('publicOnboarding.errors.selectLanguage', 'Please select a language'));
      return;
    }
    if (currentStep === STEPS.GOALS && preferences.goals.length === 0) {
      alert(t('publicOnboarding.errors.selectGoal', 'Please select at least one goal'));
      return;
    }
    if (currentStep === STEPS.LEVEL && !preferences.level) {
      alert(t('publicOnboarding.errors.selectLevel', 'Please select your level'));
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    if (isAuthenticated) {
      try {
        setIsSubmitting(true);
        await completeOnboarding(currentUser.uid, {
          nativeLanguage: userProfile?.nativeLanguage || 'en',
          targetLanguage: preferences.targetLanguage,
          interfaceLanguage: resolvedInterfaceLanguage,
          level: preferences.level,
          dailyGoals: userProfile?.dailyGoals || 10,
          goals: preferences.goals
        });

        setUserProfile(prev => ({
          ...(prev || {}),
          nativeLanguage: userProfile?.nativeLanguage || 'en',
          targetLanguage: preferences.targetLanguage,
          interfaceLanguage: resolvedInterfaceLanguage,
          level: preferences.level,
          goals: preferences.goals,
          onboardingCompleted: true
        }));

        navigate('/home', { replace: true });
      } catch (error) {
        console.error('Onboarding completion error:', error);
        alert(t('publicOnboarding.errors.generic', 'We could not save your preferences. Please try again.'));
      } finally {
        setIsSubmitting(false);
      }

      return;
    }

    const payload = {
      ...preferences,
      interfaceLanguage: resolvedInterfaceLanguage,
      nativeLanguage: 'en',
      dailyGoals: 10
    };
    sessionStorage.setItem('onboardingPreferences', JSON.stringify(payload));
    navigate('/registration');
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate('/');
    }
  };

  const canProceed = () => {
    if (currentStep === STEPS.LANGUAGE) return preferences.targetLanguage !== '';
    if (currentStep === STEPS.GOALS) return preferences.goals.length > 0;
    if (currentStep === STEPS.LEVEL) return preferences.level !== '';
    return false;
  };

  return (
    <div className="public-onboarding-container">
      <div className="public-onboarding-card">
        <div className="onboarding-header">
          <img src="/logo.svg" alt="Logo" className="header-logo" />
          <span className="header-title">duolingo</span>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            {currentStep + 1} / {totalSteps}
          </span>
        </div>

        <div className="step-content">
          {currentStep === STEPS.LANGUAGE && (
            <div className="step">
              <h1>{t('publicOnboarding.language.title', 'Which language do you want to learn?')}</h1>
              <p className="subtitle">
                {t('publicOnboarding.language.subtitle', 'Choose the language you want to study')}
              </p>
              
              <div className="language-selection-grid">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-card ${
                      preferences.targetLanguage === lang.code ? 'selected' : ''
                    }`}
                    onClick={() => handleLanguageSelect(lang.code)}
                  >
                    <span className="language-flag-big">{lang.flag}</span>
                    <span className="language-name-big">{lang.name}</span>
                    <span className="language-native-big">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.GOALS && (
            <div className="step">
              <h1>{t('publicOnboarding.goals.title', 'Why do you want to learn?')}</h1>
              <p className="subtitle">
                {t('publicOnboarding.goals.subtitle', 'Select one or more goals')}
              </p>
              
              <div className="goals-grid">
                {GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    className={`goal-card ${
                      preferences.goals.includes(goal.id) ? 'selected' : ''
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <span className="goal-icon">{goal.icon}</span>
                    <span className="goal-title">
                      {t(`publicOnboarding.${goal.key}`, goal.id)}
                    </span>
                    <span className="goal-desc">
                      {t(`publicOnboarding.${goal.key}_desc`, '')}
                    </span>
                    {preferences.goals.includes(goal.id) && (
                      <span className="checkmark">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.LEVEL && (
            <div className="step">
              <h1>{t('publicOnboarding.level.title', "What's your level?")}</h1>
              <p className="subtitle">
                {t('publicOnboarding.level.subtitle', 'In the language you want to learn')}
              </p>
              
              <div className="levels-grid">
                {LEVELS.map((level) => (
                  <button
                    key={level.code}
                    className={`level-card ${
                      preferences.level === level.code ? 'selected' : ''
                    }`}
                    onClick={() => handleLevelSelect(level.code)}
                  >
                    <span className="level-icon">{level.icon}</span>
                    <span className="level-title">
                      {t(`publicOnboarding.${level.key}`, level.code)}
                    </span>
                    <span className="level-desc">
                      {t(`publicOnboarding.${level.key}_desc`, '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="onboarding-actions">
          <button 
            onClick={handleBack}
            className="btn-back"
          >
            {currentStep === 0 ? '← Back to Home' : '← Back'}
          </button>

          <button 
            onClick={handleNext}
            className={`btn-continue ${canProceed() && !isSubmitting ? '' : 'disabled'}`}
            disabled={!canProceed() || isSubmitting}
          >
            {currentStep === totalSteps - 1 
              ? (isAuthenticated 
                  ? t('publicOnboarding.finish', 'Save preferences →')
                  : t('publicOnboarding.continue', 'Continue →'))
              : t('common.next', 'Next →')
            }
          </button>
        </div>

        {/* Already have account link */}
        <div className="auth-footer" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p>
            {t('publicOnboarding.hasAccount', 'Already have an account?')}{' '}
            <Link to="/login" style={{ color: '#58CC02', fontWeight: '600', textDecoration: 'none' }}>
              {t('publicOnboarding.signIn', 'Sign in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
