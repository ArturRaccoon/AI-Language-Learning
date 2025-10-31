/**
 * FILE: src/pages/Home.jsx
 * DATA ULTIMA MODIFICA: 2024-12-26 02:00
 * DESCRIZIONE: Hub di navigazione principale - Dashboard utente
 */

import { useState, useEffect } from 'react';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { useNavigate, Link } from 'react-router-dom';
import { ottieniStatistiche } from '../services/flashcardService';
import '../styles/Home.css';

function Home() {
  const { utenteCorrente, logout } = useAutenticazione();
  const naviga = useNavigate();

  // Stati statistiche SRS
  const [statistiche, setStatistiche] = useState(null);
  const [errore, setErrore] = useState('');

  /**
   * Carica statistiche all'avvio
   */
  useEffect(() => {
    if (!utenteCorrente) return;
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
      setErrore('Errore nel caricamento delle statistiche');
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
        <h1>🏠 Home</h1>
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
        {/* ERRORE */}
        {errore && (
          <div className="alert-errore">
            {errore}
          </div>
        )}

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

        {/* STATISTICHE VELOCI */}
        {statistiche && (
          <div className="statistiche-veloci">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-label">Totale Flashcard</div>
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
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <div className="stat-label">Padroneggiate</div>
                <div className="stat-value">{statistiche.padroneggiate}</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-content">
                <div className="stat-label">Media Revisioni</div>
                <div className="stat-value">{statistiche.mediaTotaleRevisioni}</div>
              </div>
            </div>
          </div>
        )}

        {/* MENU PRINCIPALE NAVIGAZIONE */}
        <nav className="menu-principale">
          <h2>📋 Menu Principale</h2>
          
          <div className="menu-grid">
            {/* Sessione Studio */}
            <Link to="/studia" className="menu-card menu-card-primary">
              <div className="menu-icon">🧠</div>
              <div className="menu-content">
                <h3>Inizia Sessione di Studio</h3>
                <p>Ripassa le flashcard programmate per oggi</p>
                {statistiche && statistiche.daRivedere > 0 && (
                  <span className="menu-badge">{statistiche.daRivedere} da rivedere</span>
                )}
              </div>
              <div className="menu-arrow">→</div>
            </Link>

            {/* Gestione Flashcard */}
            <Link to="/flashcards" className="menu-card">
              <div className="menu-icon">📚</div>
              <div className="menu-content">
                <h3>Gestisci le mie Flashcard</h3>
                <p>Crea, modifica ed elimina le tue flashcard</p>
                {statistiche && (
                  <span className="menu-badge">{statistiche.totale} totali</span>
                )}
              </div>
              <div className="menu-arrow">→</div>
            </Link>

            {/* Chat AI */}
            <Link to="/chat" className="menu-card">
              <div className="menu-icon">💬</div>
              <div className="menu-content">
                <h3>Chat con l'AI</h3>
                <p>Pratica la lingua con il tutor virtuale</p>
              </div>
              <div className="menu-arrow">→</div>
            </Link>

            {/* Statistiche */}
            <Link to="/statistiche" className="menu-card">
              <div className="menu-icon">📊</div>
              <div className="menu-content">
                <h3>Vedi i miei Progressi</h3>
                <p>Analizza le tue statistiche di apprendimento</p>
              </div>
              <div className="menu-arrow">→</div>
            </Link>

            {/* Impostazioni */}
            <Link to="/impostazioni" className="menu-card">
              <div className="menu-icon">⚙️</div>
              <div className="menu-content">
                <h3>Impostazioni Profilo</h3>
                <p>Modifica preferenze e configurazioni</p>
              </div>
              <div className="menu-arrow">→</div>
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}

export default Home;