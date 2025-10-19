// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalita, setModalita] = useState('login');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  // <-- NUOVO: Ora importiamo anche loginConGoogle
  const { login, registrazione, loginConGoogle } = useAutenticazione(); 
  const naviga = useNavigate();

  async function gestisciInvio(e) {
    e.preventDefault();
    if (password.length < 6) {
      return setErrore('La password deve essere di almeno 6 caratteri');
    }
    setErrore('');
    setCaricamento(true);
    try {
      if (modalita === 'login') {
        await login(email, password);
      } else {
        await registrazione(email, password);
      }
      naviga('/dashboard');
    } catch (err) {
      setErrore('Credenziali non valide o email già in uso.');
    } finally {
      setCaricamento(false);
    }
  }

  // <-- NUOVO: Funzione per gestire il click sul bottone di Google
  async function gestisciLoginGoogle() {
    setErrore('');
    setCaricamento(true);
    try {
      await loginConGoogle();
      naviga('/dashboard');
    } catch (err) {
      setErrore('Errore durante il login con Google');
    } finally {
      setCaricamento(false);
    }
  }

  function cambiaModalita() {
    setModalita(modalita === 'login' ? 'registrazione' : 'login');
    setErrore('');
  }

  return (
    <div className="contenitore-login">
      <div className="card-login">
        <h1>{modalita === 'login' ? 'Accedi' : 'Registrati'}</h1>
        
        {errore && <div className="alert-errore">{errore}</div>}
        
        <form onSubmit={gestisciInvio}>
          <div className="gruppo-input">
            <label htmlFor="email">Email</label>
            <input
              type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tua@email.com" disabled={caricamento}
            />
          </div>
          <div className="gruppo-input">
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" disabled={caricamento}
            />
          </div>
          <button type="submit" className="btn-primario" disabled={caricamento}>
            {caricamento ? 'Caricamento...' : (modalita === 'login' ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        {/* <-- NUOVO: Divisore e pulsante per il login con Google --> */}
        <div className="divisore">
          <span>oppure</span>
        </div>
        
        <button 
          onClick={gestisciLoginGoogle} 
          className="btn-google" 
          disabled={caricamento}
        >
          Accedi con Google
        </button>

        <p className="testo-cambio-modalita">
          {modalita === 'login' ? 'Non hai un account?' : 'Hai già un account?'}
          <button onClick={cambiaModalita} className="btn-link" disabled={caricamento}>
            {modalita === 'login' ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;