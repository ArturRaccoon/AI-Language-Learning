import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { completeOnboarding, AVAILABLE_LANGUAGES, INTERFACE_LANGUAGES } from '../services/userService';
import './Onboarding.css';

function Onboarding() {
  const { currentUser, setUserProfile } = useAuthentication();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nativeLanguage: 'it',
    targetLanguage: 'en',
    interfaceLanguage: 'it',
    level: 'A1',
    dailyGoals: 10
  });

  const levels = [
    { code: 'A1', name: 'Principiante', desc: 'Conosco pochissime parole' },
    { code: 'A2', name: 'Elementare', desc: 'So dire frasi semplici' },
    { code: 'B1', name: 'Intermedio', desc: 'Riesco a conversare' },
    { code: 'B2', name: 'Intermedio Alto', desc: 'Parlo abbastanza bene' },
    { code: 'C1', name: 'Avanzato', desc: 'Ho ottima padronanza' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser) {
        throw new Error('Utente non autenticato');
      }

      // Save preferences and complete onboarding
      await completeOnboarding(currentUser.uid, formData);

      // Update local context
      setUserProfile(prev => ({
        ...prev,
        ...formData,
        onboardingCompleted: true
      }));

      // Redirect to dashboard
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('Errore completamento onboarding:', error);
      setError('Errore durante il salvataggio. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <p className="progress-text">Passo {step} di 4</p>
        </div>

        {error && <div className="errore-messaggio">{error}</div>}

        {/* STEP 1: Native Language */}
        {step === 1 && (
          <div className="onboarding-step">
            <h2>Qual è la tua lingua madre?</h2>
            <p className="step-description">
              La lingua che parli meglio
            </p>

            <div className="lingua-grid">
              {AVAILABLE_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  className={`lingua-card ${formData.nativeLanguage === language.code ? 'selected' : ''}`}
                  onClick={() => handleChange('nativeLanguage', language.code)}
                  type="button"
                >
                  <span className="lingua-bandiera">🌍</span>
                  <span className="lingua-nome">{language.native}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Target Language */}
        {step === 2 && (
          <div className="onboarding-step">
            <h2>Quale lingua vuoi imparare?</h2>
            <p className="step-description">
              La lingua che vuoi studiare con questa app
            </p>

            <div className="lingua-grid">
              {AVAILABLE_LANGUAGES.filter(l => l.code !== formData.nativeLanguage).map((language) => (
                <button
                  key={language.code}
                  className={`lingua-card ${formData.targetLanguage === language.code ? 'selected' : ''}`}
                  onClick={() => handleChange('targetLanguage', language.code)}
                  type="button"
                >
                  <span className="lingua-bandiera">🌍</span>
                  <span className="lingua-nome">{language.native}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Interface Language */}
        {step === 3 && (
          <div className="onboarding-step">
            <h2>In quale lingua vuoi l'interfaccia?</h2>
            <p className="step-description">
              La lingua dell'app (menu, pulsanti, ecc.)
            </p>

            <div className="lingua-grid">
              {INTERFACE_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  className={`lingua-card ${formData.interfaceLanguage === language.code ? 'selected' : ''}`}
                  onClick={() => handleChange('interfaceLanguage', language.code)}
                  type="button"
                >
                  <span className="lingua-bandiera">🌍</span>
                  <span className="lingua-nome">{language.native}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Level and Goals */}
        {step === 4 && (
          <div className="onboarding-step">
            <h2>Il tuo livello attuale</h2>
            <p className="step-description">
              Come valuteresti la tua conoscenza di{' '}
              {AVAILABLE_LANGUAGES.find(l => l.code === formData.targetLanguage)?.native}?
            </p>

            <div className="livello-list">
              {levels.map((level) => (
                <button
                  key={level.code}
                  className={`livello-card ${formData.level === level.code ? 'selected' : ''}`}
                  onClick={() => handleChange('level', level.code)}
                  type="button"
                >
                  <div className="livello-header">
                    <span className="livello-codice">{level.code}</span>
                    <span className="livello-nome">{level.name}</span>
                  </div>
                  <p className="livello-desc">{level.desc}</p>
                </button>
              ))}
            </div>

            <div className="obiettivi-section">
              <label htmlFor="obiettivi">
                Flashcard giornaliere da rivedere
              </label>
              <input
                id="obiettivi"
                type="number"
                min="5"
                max="50"
                value={formData.dailyGoals}
                onChange={(e) => handleChange('dailyGoals', parseInt(e.target.value))}
                className="obiettivi-input"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="onboarding-actions">
          {step > 1 && (
            <button
              onClick={handlePrev}
              className="btn-secondary"
              disabled={loading}
              type="button"
            >
              Indietro
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
              disabled={loading}
              type="button"
            >
              Avanti
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary"
              disabled={loading}
              type="button"
            >
              {loading ? 'Salvataggio...' : 'Inizia!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
