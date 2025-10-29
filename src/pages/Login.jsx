/**
 * FILE: src/pages/Login.jsx
 * DATA ULTIMA MODIFICA: 2024-12-26 00:15
 * DESCRIZIONE: Login completo con Google + Email + Password Reset
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { autenticazione } from '../config/firebase';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalita, setModalita] = useState('login'); // 'login' | 'registrazione' | 'reset'
  const [errore, setErrore] = useState('');
  const [successo, setSuccesso] = useState('');
  const [caricamento, setCaricamento] = useState(false);
  
  const { login, registrazione, loginConGoogle } = useAutenticazione();
  const naviga = useNavigate();

  /**
   * Gestisce login/registrazione email
   */
  async function gestisciInvio(e) {
    e.preventDefault();
    
    if (!email || !password) {
      setErrore('Compila tutti i campi');
      return;
    }
    
    if (password.length < 6) {
      setErrore('La password deve essere di almeno 6 caratteri');
      return;
    }
    
    setErrore('');
    setSuccesso('');
    setCaricamento(true);
    
    try {
      const risultato = modalita === 'login' 
        ? await login(email, password)
        : await registrazione(email, password);
      
      if (risultato.successo) {
        naviga('/dashboard');
      } else {
        setErrore(risultato.errore || 'Errore durante l\'autenticazione');
      }
    } catch (err) {
      console.error('❌ Errore:', err);
      setErrore('Si è verificato un errore. Riprova.');
    } finally {
      setCaricamento(false);
    }
  }

  /**
   * Gestisce login con Google
   */
  async function gestisciLoginGoogle() {
    setErrore('');
    setSuccesso('');
    setCaricamento(true);
    
    try {
      const risultato = await loginConGoogle();
      
      if (risultato.successo) {
        naviga('/dashboard');
      } else {
        setErrore(risultato.errore || 'Errore durante il login con Google');
      }
    } catch (err) {
      console.error('❌ Errore Google:', err);
      setErrore('Errore durante il login con Google');
    } finally {
      setCaricamento(false);
    }
  }

  /**
   * Gestisce reset password
   */
  async function gestisciResetPassword(e) {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setErrore('Inserisci un\'email valida');
      return;
    }
    
    setErrore('');
    setSuccesso('');
    setCaricamento(true);
    
    try {
      await sendPasswordResetEmail(autenticazione, email);
      setSuccesso(`Email di reset inviata a ${email}. Controlla la tua casella di posta.`);
      
      setTimeout(() => {
        setModalita('login');
        setSuccesso('');
      }, 3000);
    } catch (err) {
      console.error('❌ Errore reset:', err);
      
      let messaggio = 'Errore durante l\'invio dell\'email';
      
      switch (err.code) {
        case 'auth/user-not-found':
          messaggio = 'Email non registrata';
          break;
        case 'auth/invalid-email':
          messaggio = 'Email non valida';
          break;
        case 'auth/too-many-requests':
          messaggio = 'Troppi tentativi. Riprova tra qualche minuto.';
          break;
        default:
          messaggio = `Errore: ${err.message}`;
      }
      
      setErrore(messaggio);
    } finally {
      setCaricamento(false);
    }
  }

  function cambiaModalita(nuovaModalita) {
    setModalita(nuovaModalita);
    setErrore('');
    setSuccesso('');
  }

  return (
    <div className="contenitore-login">
      <div className="card-login">
        {/* TITOLO */}
        <h1>
          {modalita === 'login' && '🔐 Accedi'}
          {modalita === 'registrazione' && '📝 Registrati'}
          {modalita === 'reset' && '🔑 Reimposta Password'}
        </h1>
        
        {/* ALERT */}
        {errore && <div className="alert-errore">{errore}</div>}
        {successo && <div className="alert-successo">{successo}</div>}
        
        {/* FORM LOGIN/REGISTRAZIONE */}
        {(modalita === 'login' || modalita === 'registrazione') && (
          <>
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
                  required
                  autoComplete="email"
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
                  autoComplete={modalita === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
              
              {/* PASSWORD DIMENTICATA */}
              {modalita === 'login' && (
                <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => cambiaModalita('reset')}
                    className="btn-link"
                    style={{ fontSize: '0.85rem', padding: 0 }}
                  >
                    Password dimenticata?
                  </button>
                </div>
              )}
              
              <button 
                type="submit" 
                className="btn-primario" 
                disabled={caricamento}
              >
                {caricamento ? (
                  <>
                    <div className="spinner-small"></div>
                    {modalita === 'login' ? 'Accesso...' : 'Registrazione...'}
                  </>
                ) : (
                  modalita === 'login' ? 'Accedi' : 'Registrati'
                )}
              </button>
            </form>

            {/* DIVISORE */}
            <div className="divisore">
              <span>oppure</span>
            </div>

            {/* PULSANTE GOOGLE */}
            <button 
              onClick={gestisciLoginGoogle}
              className="btn-google" 
              disabled={caricamento}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: '8px' }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              {caricamento ? 'Accesso...' : 'Continua con Google'}
            </button>
          </>
        )}
        
        {/* FORM RESET PASSWORD */}
        {modalita === 'reset' && (
          <form onSubmit={gestisciResetPassword}>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Inserisci la tua email e ti invieremo un link per reimpostare la password.
            </p>
            
            <div className="gruppo-input">
              <label htmlFor="email-reset">Email</label>
              <input
                type="email"
                id="email-reset"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tua@email.com"
                disabled={caricamento}
                required
                autoComplete="email"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn-primario" 
              disabled={caricamento}
            >
              {caricamento ? (
                <>
                  <div className="spinner-small"></div>
                  Invio...
                </>
              ) : (
                'Invia Email Reset'
              )}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => cambiaModalita('login')}
                className="btn-link"
                disabled={caricamento}
              >
                ← Torna al Login
              </button>
            </div>
          </form>
        )}

        {/* CAMBIO MODALITÀ */}
        {modalita !== 'reset' && (
          <p className="testo-cambio-modalita">
            {modalita === 'login' ? 'Non hai un account?' : 'Hai già un account?'}
            <button 
              onClick={() => cambiaModalita(modalita === 'login' ? 'registrazione' : 'login')} 
              className="btn-link" 
              disabled={caricamento}
              type="button"
            >
              {modalita === 'login' ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;