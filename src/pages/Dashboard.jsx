/**
 * FILE: src/pages/Dashboard.jsx
 * DATA ULTIMA MODIFICA: 2024-12-25 23:55
 * DESCRIZIONE: Pagina principale dashboard
 */

import { useState, useEffect } from 'react';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { useNavigate } from 'react-router-dom';
import { ottieniFlashcards, eliminaFlashcard, ottieniStatistiche } from '../services/flashcardService';
import Flashcard from '../components/Flashcard';
import FlashcardForm from '../components/FlashcardForm';
import '../styles/Dashboard.css';

function Dashboard() {
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
  
  // Stati statistiche SRS
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
   * Carica statistiche per widget SRS
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
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>📚 Dashboard</h1>
        <div className="header-user">
          <span className="user-email">
            {utenteCorrente && utenteCorrente.email}
          </span>
          <button onClick={gestisciLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* WIDGET SESSIONE STUDIO */}
        {statistiche && statistiche.daRivedere > 0 && (
          <div className="widget-studio">
            <div className="widget-icon">🧠</div>
            <div className="widget-content">
              <h3>Sessione di Studio</h3>
              <p className="widget-count">
                {statistiche.daRivedere} flashcard da rivedere oggi
              </p>
              <p className="widget-subtitle">
                Mantieni viva la memoria!
              </p>
            </div>
            <button 
              onClick={() => naviga('/studia')} 
              className="btn-widget"
            >
              Inizia Ora
            </button>
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

export default Dashboard;