/**
 * FILE: src/pages/Registrazione.jsx
 * DATA CREAZIONE: 2024-12-25 23:30
 * DESCRIZIONE: Pagina registrazione nuovo utente
 * NOTA: Dopo registrazione, redirect automatico a onboarding
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Login.css'; // Riusa stesso CSS del Login

function Registrazione() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  const { registrazione } = useAutenticazione();
  const naviga = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrore('');

    // Validazione
    if (!email || !password || !confermaPassword) {
      return setErrore('Compila tutti i campi');
    }

    if (password.length < 6) {
      return setErrore('La password deve essere di almeno 6 caratteri');
    }

    if (password !== confermaPassword) {
      return setErrore('Le password non coincidono');
    }

    setCaricamento(true);

    try {
      const risultato = await registrazione(email, password);

      if (risultato.successo) {
        // Redirect automatico a onboarding (gestito da ProtectedRoute)
        naviga('/home');
      } else {
        setErrore(risultato.errore || 'Errore durante la registrazione');
      }
    } catch (err) {
      console.error('❌ Errore registrazione:', err);
      setErrore('Si è verificato un errore. Riprova.');
    } finally {
      setCaricamento(false);
    }
  }

  return (
    <div className="contenitore-login">
      <div className="card-login">
        <h1>📝 Registrati</h1>

        {errore && <div className="alert-errore">{errore}</div>}

        <form onSubmit={handleSubmit}>
          <div className="gruppo-input">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tua@email.com"
              disabled={caricamento}
              required
            />
          </div>

          <div className="gruppo-input">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={caricamento}
              required
            />
          </div>

          <div className="gruppo-input">
            <label htmlFor="confermaPassword">Conferma Password</label>
            <input
              type="password"
              id="confermaPassword"
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              placeholder="••••••••"
              disabled={caricamento}
              required
            />
          </div>

          <button type="submit" className="btn-primario" disabled={caricamento}>
            {caricamento ? (
              <>
                <div className="spinner-small"></div>
                Registrazione...
              </>
            ) : (
              'Registrati'
            )}
          </button>
        </form>

        <p className="testo-cambio-modalita">
          Hai già un account?{' '}
          <Link to="/login" className="btn-link">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Registrazione;