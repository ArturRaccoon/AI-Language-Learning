/**
 * FILE: src/pages/Impostazioni.jsx
 * DATA CREAZIONE: 2024-12-25 23:35
 * DESCRIZIONE: Pagina impostazioni profilo (placeholder)
 */

import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Dashboard.css';

function Impostazioni() {
  const { logout, profiloUtente } = useAutenticazione();
  const naviga = useNavigate();

  async function handleLogout() {
    await logout();
    naviga('/login');
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>⚙️ Impostazioni</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="sezione-lista">
          <h2>🚧 Pagina in Costruzione</h2>
          
          {profiloUtente && (
            <div style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px',
              marginTop: '1rem'
            }}>
              <h3>Il Tuo Profilo</h3>
              <p><strong>Lingua Madre:</strong> {profiloUtente.linguaMadre}</p>
              <p><strong>Lingua Obiettivo:</strong> {profiloUtente.linguaObiettivo}</p>
              <p><strong>Livello:</strong> {profiloUtente.livelloConoscenza}</p>
              <p><strong>Obiettivi:</strong> {profiloUtente.obiettivi?.join(', ')}</p>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            La possibilità di modificare le impostazioni sarà disponibile presto!
          </p>
          
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => naviga('/dashboard')}
              style={{
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              ← Torna alla Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Impostazioni;