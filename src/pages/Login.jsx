// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalita, setModalita] = useState('login'); // 'login' o 'registrazione'
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  const { login, registrazione } = useAutenticazione();
  const naviga = useNavigate();

  // Gestisce l'invio del form
  async function gestisciInvio(e) {
    e.preventDefault();
    
    // Validazione base
    if (!email || !password) {
      setErrore('Compila tutti i campi');
      return;
    }
    
    if (password.length < 6) {
      setErrore('La password deve essere di almeno 6 caratteri');
      return;
    }
    
    setErrore('');
    setCaricamento(true);
    
    try {
      if (modalita === 'login') {
        await login(email, password);
      } else {
        await registrazione(email, password);
      }
      
      // Reindirizza alla dashboard dopo il login/registrazione
      naviga('/dashboard');
    } catch (err) {
      // Gestione errori Firebase
      if (err.code === 'auth/email-already-in-use') {
        setErrore('Email già registrata');
      } else if (err.code === 'auth/invalid-credential') {
        setErrore('Credenziali non valide. Controlla email e password.');
      } else if (err.code === 'auth/invalid-email') {
        setErrore('Email non valida');
      } else {
        setErrore('Errore durante l\'autenticazione');
      }
    } finally {
      setCaricamento(false);
    }
  }

  // Cambia tra modalità login e registrazione
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
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tua@email.com"
              disabled={caricamento}
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
            />
          </div>
          
          <button  
            type="submit"  
            className="btn-primario"
            disabled={caricamento}
          >
            {caricamento ? 'Caricamento...' : (modalita === 'login' ? 'Accedi' : 'Registrati')}
          </button>
        </form>
        
        <p className="testo-cambio-modalita">
          {modalita === 'login' ? 'Non hai un account?' : 'Hai già un account?'}
          <button  
            onClick={cambiaModalita}
            className="btn-link"
            disabled={caricamento}
          >
            {modalita === 'login' ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;