import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Login.css';

function Registrazione() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [nome, setNome] = useState('');
  const [errore, setErrore] = useState('');
  const [caricamento, setCaricamento] = useState(false);

  const { registrazione, loginConGoogle } = useAutenticazione();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione
    if (password !== confermaPassword) {
      return setErrore('Le password non corrispondono');
    }

    if (password.length < 6) {
      return setErrore('La password deve essere di almeno 6 caratteri');
    }

    if (!nome.trim()) {
      return setErrore('Inserisci il tuo nome');
    }

    try {
      setErrore('');
      setCaricamento(true);
      await registrazione(email, password, nome);
      navigate('/onboarding'); // Reindirizza a onboarding
    } catch (error) {
      setErrore('Errore durante la registrazione. Riprova.');
      console.error(error);
    } finally {
      setCaricamento(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setErrore('');
      setCaricamento(true);
      await loginConGoogle();
      navigate('/onboarding'); // Reindirizza a onboarding
    } catch (error) {
      setErrore('Errore durante la registrazione con Google');
      console.error(error);
    } finally {
      setCaricamento(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Registrati</h1>
        <p className="login-subtitle">Crea il tuo account per iniziare</p>

        {errore && <div className="errore-messaggio">{errore}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Il tuo nome"
              required
              disabled={caricamento}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tua@email.com"
              required
              disabled={caricamento}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              required
              disabled={caricamento}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confermaPassword">Conferma Password</label>
            <input
              id="confermaPassword"
              type="password"
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              placeholder="Ripeti la password"
              required
              disabled={caricamento}
              autoComplete="new-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={caricamento}
          >
            {caricamento ? 'Registrazione...' : 'Registrati'}
          </button>
        </form>

        <div className="divider">
          <span>oppure</span>
        </div>

        <button 
          onClick={handleGoogleSignup}
          className="google-button"
          disabled={caricamento}
          type="button"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
          {caricamento ? 'Connessione...' : 'Continua con Google'}
        </button>

        <p className="login-footer">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </div>
    </div>
  );
}

export default Registrazione;