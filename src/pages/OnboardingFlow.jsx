/**
 * FILE: src/pages/OnboardingFlow.jsx
 * DATA ULTIMA MODIFICA: 2025-01-19
 * DESCRIZIONE: Onboarding pubblico i18n-ready con cambio lingua automatico
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/OnboardingFlow.css';

// Lista lingue (codici per profilo + API)
const LINGUE = [
  { codice: 'it-IT', nome: 'languages.it-IT', traduzioneAPI: 'it', i18nCode: 'it' },
  { codice: 'en-US', nome: 'languages.en-US', traduzioneAPI: 'en', i18nCode: 'en' },
  { codice: 'es-ES', nome: 'languages.es-ES', traduzioneAPI: 'es', i18nCode: 'es' },
  { codice: 'fr-FR', nome: 'languages.fr-FR', traduzioneAPI: 'fr', i18nCode: 'fr' }];

function OnboardingFlow() {
  const { t, i18n } = useTranslation();
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
   * Carica dati salvati da localStorage (se tornano indietro)
   */
  useEffect(() => {
    const datiSalvatiJSON = localStorage.getItem('onboardingData');
    
    if (datiSalvatiJSON) {
      try {
        const datiSalvati = JSON.parse(datiSalvatiJSON);
        console.log('📦 Dati onboarding caricati da localStorage:', datiSalvati);
        
        if (datiSalvati.linguaMadre) {
          setLinguaMadre(datiSalvati.linguaMadre);
          // Cambia anche la lingua UI
          const lingua = LINGUE.find(l => l.codice === datiSalvati.linguaMadre);
          if (lingua) {
            i18n.changeLanguage(lingua.i18nCode);
          }
        }
        if (datiSalvati.linguaObiettivo) setLinguaObiettivo(datiSalvati.linguaObiettivo);
        if (datiSalvati.obiettivi) setObiettivi(datiSalvati.obiettivi);
        if (datiSalvati.livelloConoscenza) setLivelloConoscenza(datiSalvati.livelloConoscenza);
      } catch (err) {
        console.error('❌ Errore parsing dati localStorage:', err);
      }
    }
  }, []);

  /**
   * Cambia lingua UI quando utente seleziona lingua madre
   */
  function handleLinguaMadreChange(codiceLingua) {
    setLinguaMadre(codiceLingua);
    
    // Trova i18n code e cambia lingua interfaccia
    const lingua = LINGUE.find(l => l.codice === codiceLingua);
    if (lingua && lingua.i18nCode) {
      console.log('🔄 Cambio lingua UI a:', lingua.i18nCode);
      i18n.changeLanguage(lingua.i18nCode);
    }
  }

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
        setErrore(t('onboarding.errors.select_both_languages'));
        return false;
      }
      if (linguaMadre === linguaObiettivo) {
        setErrore(t('onboarding.errors.languages_must_differ'));
        return false;
      }
    }

    if (step === 2) {
      if (obiettivi.length === 0) {
        setErrore(t('onboarding.errors.select_at_least_one_goal'));
        return false;
      }
    }

    if (step === 3) {
      if (!livelloConoscenza) {
        setErrore(t('onboarding.errors.select_level'));
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

  // Obiettivi con chiavi i18n
  const OBIETTIVI = [
    { id: 'viaggio', labelKey: 'onboarding.step2.goals.travel', descKey: 'onboarding.step2.goals.travel_desc' },
    { id: 'lavoro', labelKey: 'onboarding.step2.goals.work', descKey: 'onboarding.step2.goals.work_desc' },
    { id: 'studio', labelKey: 'onboarding.step2.goals.study', descKey: 'onboarding.step2.goals.study_desc' },
    { id: 'cultura', labelKey: 'onboarding.step2.goals.culture', descKey: 'onboarding.step2.goals.culture_desc' },
    { id: 'conversazione', labelKey: 'onboarding.step2.goals.conversation', descKey: 'onboarding.step2.goals.conversation_desc' },
    { id: 'altro', labelKey: 'onboarding.step2.goals.other', descKey: 'onboarding.step2.goals.other_desc' }
  ];

  // Livelli con chiavi i18n
  const LIVELLI = [
    { id: 'principiante', emoji: '🌱', labelKey: 'onboarding.step3.levels.beginner', descKey: 'onboarding.step3.levels.beginner_desc' },
    { id: 'elementare', emoji: '🌿', labelKey: 'onboarding.step3.levels.elementary', descKey: 'onboarding.step3.levels.elementary_desc' },
    { id: 'intermedio', emoji: '🌳', labelKey: 'onboarding.step3.levels.intermediate', descKey: 'onboarding.step3.levels.intermediate_desc' },
    { id: 'avanzato', emoji: '🌲', labelKey: 'onboarding.step3.levels.advanced', descKey: 'onboarding.step3.levels.advanced_desc' },
    { id: 'madrelingua', emoji: '🏆', labelKey: 'onboarding.step3.levels.native', descKey: 'onboarding.step3.levels.native_desc' }
  ];

  return (
    <div className="onboarding-flow-container">
      <div className="onboarding-flow-card">
        {/* HEADER */}
        <div className="onboarding-flow-header">
          <h1>{t('onboarding.welcome')}</h1>
          <p>{t('onboarding.subtitle')}</p>
          
          <div className="progress-bar-flow">
            <div 
              className="progress-fill-flow" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
          <p className="step-indicator-flow">
            {t('onboarding.step_indicator', { current: step, total: 3 })}
          </p>
        </div>

        {errore && (
          <div className="alert-errore">
            {errore}
          </div>
        )}

        {/* STEP 1: LINGUE */}
        {step === 1 && (
          <div className="onboarding-step-flow">
            <h2>{t('onboarding.step1.title')}</h2>
            <p className="step-subtitle-flow">
              {t('onboarding.step1.subtitle')}
            </p>

            <div className="form-group-flow">
              <label>{t('onboarding.step1.native_language')}</label>
              <select
                value={linguaMadre}
                onChange={(e) => handleLinguaMadreChange(e.target.value)}
                className="language-select-flow"
              >
                {LINGUE.map(lingua => (
                  <option key={lingua.codice} value={lingua.codice}>
                    {t(lingua.nome)}
                  </option>
                ))}
              </select>
            </div>

            <div className="separator-flow">➡️</div>

            <div className="form-group-flow">
              <label>{t('onboarding.step1.target_language')}</label>
              <select
                value={linguaObiettivo}
                onChange={(e) => setLinguaObiettivo(e.target.value)}
                className="language-select-flow"
              >
                {LINGUE.map(lingua => (
                  <option key={lingua.codice} value={lingua.codice}>
                    {t(lingua.nome)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: OBIETTIVI */}
        {step === 2 && (
          <div className="onboarding-step-flow">
            <h2>{t('onboarding.step2.title')}</h2>
            <p className="step-subtitle-flow">
              {t('onboarding.step2.subtitle')}
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
                  <div className="obiettivo-label-flow">{t(obiettivo.labelKey)}</div>
                  <div className="obiettivo-descrizione-flow">{t(obiettivo.descKey)}</div>
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
            <h2>{t('onboarding.step3.title')}</h2>
            <p className="step-subtitle-flow">
              {t('onboarding.step3.subtitle')}
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
                    <div className="livello-label-flow">{t(livello.labelKey)}</div>
                    <div className="livello-descrizione-flow">{t(livello.descKey)}</div>
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
              {t('common.back')}
            </button>
          )}

          <button 
            onClick={avanti}
            className="btn-primary-flow"
          >
            {step === 3 ? t('onboarding.continue_to_register') : t('common.next')}
          </button>
        </div>

        {/* LINK LOGIN */}
        {step === 1 && (
          <p className="testo-link-flow">
            {t('auth.have_account')}{' '}
            <button 
              onClick={() => naviga('/login')}
              className="btn-link-flow"
            >
              {t('common.login')}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default OnboardingFlow;
