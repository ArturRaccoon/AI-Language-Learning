/**
 * FILE: src/pages/OnboardingFlow.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Multi-step onboarding to configure user language preferences
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { completeOnboarding, AVAILABLE_LANGUAGES, INTERFACE_LANGUAGES } from '../services/userService';
import '../styles/Onboarding.css';

const STEPS = {
  WELCOME: 0,
  NATIVE_LANGUAGE: 1,
  TARGET_LANGUAGE: 2,
  LEVEL: 3,
  INTERFACE_LANGUAGE: 4,
  GOALS: 5
};

const LEVELS = [
  { code: 'A1', name: 'Beginner', description: 'Just starting out' },
  { code: 'A2', name: 'Elementary', description: 'Basic conversations' },
  { code: 'B1', name: 'Intermediate', description: 'Comfortable conversations' },
  { code: 'B2', name: 'Upper Intermediate', description: 'Fluent in most situations' },
  { code: 'C1', name: 'Advanced', description: 'Very fluent' },
  { code: 'C2', name: 'Proficient', description: 'Native-like fluency' }
];

function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [preferences, setPreferences] = useState({
    nativeLanguage: 'en',
    targetLanguage: 'it',
    interfaceLanguage: 'en',
    level: 'A1',
    dailyGoals: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser, setUserProfile } = useAuthentication();
  const navigate = useNavigate();

  const totalSteps = Object.keys(STEPS).length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!currentUser) {
      setError('You must be logged in to complete onboarding');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await completeOnboarding(currentUser.uid, preferences);
      
      // Update local profile state
      setUserProfile(prev => ({
        ...prev,
        ...preferences,
        onboardingCompleted: true
      }));

      console.log('✅ Onboarding completed successfully');
      navigate('/home');
    } catch (err) {
      console.error('❌ Onboarding completion error:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Step Content */}
        <div className="step-content">
          {currentStep === STEPS.WELCOME && (
            <div className="step welcome-step">
              <h1>🌍 Welcome to Language Learning!</h1>
              <p className="subtitle">
                Let's personalize your learning experience
              </p>
              <div className="welcome-features">
                <div className="feature">
                  <span className="feature-icon">🎯</span>
                  <h3>Personalized Learning</h3>
                  <p>Tailored to your level and goals</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">🧠</span>
                  <h3>Smart Repetition</h3>
                  <p>AI-powered spaced repetition system</p>
                </div>
                <div className="feature">
                  <span className="feature-icon">📈</span>
                  <h3>Track Progress</h3>
                  <p>Monitor your improvement over time</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === STEPS.NATIVE_LANGUAGE && (
            <div className="step">
              <h2>🏠 What's your native language?</h2>
              <p>This helps us provide better translations</p>
              <div className="language-grid">
                {AVAILABLE_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${
                      preferences.nativeLanguage === lang.code ? 'selected' : ''
                    }`}
                    onClick={() => updatePreference('nativeLanguage', lang.code)}
                  >
                    <span className="language-name">{lang.name}</span>
                    <span className="language-native">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.TARGET_LANGUAGE && (
            <div className="step">
              <h2>🎯 Which language do you want to learn?</h2>
              <p>Choose your target language</p>
              <div className="language-grid">
                {AVAILABLE_LANGUAGES.filter(
                  lang => lang.code !== preferences.nativeLanguage
                ).map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${
                      preferences.targetLanguage === lang.code ? 'selected' : ''
                    }`}
                    onClick={() => updatePreference('targetLanguage', lang.code)}
                  >
                    <span className="language-name">{lang.name}</span>
                    <span className="language-native">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.LEVEL && (
            <div className="step">
              <h2>📊 What's your current level?</h2>
              <p>Be honest - this helps us personalize your learning</p>
              <div className="level-grid">
                {LEVELS.map(level => (
                  <button
                    key={level.code}
                    className={`level-option ${
                      preferences.level === level.code ? 'selected' : ''
                    }`}
                    onClick={() => updatePreference('level', level.code)}
                  >
                    <span className="level-code">{level.code}</span>
                    <span className="level-name">{level.name}</span>
                    <span className="level-description">{level.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.INTERFACE_LANGUAGE && (
            <div className="step">
              <h2>🌐 Choose your interface language</h2>
              <p>The language for menus and instructions</p>
              <div className="language-grid">
                {INTERFACE_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${
                      preferences.interfaceLanguage === lang.code ? 'selected' : ''
                    }`}
                    onClick={() => updatePreference('interfaceLanguage', lang.code)}
                  >
                    <span className="language-name">{lang.name}</span>
                    <span className="language-native">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === STEPS.GOALS && (
            <div className="step">
              <h2>🎯 Set your daily goal</h2>
              <p>How many new words do you want to learn per day?</p>
              <div className="goals-container">
                <div className="goal-slider">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={preferences.dailyGoals}
                    onChange={(e) => updatePreference('dailyGoals', parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="goal-value">
                    <span className="goal-number">{preferences.dailyGoals}</span>
                    <span className="goal-label">words per day</span>
                  </div>
                </div>
                <div className="goal-suggestions">
                  <button 
                    className={`suggestion ${preferences.dailyGoals === 10 ? 'active' : ''}`}
                    onClick={() => updatePreference('dailyGoals', 10)}
                  >
                    🐢 Relaxed (10/day)
                  </button>
                  <button 
                    className={`suggestion ${preferences.dailyGoals === 20 ? 'active' : ''}`}
                    onClick={() => updatePreference('dailyGoals', 20)}
                  >
                    🚶 Regular (20/day)
                  </button>
                  <button 
                    className={`suggestion ${preferences.dailyGoals === 30 ? 'active' : ''}`}
                    onClick={() => updatePreference('dailyGoals', 30)}
                  >
                    🏃 Intense (30/day)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="onboarding-actions">
          {currentStep > STEPS.WELCOME && (
            <button 
              onClick={handleBack}
              className="btn-secondary"
              disabled={loading}
            >
              ← Back
            </button>
          )}

          {currentStep < STEPS.GOALS ? (
            <button 
              onClick={handleNext}
              className="btn-primary"
              disabled={loading}
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={handleComplete}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : '🚀 Start Learning!'}
            </button>
          )}
        </div>

        {/* Skip option for Welcome step */}
        {currentStep === STEPS.WELCOME && (
          <button 
            onClick={handleNext}
            className="skip-link"
          >
            Skip intro →
          </button>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;