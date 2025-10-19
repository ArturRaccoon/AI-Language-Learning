// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { useNavigate } from 'react-router-dom';
import { creaFlashcard, ascoltaFlashcards, eliminaFlashcard } from '../services/flashcardService';
import Flashcard from '../components/Flashcard';
import '../styles/Dashboard.css';

function Dashboard() {
  const { utenteCorrente, logout } = useAutenticazione();
  const naviga = useNavigate();

  const [parolaOriginale, setParolaOriginale] = useState('');
  const [traduzione, setTraduzione] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [caricamento, setCaricamento] = useState(true);

  // <-- MODIFICATO: Usa listener in tempo reale
  useEffect(() => {
    if (!utenteCorrente) return;

    setCaricamento(true);
    
    // Avvia l'ascolto delle flashcard
    const fermaAscolto = ascoltaFlashcards(utenteCorrente.uid, (risultato) => {
      if (risultato.successo) {
        setFlashcards(risultato.dati);
        setCaricamento(false);
      }
    });

    // Pulisci il listener quando il componente si smonta
    return () => fermaAscolto();
  }, [utenteCorrente]);

  async function gestisciCreaFlashcard(e) {
    e.preventDefault();
    if (!parolaOriginale || !traduzione) return;
    
    const risultato = await creaFlashcard(utenteCorrente.uid, { 
      parolaOriginale, 
      traduzione 
    });
    
    if (risultato.successo) {
      setParolaOriginale('');
      setTraduzione('');
      // Non serve ricaricare: il listener aggiornerà automaticamente!
    }
  }
  
  async function gestisciElimina(idFlashcard) {
    await eliminaFlashcard(idFlashcard);
    // Non serve ricaricare: il listener aggiornerà automaticamente!
  }

  async function gestisciLogout() {
    try {
      await logout();
      naviga('/login');
    } catch (errore) {
      console.error("Errore nel logout:", errore);
    }
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div>
          <span>{utenteCorrente && utenteCorrente.email}</span>
          <button onClick={gestisciLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="sezione-creazione">
          <form onSubmit={gestisciCreaFlashcard}>
            <h2>Crea una nuova Flashcard</h2>
            <input 
              type="text" 
              value={parolaOriginale} 
              onChange={(e) => setParolaOriginale(e.target.value)} 
              placeholder="Parola o frase originale"
            />
            <input 
              type="text" 
              value={traduzione} 
              onChange={(e) => setTraduzione(e.target.value)} 
              placeholder="Traduzione"
            />
            <button type="submit">Crea</button>
          </form>
        </div>

        <div className="sezione-lista">
          <h2>Le tue Flashcard</h2>
          {caricamento && <p>Caricamento...</p>}
          <div className="griglia-flashcard">
            {!caricamento && flashcards.map(card => (
              <Flashcard 
                key={card.id} 
                card={card} 
                onElimina={gestisciElimina} 
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;