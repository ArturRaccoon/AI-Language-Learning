import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { completaOnboarding, LINGUE_DISPONIBILI, LINGUE_INTERFACCIA } from '../services/userService';
import './Onboarding.css';

function Onboarding() {
  const { utenteCorrente, setProfiloUtente } = useAutenticazione();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState('');

  const [formData, setFormData] = useState({
    linguaMadre: 'it',
    linguaTarget: 'en',
    linguaInterfaccia: 'it',
    livello: 'A1',
    obiettiviGiornalieri: 10
  });

  const livelli = [
    { codice: 'A1', nome: 'Principiante', desc: 'Conosco pochissime parole' },
    { codice: 'A2', nome: 'Elementare', desc: 'So dire frasi semplici' },
    { codice: 'B1', nome: 'Intermedio', desc: 'Riesco a conversare' },
    { codice: 'B2', nome: 'Intermedio Alto', desc: 'Parlo abbastanza bene' },
    { codice: 'C1', nome: 'Avanzato', desc: 'Ho ottima padronanza' }
  ];

  const handleChange = (campo, valore) => {
    setFormData(prev => ({ ...prev, [campo]: valore }));
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
      setErrore('');

      if (!utenteCorrente) {
        throw new Error('Utente non autenticato');
      }

      // Salva preferenze e completa onboarding
      await completaOnboarding(utenteCorrente.uid, formData);

      // Aggiorna context locale
      setProfiloUtente(prev => ({
        ...prev,
        ...formData,
        onboardingCompletato: true
      }));

      // Reindirizza alla dashboard
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Errore completamento onboarding:', error);
      setErrore('Errore durante il salvataggio. Riprova.');
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

        {errore && <div className="errore-messaggio">{errore}</div>}

        {/* STEP 1: Lingua Madre */}
        {step === 1 && (
          <div className="onboarding-step">
            <h2>Qual è la tua lingua madre?</h2>
            <p className="step-description">
              La lingua che parli meglio
            </p>

            <div className="lingua-grid">
              {LINGUE_DISPONIBILI.map((lingua) => (
                <button
                  key={lingua.codice}
                  className={`lingua-card ${formData.linguaMadre === lingua.codice ? 'selected' : ''}`}
                  onClick={() => handleChange('linguaMadre', lingua.codice)}
                  type="button"
                >
                  <span className="lingua-bandiera">{lingua.bandiera}</span>
                  <span className="lingua-nome">{lingua.nativo}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Lingua da Studiare */}
        {step === 2 && (
          <div className="onboarding-step">
            <h2>Quale lingua vuoi imparare?</h2>
            <p className="step-description">
              La lingua che vuoi studiare con questa app
            </p>

            <div className="lingua-grid">
              {LINGUE_DISPONIBILI.filter(l => l.codice !== formData.linguaMadre).map((lingua) => (
                <button
                  key={lingua.codice}
                  className={`lingua-card ${formData.linguaTarget === lingua.codice ? 'selected' : ''}`}
                  onClick={() => handleChange('linguaTarget', lingua.codice)}
                  type="button"
                >
                  <span className="lingua-bandiera">{lingua.bandiera}</span>
                  <span className="lingua-nome">{lingua.nativo}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Lingua Interfaccia */}
        {step === 3 && (
          <div className="onboarding-step">
            <h2>In quale lingua vuoi l'interfaccia?</h2>
            <p className="step-description">
              La lingua dell'app (menu, pulsanti, ecc.)
            </p>

            <div className="lingua-grid">
              {LINGUE_INTERFACCIA.map((lingua) => (
                <button
                  key={lingua.codice}
                  className={`lingua-card ${formData.linguaInterfaccia === lingua.codice ? 'selected' : ''}`}
                  onClick={() => handleChange('linguaInterfaccia', lingua.codice)}
                  type="button"
                >
                  <span className="lingua-bandiera">{lingua.bandiera}</span>
                  <span className="lingua-nome">{lingua.nativo}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Livello e Obiettivi */}
        {step === 4 && (
          <div className="onboarding-step">
            <h2>Il tuo livello attuale</h2>
            <p className="step-description">
              Come valuteresti la tua conoscenza di{' '}
              {LINGUE_DISPONIBILI.find(l => l.codice === formData.linguaTarget)?.nativo}?
            </p>

            <div className="livello-list">
              {livelli.map((livello) => (
                <button
                  key={livello.codice}
                  className={`livello-card ${formData.livello === livello.codice ? 'selected' : ''}`}
                  onClick={() => handleChange('livello', livello.codice)}
                  type="button"
                >
                  <div className="livello-header">
                    <span className="livello-codice">{livello.codice}</span>
                    <span className="livello-nome">{livello.nome}</span>
                  </div>
                  <p className="livello-desc">{livello.desc}</p>
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
                value={formData.obiettiviGiornalieri}
                onChange={(e) => handleChange('obiettiviGiornalieri', parseInt(e.target.value))}
                className="obiettivi-input"
              />
            </div>
          </div>
        )}

        {/* Pulsanti Navigazione */}
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