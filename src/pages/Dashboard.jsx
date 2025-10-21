// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { useNavigate } from 'react-router-dom';
import { creaFlashcard, ottieniFlashcards, eliminaFlashcard } from '../services/flashcardService';
import Flashcard from '../components/Flashcard';
import '../styles/Dashboard.css';

function Dashboard() {
  const { utenteCorrente, logout } = useAutenticazione();
  const naviga = useNavigate();

  // Stati per form creazione
  const [parolaOriginale, setParolaOriginale] = useState('');
  const [traduzione, setTraduzione] = useState('');
  
  // Stati per lista flashcard
  const [flashcards, setFlashcards] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [caricamentoPagina, setCaricamentoPagina] = useState(false);
  
  // Stati per paginazione
  const [ultimoDocumento, setUltimoDocumento] = useState(null);
  const [haAltrePagine, setHaAltrePagine] = useState(false);
  
  // Stati per feedback
  const [errore, setErrore] = useState('');
  
  // Stati per statistiche (widget futuro)
  const [statistiche, setStatistiche] = useState(null);

  /**
   * CARICA PRIMA PAGINA - Al montaggio del componente
   */
  useEffect(() => {
    if (!utenteCorrente) return;
    caricaPrimaPagina();
    caricaStatistiche(); // Carica anche le statistiche
  }, [utenteCorrente]);
  
  /**
   * Carica statistiche per widget SRS
   */
  async function caricaStatistiche() {
    try {
      // Importa la funzione solo quando serve (lazy loading)
      const { ottieniStatistiche } = await import('../services/flashcardService');
      const risultato = await ottieniStatistiche(utenteCorrente.uid);
      
      if (risultato.successo) {
        setStatistiche(risultato.dati);
      }
    } catch (err) {
      console.error('Errore caricamento statistiche:', err);
      // Non blocca l'app se le statistiche falliscono
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
   * Carica la pagina successiva (append alle esistenti)
   */
  async function caricaPaginaSuccessiva() {
    if (!ultimoDocumento) return;
    
    setCaricamentoPagina(true);
    
    const risultato = await ottieniFlashcards(utenteCorrente.uid, ultimoDocumento);
    
    if (risultato.successo) {
      // Aggiungi le nuove card a quelle esistenti
      setFlashcards(prev => [...prev, ...risultato.dati]);
      setUltimoDocumento(risultato.ultimoDocumento);
      setHaAltrePagine(risultato.haAltrePagine);
    } else {
      setErrore('Errore nel caricamento delle altre flashcard');
    }
    
    setCaricamentoPagina(false);
  }

  /**
   * CREA NUOVA FLASHCARD
   */
  async function gestisciCreaFlashcard(e) {
    e.preventDefault();
    
    // Validazione input
    if (!parolaOriginale.trim() || !traduzione.trim()) {
      setErrore('Compila entrambi i campi');
      return;
    }
    
    if (parolaOriginale.length > 100 || traduzione.length > 100) {
      setErrore('Il testo è troppo lungo (max 100 caratteri)');
      return;
    }
    
    setErrore('');
    
    const risultato = await creaFlashcard(utenteCorrente.uid, { 
      parolaOriginale: parolaOriginale.trim(), 
      traduzione: traduzione.trim() 
    });
    
    if (risultato.successo) {
      // Ottimizzazione: aggiungi la card in testa senza ricaricare tutto
      const nuovaCard = {
        id: risultato.id,
        parolaOriginale: parolaOriginale.trim(),
        traduzione: traduzione.trim(),
        dataCreazione: new Date().toISOString(),
        livelloConoscenza: 1,
        numeroRevisioni: 0
      };
      
      setFlashcards(prev => [nuovaCard, ...prev]);
      
      // Reset form
      setParolaOriginale('');
      setTraduzione('');
    } else {
      setErrore('Errore nella creazione della flashcard');
    }
  }
  
  /**
   * ELIMINA FLASHCARD
   */
  async function gestisciElimina(idFlashcard) {
    const risultato = await eliminaFlashcard(idFlashcard);
    
    if (risultato.successo) {
      // Ottimizzazione: rimuovi solo quella card senza ricaricare tutto
      setFlashcards(prev => prev.filter(card => card.id !== idFlashcard));
    } else {
      setErrore('Errore nell\'eliminazione della flashcard');
    }
  }

  /**
   * LOGOUT
   */
  async function gestisciLogout() {
    try {
      await logout();
      naviga('/login');
    } catch (errore) {
      console.error("Errore nel logout:", errore);
      setErrore('Errore durante il logout');
    }
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>📚 Dashboard</h1>
        <div className="header-user">
          <span className="user-email">{utenteCorrente && utenteCorrente.email}</span>
          <button onClick={gestisciLogout} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* WIDGET SESSIONE STUDIO (se statistiche disponibili) */}
        {statistiche && statistiche.daRivedere > 0 && (
          <div className="widget-studio">
            <div className="widget-icon">🧠</div>
            <div className="widget-content">
              <h3>Sessione di Studio</h3>
              <p className="widget-count">{statistiche.daRivedere} flashcard da rivedere oggi</p>
              <p className="widget-subtitle">Mantieni viva la memoria!</p>
            </div>
            <button 
              onClick={() => alert('Funzionalità in arrivo! 🚀')} 
              className="btn-widget"
            >
              Inizia Ora
            </button>
          </div>
        )}
        
        {/* SEZIONE CREAZIONE */}
        <div className="sezione-creazione">
          <form onSubmit={gestisciCreaFlashcard}>
            <h2>✨ Crea una nuova Flashcard</h2>
            
            {errore && <div className="alert-errore">{errore}</div>}
            
            <input 
              type="text" 
              value={parolaOriginale} 
              onChange={(e) => setParolaOriginale(e.target.value)} 
              placeholder="Parola o frase originale (es. Hello)"
              maxLength={100}
            />
            
            <input 
              type="text" 
              value={traduzione} 
              onChange={(e) => setTraduzione(e.target.value)} 
              placeholder="Traduzione (es. Ciao)"
              maxLength={100}
            />
            
            <button type="submit" disabled={!parolaOriginale.trim() || !traduzione.trim()}>
              Crea Flashcard
            </button>
          </form>
        </div>

        {/* SEZIONE LISTA */}
        <div className="sezione-lista">
          <div className="lista-header">
            <h2>📋 Le tue Flashcard</h2>
            {flashcards.length > 0 && (
              <span className="counter">{flashcards.length} card{flashcards.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          {/* Loading iniziale */}
          {caricamento && (
            <div className="caricamento">
              <div className="spinner"></div>
              <p>Caricamento flashcard...</p>
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
          {!caricamento && flashcards.length === 0 && (
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