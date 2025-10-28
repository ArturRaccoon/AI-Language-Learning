/**
 * FILE: src/pages/Onboarding.jsx
 * DATA CREAZIONE: 2024-12-25 22:05
 * DESCRIZIONE: Flusso onboarding multi-step:
 *   - Step 1: Lingue (madre + obiettivo)
 *   - Step 2: Obiettivi apprendimento
 *   - Step 3: Livello conoscenza
 *   - Salvataggio profilo Firestore
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { salvaProfiloUtente } from '../services/userService';
import './Onboarding.css';

// Lista lingue complete
const LINGUE = [
  { codice: 'it-IT', nome: '🇮🇹 Italiano', traduzioneAPI: 'it' },
  { codice: 'en-US', nome: '🇺🇸 Inglese (US)', traduzioneAPI: 'en' },
  { codice: 'en-GB', nome: '🇬🇧 Inglese (UK)', traduzioneAPI: 'en' },
  { codice: 'es-ES', nome: '🇪🇸 Spagnolo', traduzioneAPI: 'es' },
  { codice: 'fr-FR', nome: '🇫🇷 Francese', traduzioneAPI: 'fr' },
  { codice: 'de-DE', nome: '🇩🇪 Tedesco', traduzioneAPI: 'de' },
  { codice: 'pt-BR', nome: '🇧🇷 Portoghese', traduzioneAPI: 'pt' },
  { codice: 'ja-JP', nome: '🇯🇵 Giapponese', traduzioneAPI: 'ja' },
  { codice: 'ko-KR', nome: '🇰🇷 Coreano', traduzioneAPI: 'ko' },
  { codice: 'zh-CN', nome: '🇨🇳 Cinese', traduzioneAPI: 'zh' },
  { codice: 'ru-RU', nome: '🇷🇺 Russo', traduzioneAPI: 'ru' },
  { codice: 'ar-XA', nome: '🇸🇦 Arabo', traduzioneAPI: 'ar' }
];

// Obiettivi di apprendimento
const OBIETTIVI = [
  { id: 'viaggio', label: '✈️ Viaggio e turismo', descrizione: 'Comunicare in viaggio' },
  { id: 'lavoro', label: '💼 Lavoro e business', descrizione: 'Uso professionale' },
  { id: 'studio', label: '📚 Studio e università', descrizione: 'Esami e certificazioni' },
  { id: 'cultura', label: '🎭 Cultura e intrattenimento', descrizione: 'Film, libri, musica' },
  { id: 'conversazione', label: '💬 Conversazione quotidiana', descrizione: 'Parlare con nativi' },
  { id: 'altro', label: '🎯 Altro', descrizione: 'Obiettivi personali' }
];

// Livelli di conoscenza
const LIVELLI = [
  { id: 'principiante', label: 'Principiante', emoji: '🌱', descrizione: 'Conosco poche parole' },
  { id: 'elementare', label: 'Elementare', emoji: '🌿', descrizione: 'Frasi semplici' },
  { id: 'intermedio', label: 'Intermedio', emoji: '🌳', descrizione: 'Conversazioni base' },
  { id: 'avanzato', label: 'Avanzato', emoji: '🌲', descrizione: 'Fluente in molti contesti' },
  { id: 'madrelingua', label: 'Madrelingua', emoji: '🏆', descrizione: 'Competenza nativa' }
];

function Onboarding() {
  const { utenteCorrente, caricaProfilo } = useAutenticazione();
  const naviga = useNavigate();

  // Step corrente (1-3)
  const [step, setStep] = useState(1);

  // Dati profilo
  const [linguaMadre, setLinguaMadre] = useState('it-IT');
  const [linguaObiettivo, setLinguaObiettivo] = useState('en-US');
  const [obiettivi, setObiettivi] = useState([]);
  const [livelloConoscenza, setLivelloConoscenza] = useState('');

  // Stati UI
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');

  /**
   * Toggle obiettivo (selezione multipla)
   */
  function toggleObiettivo(id) {
    if (obiettivi.includes(id)) {
      setObiettivi(obiettivi.filter(o => o !== id));
    } else {
      setObiettivi([...obiettivi, id]);
    }
  }

  /**
   * Valida step corrente
   */
  function validaStep() {
    if (step === 1) {
      if (!linguaMadre || !linguaObiettivo) {
        setErrore('Seleziona entrambe le lingue');
        return false;
      }
      if (linguaMadre === linguaObiettivo) {
        setErrore('Lingua madre e obiettivo devono essere diverse');
        return false;
      }
    }

    if (step === 2) {
      if (obiettivi.length === 0) {
        setErrore('Seleziona almeno un obiettivo');
        return false;
      }
    }

    if (step === 3) {
      if (!livelloConoscenza) {
        setErrore('Seleziona il tuo livello');
        return false;
      }
    }

    setErrore('');
    return true;
  }

  /**
   * Avanti step
   */
  function avanti() {
    if (!validaStep()) return;

    if (step < 3) {
      setStep(step + 1);
    } else {
      completaOnboarding();
    }
  }

  /**
   * Indietro step
   */
  function indietro() {
    if (step > 1) {
      setStep(step - 1);
      setErrore('');
    }
  }

  /**
   * Completa onboarding e salva profilo
   */
  async function completaOnboarding() {
    setCaricamento(true);
    setErrore('');

    try {
      const datiProfilo = {
        linguaMadre,
        linguaObiettivo,
        obiettivi,
        livelloConoscenza
      };

      const risultato = await salvaProfiloUtente(utenteCorrente.uid, datiProfilo);

      if (risultato.successo) {
        // Ricarica profilo nel context
        await caricaProfilo();

        // Reindirizza a dashboard
        naviga('/dashboard');
      } else {
        setErrore('Errore nel salvataggio. Riprova.');
      }
    } catch (err) {
      console.error('❌ Errore onboarding:', err);
      setErrore('Si è verificato un errore. Riprova.');
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Header con Progress Bar */}
        <div className="onboarding-header">
          <h1>👋 Benvenuto!</h1>
          <p>Configuriamo la tua esperienza di apprendimento</p>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <p className="step-indicator">Step {step} di 3</p>
        </div>

        {errore && (
          <div className="alert-errore">
            {errore}
          </div>
        )}

        {/* STEP 1: LINGUE */}
        {step === 1 && (
          <div className="onboarding-step">
            <h2>🌍 Che lingue vuoi imparare?</h2>
            <p className="step-subtitle">
              Useremo queste lingue per tutte le tue flashcard
            </p>

            <div className="form-group">
              <label>La tua lingua madre</label>
              <select
                value={linguaMadre}
                onChange={(e) => setLinguaMadre(e.target.value)}
                className="language-select-onboarding"
              >
                {LINGUE.map(lingua => (
                  <option key={lingua.codice} value={lingua.codice}>
                    {lingua.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="separator">➡️</div>

            <div className="form-group">
              <label>Lingua che vuoi imparare</label>
              <select
                value={linguaObiettivo}
                onChange={(e) => setLinguaObiettivo(e.target.value)}
                className="language-select-onboarding"
              >
                {LINGUE.map(lingua => (
                  <option key={lingua.codice} value={lingua.codice}>
                    {lingua.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: OBIETTIVI */}
        {step === 2 && (
          <div className="onboarding-step">
            <h2>🎯 Perché vuoi imparare?</h2>
            <p className="step-subtitle">
              Seleziona uno o più obiettivi (puoi cambiarli dopo)
            </p>

            <div className="obiettivi-grid">
              {OBIETTIVI.map(obiettivo => (
                <button
                  key={obiettivo.id}
                  onClick={() => toggleObiettivo(obiettivo.id)}
                  className={`obiettivo-card ${
                    obiettivi.includes(obiettivo.id) ? 'selected' : ''
                  }`}
                >
                  <div className="obiettivo-label">{obiettivo.label}</div>
                  <div className="obiettivo-descrizione">{obiettivo.descrizione}</div>
                  {obiettivi.includes(obiettivo.id) && (
                    <div className="check-icon">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: LIVELLO */}
        {step === 3 && (
          <div className="onboarding-step">
            <h2>📊 Qual è il tuo livello?</h2>
            <p className="step-subtitle">
              Nella lingua che vuoi imparare ({
                LINGUE.find(l => l.codice === linguaObiettivo)?.nome
              })
            </p>

            <div className="livelli-list">
              {LIVELLI.map(livello => (
                <button
                  key={livello.id}
                  onClick={() => setLivelloConoscenza(livello.id)}
                  className={`livello-card ${
                    livelloConoscenza === livello.id ? 'selected' : ''
                  }`}
                >
                  <span className="livello-emoji">{livello.emoji}</span>
                  <div className="livello-info">
                    <div className="livello-label">{livello.label}</div>
                    <div className="livello-descrizione">{livello.descrizione}</div>
                  </div>
                  {livelloConoscenza === livello.id && (
                    <div className="check-icon">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pulsanti Navigazione */}
        <div className="onboarding-actions">
          {step > 1 && (
            <button 
              onClick={indietro}
              className="btn-secondary"
              disabled={caricamento}
            >
              ← Indietro
            </button>
          )}

          <button 
            onClick={avanti}
            className="btn-primary"
            disabled={caricamento}
          >
            {caricamento ? (
              <>
                <div className="spinner-small"></div>
                Salvataggio...
              </>
            ) : step === 3 ? (
              'Completa ✓'
            ) : (
              'Avanti →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;