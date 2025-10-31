/**
 * FILE: src/pages/Flashcards.jsx
 * DATA ULTIMA MODIFICA: 2024-12-26 02:00
 * DESCRIZIONE: Pagina gestione completa flashcards (creazione + lista)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { ottieniFlashcards, eliminaFlashcard, ottieniStatistiche } from '../services/flashcardService';
import Flashcard from '../components/Flashcard';
import FlashcardForm from '../components/FlashcardForm';
import '../styles/Home.css'; // Riusa gli stessi stili

function Flashcards() {
  const { utenteCorrente, logout } = useAutenticazione();
  const naviga = useNavigate();

  // Stati lista flashcard
  const [flashcards, setFlashcards] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoPagina, setCaricamentoPagina] = useState(false);
  
  // Stati paginazione
  const [ultimoDocumento, setUltimoDocumento] = useState(null);
  const [haAltrePagine, setHaAltrePagine] = useState(false);
  
  // Stati feedback
  const [errore, setErrore] = useState('');
  
  // Stati statistiche (per aggiornamento dopo operazioni)
  const [statistiche, setStatistiche] = useState(null);

  /**
   * Carica prima pagina e statistiche all'avvio
   */
  useEffect(() => {
    if (!utenteCorrente) return;
    caricaPrimaPagina();
    caricaStatistiche();
  }, [utenteCorrente]);

  /**
   * Carica statistiche
   */
  async function caricaStatistiche() {
    try {
      const risultato = await ottieniStatistiche(utenteCorrente.uid);
      
      if (risultato.successo) {
        setStatistiche(risultato.dati);
      }
    } catch (err) {
      console.error('❌ Errore caricamento statistiche:', err);
    }
  }

  /**
   * Carica la prima pagina di flashcard
   */
  async function caricaPrimaPagina() {
    setCaricamento(true);
    setErrore('');
    
    const risultato = await ottieniFlashcards(utenteCorrente.uid);
    
    if (risultato.successo) {
      setFlashcards(risultato.dati);
      setUltimoDocumento(risultato.ultimoDocumento);
      setHaAltrePagine(risultato.haAltrePagine);
    } else {
      setErrore('Errore nel caricamento delle flashcard');
    }
    
    setCaricamento(false);
  }

  /**
   * Carica la pagina successiva (append)
   */
  async function caricaPaginaSuccessiva() {
    if (!ultimoDocumento) return;
    
    setCaricamentoPagina(true);
    
    const risultato = await ottieniFlashcards(utenteCorrente.uid, ultimoDocumento);
    
    if (risultato.successo) {
      setFlashcards(prev => [...prev, ...risultato.dati]);
      setUltimoDocumento(risultato.ultimoDocumento);
      setHaAltrePagine(risultato.haAltrePagine);
    } else {
      setErrore('Errore nel caricamento delle altre flashcard');
    }
    
    setCaricamentoPagina(false);
  }

  /**
   * Callback quando flashcard creata
   */
  function gestisciFlashcardAggiunta(nuovaCard) {
    // Aggiungi in testa
    setFlashcards(prev => [nuovaCard, ...prev]);
    
    // Ricarica statistiche
    caricaStatistiche();

    // Scroll verso l'alto per vedere la nuova card
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Elimina flashcard
   */
  async function gestisciElimina(idFlashcard) {
    const risultato = await eliminaFlashcard(idFlashcard);
    
    if (risultato.successo) {
      // Rimuovi dalla lista
      setFlashcards(prev => prev.filter(card => card.id !== idFlashcard));
      
      // Ricarica statistiche
      caricaStatistiche();
    } else {
      setErrore('Errore nell\'eliminazione della flashcard');
    }
  }

  /**
   * Logout
   */
  async function gestisciLogout() {
    try {
      await logout();
      naviga('/login');
    } catch (errore) {
      console.error("❌ Errore nel logout:", errore);
      setErrore('Errore durante il logout');
    }
  }

  return (
    <div className="home-contenitore">
      {/* HEADER */}
      <header className="home-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => naviga('/home')} 
            className="btn-back"
            style={{
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ← Home
          </button>
          <h1>📚 Gestione Flashcard</h1>
        </div>
        <div className="header-user">
          <span className="user-email">
            {utenteCorrente && utenteCorrente.email}
          </span>
          <button onClick={gestisciLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="home-main">
        {/* STATISTICHE VELOCI */}
        {statistiche && (
          <div className="statistiche-veloci" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-label">Totale</div>
                <div className="stat-value">{statistiche.totale}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🆕</div>
              <div className="stat-content">
                <div className="stat-label">Nuove</div>
                <div className="stat-value">{statistiche.nuove}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <div className="stat-label">Da Rivedere</div>
                <div className="stat-value">{statistiche.daRivedere}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-label">Padroneggiate</div>
                <div className="stat-value">{statistiche.padroneggiate}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEZIONE CREAZIONE */}
        <div className="sezione-creazione">
          <h2>✨ Crea Nuova Flashcard</h2>
          <FlashcardForm 
            onFlashcardAggiunta={gestisciFlashcardAggiunta}
          />
        </div>

        {/* SEZIONE LISTA */}
        <div className="sezione-lista">
          <div className="lista-header">
            <h2>📋 Le tue Flashcard</h2>
            {flashcards.length > 0 && (
              <span className="counter">
                {flashcards.length} card{flashcards.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Loading iniziale */}
          {caricamento && (
            <div className="caricamento">
              <div className="spinner"></div>
              <p>Caricamento flashcard...</p>
            </div>
          )}
          
          {/* Errore */}
          {errore && (
            <div className="alert-errore">
              {errore}
            </div>
          )}
          
          {/* Lista flashcard */}
          {!caricamento && flashcards.length > 0 && (
            <>
              <div className="griglia-flashcard">
                {flashcards.map(card => (
                  <Flashcard 
                    key={card.id} 
                    card={card} 
                    onElimina={gestisciElimina} 
                  />
                ))}
              </div>
              
              {/* Bottone "Carica Altro" */}
              {haAltrePagine && (
                <div className="paginazione">
                  <button 
                    onClick={caricaPaginaSuccessiva} 
                    disabled={caricamentoPagina}
                    className="btn-carica-altro"
                  >
                    {caricamentoPagina ? (
                      <>
                        <div className="spinner-small"></div>
                        Caricamento...
                      </>
                    ) : (
                      '⬇️ Carica Altro'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* Stato vuoto */}
          {!caricamento && flashcards.length === 0 && !errore && (
            <div className="stato-vuoto">
              <p>📝 Nessuna flashcard ancora.</p>
              <p>Crea la tua prima card qui sopra!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Flashcards;