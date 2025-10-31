/**
 * FILE: src/pages/OnboardingFlow.jsx
 * DATA CREAZIONE: 2024-12-26 00:55
 * DESCRIZIONE: Onboarding pubblico prima di registrazione (salva in localStorage)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/OnboardingFlow.css';

// Lista lingue
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

// Obiettivi
const OBIETTIVI = [
  { id: 'viaggio', label: '✈️ Viaggio', descrizione: 'Comunicare in viaggio' },
  { id: 'lavoro', label: '💼 Lavoro', descrizione: 'Uso professionale' },
  { id: 'studio', label: '📚 Studio', descrizione: 'Esami e certificazioni' },
  { id: 'cultura', label: '🎭 Cultura', descrizione: 'Film, libri, musica' },
  { id: 'conversazione', label: '💬 Conversazione', descrizione: 'Parlare con nativi' },
  { id: 'altro', label: '🎯 Altro', descrizione: 'Obiettivi personali' }
];

// Livelli
const LIVELLI = [
  { id: 'principiante', label: 'Principiante', emoji: '🌱', descrizione: 'Conosco poche parole' },
  { id: 'elementare', label: 'Elementare', emoji: '🌿', descrizione: 'Frasi semplici' },
  { id: 'intermedio', label: 'Intermedio', emoji: '🌳', descrizione: 'Conversazioni base' },
  { id: 'avanzato', label: 'Avanzato', emoji: '🌲', descrizione: 'Fluente' },
  { id: 'madrelingua', label: 'Madrelingua', emoji: '🏆', descrizione: 'Competenza nativa' }
];

function OnboardingFlow() {
  const { utenteCorrente } = useAutenticazione();
  const naviga = useNavigate();

  const [step, setStep] = useState(1);
  const [errore, setErrore] = useState('');

  // Dati onboarding
  const [linguaMadre, setLinguaMadre] = useState('it-IT');
  const [linguaObiettivo, setLinguaObiettivo] = useState('en-US');
  const [obiettivi, setObiettivi] = useState([]);
  const [livelloConoscenza, setLivelloConoscenza] = useState('');

  /**
   * Se utente è già loggato con profilo completo → redirect dashboard
   */
  useEffect(() => {
    if (utenteCorrente) {
      console.log('ℹ️ Utente già loggato, skip onboarding pubblico');
      naviga('/dashboard');
    }
  }, [utenteCorrente, naviga]);

  /**
   * Carica dati salvati da localStorage (se tornano indietro)
   */
  useEffect(() => {
    const datiSalvatiJSON = localStorage.getItem('onboardingData');
    
    if (datiSalvatiJSON) {
      try {
        const datiSalvati = JSON.parse(datiSalvatiJSON);
        console.log('📦 Dati onboarding caricati da localStorage:', datiSalvati);
        
        if (datiSalvati.linguaMadre) setLinguaMadre(datiSalvati.linguaMadre);
        if (datiSalvati.linguaObiettivo) setLinguaObiettivo(datiSalvati.linguaObiettivo);
        if (datiSalvati.obiettivi) setObiettivi(datiSalvati.obiettivi);
        if (datiSalvati.livelloConoscenza) setLivelloConoscenza(datiSalvati.livelloConoscenza);
      } catch (err) {
        console.error('❌ Errore parsing dati localStorage:', err);
      }
    }
  }, []);

  /**
   * Toggle obiettivo
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
    setErrore('');
    
    if (step === 1) {
      if (!linguaMadre || !linguaObiettivo) {
        setErrore('Seleziona entrambe le lingue');
        return false;
      }
      if (linguaMadre === linguaObiettivo) {
        setErrore('Le lingue devono essere diverse');
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

    return true;
  }

  /**
   * Avanti step
   */
  function avanti() {
    if (!validaStep()) return;

    // Salva in localStorage
    const datiOnboarding = {
      linguaMadre,
      linguaObiettivo,
      obiettivi,
      livelloConoscenza
    };

    localStorage.setItem('onboardingData', JSON.stringify(datiOnboarding));
    console.log('💾 Dati onboarding salvati in localStorage');

    if (step < 3) {
      setStep(step + 1);
    } else {
      // Step 3 completato → vai a registrazione
      console.log('✅ Onboarding completato, redirect registrazione');
      naviga('/registrazione');
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

  return (
    <div className="onboarding-flow-container">
      <div className="onboarding-flow-card">
        {/* HEADER */}
        <div className="onboarding-flow-header">
          <h1>👋 Benvenuto!</h1>
          <p>Iniziamo a configurare la tua esperienza</p>
          
          <div className="progress-bar-flow">
            <div 
              className="progress-fill-flow" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <p className="step-indicator-flow">Step {step} di 3</p>
        </div>

        {errore && (
          <div className="alert-errore">
            {errore}
          </div>
        )}

        {/* STEP 1: LINGUE */}
        {step === 1 && (
          <div className="onboarding-step-flow">
            <h2>🌍 Che lingue vuoi imparare?</h2>
            <p className="step-subtitle-flow">
              Scegli la tua lingua madre e quella che vuoi studiare
            </p>

            <div className="form-group-flow">
              <label>La tua lingua madre</label>
              <select
                value={linguaMadre}
                onChange={(e) => setLinguaMadre(e.target.value)}
                className="language-select-flow"
              >
                {LINGUE.map(lingua => (
                  <option key={lingua.codice} value={lingua.codice}>
                    {lingua.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="separator-flow">➡️</div>

            <div className="form-group-flow">
              <label>Lingua che vuoi imparare</label>
              <select
                value={linguaObiettivo}
                onChange={(e) => setLinguaObiettivo(e.target.value)}
                className="language-select-flow"
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
          <div className="onboarding-step-flow">
            <h2>🎯 Perché vuoi imparare?</h2>
            <p className="step-subtitle-flow">
              Seleziona uno o più obiettivi
            </p>

            <div className="obiettivi-grid-flow">
              {OBIETTIVI.map(obiettivo => (
                <button
                  key={obiettivo.id}
                  onClick={() => toggleObiettivo(obiettivo.id)}
                  className={`obiettivo-card-flow ${
                    obiettivi.includes(obiettivo.id) ? 'selected' : ''
                  }`}
                >
                  <div className="obiettivo-label-flow">{obiettivo.label}</div>
                  <div className="obiettivo-descrizione-flow">{obiettivo.descrizione}</div>
                  {obiettivi.includes(obiettivo.id) && (
                    <div className="check-icon-flow">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: LIVELLO */}
        {step === 3 && (
          <div className="onboarding-step-flow">
            <h2>📊 Qual è il tuo livello?</h2>
            <p className="step-subtitle-flow">
              Nella lingua che vuoi imparare
            </p>

            <div className="livelli-list-flow">
              {LIVELLI.map(livello => (
                <button
                  key={livello.id}
                  onClick={() => setLivelloConoscenza(livello.id)}
                  className={`livello-card-flow ${
                    livelloConoscenza === livello.id ? 'selected' : ''
                  }`}
                >
                  <span className="livello-emoji-flow">{livello.emoji}</span>
                  <div className="livello-info-flow">
                    <div className="livello-label-flow">{livello.label}</div>
                    <div className="livello-descrizione-flow">{livello.descrizione}</div>
                  </div>
                  {livelloConoscenza === livello.id && (
                    <div className="check-icon-flow">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PULSANTI NAVIGAZIONE */}
        <div className="onboarding-actions-flow">
          {step > 1 && (
            <button 
              onClick={indietro}
              className="btn-secondary-flow"
            >
              ← Indietro
            </button>
          )}

          <button 
            onClick={avanti}
            className="btn-primary-flow"
          >
            {step === 3 ? 'Vai alla Registrazione →' : 'Avanti →'}
          </button>
        </div>

        {/* LINK LOGIN */}
        {step === 1 && (
          <p className="testo-link-flow">
            Hai già un account?{' '}
            <button 
              onClick={() => naviga('/login')}
              className="btn-link-flow"
            >
              Accedi
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
