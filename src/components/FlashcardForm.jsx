/**
 * FILE: src/components/FlashcardForm.jsx
 * DATA ULTIMA MODIFICA: 2024-12-25 22:45
 * DESCRIZIONE: Form creazione flashcard con lingue automatiche dal profilo
 * CHANGELOG:
 *   - Rimossi selettori manuali lingue
 *   - Lingue recuperate da `profiloUtente` via context
 *   - Traduzione automatica usa lingue profilo
 *   - Validazione: errore se profilo non caricato
 */

import { useState, useEffect } from 'react';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { aggiungiFlashcard } from '../services/flashcardService';
import { traduciTesto } from '../services/traduzioneService';
import './FlashcardForm.css';

// Mappa codici lingua per API traduzione
const LINGUA_API_MAP = {
  'it-IT': 'it',
  'en-US': 'en',
  'en-GB': 'en',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'pt-BR': 'pt',
  'ja-JP': 'ja',
  'ko-KR': 'ko',
  'zh-CN': 'zh',
  'ru-RU': 'ru',
  'ar-XA': 'ar'
};

function FlashcardForm({ onFlashcardAggiunta }) {
  const { utenteCorrente, profiloUtente } = useAutenticazione();

  // Verifica profilo disponibile
  if (!profiloUtente) {
    return (
      <div className="alert-errore">
        ⚠️ Profilo non caricato. Riprova o completa l'onboarding.
      </div>
    );
  }

  // Estrai lingue dal profilo
  const linguaMadre = profiloUtente.linguaMadre;
  const linguaObiettivo = profiloUtente.linguaObiettivo;

  // Codici per API traduzione
  const linguaMadreAPI = LINGUA_API_MAP[linguaMadre] || 'it';
  const linguaObiettivoAPI = LINGUA_API_MAP[linguaObiettivo] || 'en';

  // Stati form
  const [testoOriginale, setTestoOriginale] = useState('');
  const [traduzione, setTraduzione] = useState('');
  const [note, setNote] = useState('');
  const [categoria, setCategoria] = useState('');

  // Stati UI
  const [caricamento, setCaricamento] = useState(false);
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState(false);
  const [traduzioneAutomatica, setTraduzioneAutomatica] = useState(false);

  /**
   * Traduzione automatica
   */
  async function ottieniTraduzione() {
    if (!testoOriginale.trim()) {
      setErrore('Inserisci il testo da tradurre');
      return;
    }

    setTraduzioneAutomatica(true);
    setErrore('');

    try {
      const risultato = await traduciTesto(
        testoOriginale,
        linguaObiettivoAPI,
        linguaMadreAPI
      );

      if (risultato.successo) {
        setTraduzione(risultato.traduzione);
        console.log('✅ Traduzione ottenuta');
      } else {
        setErrore('Errore traduzione. Inserisci manualmente.');
      }
    } catch (err) {
      console.error('❌ Errore traduzione:', err);
      setErrore('Errore traduzione. Riprova.');
    } finally {
      setTraduzioneAutomatica(false);
    }
  }

  /**
   * Salva flashcard
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');
    setSuccesso(false);

    // Validazione
    if (!testoOriginale.trim()) {
      setErrore('Il testo originale è obbligatorio');
      return;
    }

    if (!traduzione.trim()) {
      setErrore('La traduzione è obbligatoria');
      return;
    }

    setCaricamento(true);

    try {
      const nuovaFlashcard = {
        testoOriginale: testoOriginale.trim(),
        traduzione: traduzione.trim(),
        note: note.trim(),
        categoria: categoria.trim() || 'generale',
        linguaOriginale: linguaMadre, // Dal profilo
        linguaTraduzione: linguaObiettivo, // Dal profilo
        idUtente: utenteCorrente.uid
      };

      const risultato = await aggiungiFlashcard(nuovaFlashcard);

      if (risultato.successo) {
        setSuccesso(true);
        
        // Reset form
        setTestoOriginale('');
        setTraduzione('');
        setNote('');
        setCategoria('');

        // Callback parent
        if (onFlashcardAggiunta) {
          onFlashcardAggiunta(risultato.flashcard);
        }

        // Nascondi messaggio successo dopo 3s
        setTimeout(() => setSuccesso(false), 3000);
      } else {
        setErrore('Errore nel salvataggio. Riprova.');
      }
    } catch (err) {
      console.error('❌ Errore salvataggio flashcard:', err);
      setErrore('Errore imprevisto. Riprova.');
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="flashcard-form-container">
      <div className="lingue-info">
        <div className="lingua-badge">
          <span className="label">Dalla tua lingua:</span>
          <span className="valore">{getLinguaNome(linguaMadre)}</span>
        </div>
        <span className="arrow">→</span>
        <div className="lingua-badge">
          <span className="label">Verso:</span>
          <span className="valore">{getLinguaNome(linguaObiettivo)}</span>
        </div>
      </div>

      {errore && (
        <div className="alert-errore">
          {errore}
        </div>
      )}

      {successo && (
        <div className="alert-successo">
          ✅ Flashcard salvata con successo!
        </div>
      )}

      <form onSubmit={handleSubmit} className="flashcard-form">
        <div className="form-group">
          <label htmlFor="testoOriginale">
            Testo originale ({getLinguaNome(linguaMadre)}) *
          </label>
          <textarea
            id="testoOriginale"
            value={testoOriginale}
            onChange={(e) => setTestoOriginale(e.target.value)}
            placeholder="Es: Hello world"
            rows={3}
            disabled={caricamento}
          />
        </div>

        <div className="form-group">
          <label htmlFor="traduzione">
            Traduzione ({getLinguaNome(linguaObiettivo)}) *
          </label>
          <div className="traduzione-group">
            <textarea
              id="traduzione"
              value={traduzione}
              onChange={(e) => setTraduzione(e.target.value)}
              placeholder="Es: Ciao mondo"
              rows={3}
              disabled={caricamento}
            />
            <button
              type="button"
              onClick={ottieniTraduzione}
              disabled={caricamento || traduzioneAutomatica || !testoOriginale.trim()}
              className="btn-traduzione"
            >
              {traduzioneAutomatica ? '⏳ Traduzione...' : '🔄 Traduci automaticamente'}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categoria">Categoria (opzionale)</label>
          <input
            type="text"
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Es: viaggio, lavoro, quotidiano"
            disabled={caricamento}
          />
        </div>

        <div className="form-group">
          <label htmlFor="note">Note (opzionali)</label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Aggiungi contesto o esempi d'uso"
            rows={2}
            disabled={caricamento}
          />
        </div>

        <button
          type="submit"
          disabled={caricamento}
          className="btn-primary"
        >
          {caricamento ? (
            <>
              <div className="spinner-small"></div>
              Salvataggio...
            </>
          ) : (
            '💾 Salva Flashcard'
          )}
        </button>
      </form>
    </div>
  );
}

/**
 * Helper: ottieni nome leggibile lingua
 */
function getLinguaNome(codice) {
  const NOMI_LINGUE = {
    'it-IT': '🇮🇹 Italiano',
    'en-US': '🇺🇸 Inglese (US)',
    'en-GB': '🇬🇧 Inglese (UK)',
    'es-ES': '🇪🇸 Spagnolo',
    'fr-FR': '🇫🇷 Francese',
    'de-DE': '🇩🇪 Tedesco',
    'pt-BR': '🇧🇷 Portoghese',
    'ja-JP': '🇯🇵 Giapponese',
    'ko-KR': '🇰🇷 Coreano',
    'zh-CN': '🇨🇳 Cinese',
    'ru-RU': '🇷🇺 Russo',
    'ar-XA': '🇸🇦 Arabo'
  };

  return NOMI_LINGUE[codice] || codice;
}

export default FlashcardForm;