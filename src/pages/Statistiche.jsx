/**
 * FILE: src/pages/Statistiche.jsx
 * DATA CREAZIONE: 2024-12-25 23:35
 * DESCRIZIONE: Pagina statistiche e progressi (placeholder)
 */

import { useNavigate } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import '../styles/Dashboard.css';

function Statistiche() {
  const { logout } = useAutenticazione();
  const naviga = useNavigate();

  async function handleLogout() {
    await logout();
    naviga('/login');
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>📊 Statistiche e Progressi</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="sezione-lista">
          <h2>🚧 Pagina in Costruzione</h2>
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            Le statistiche dettagliate saranno disponibili presto!
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => naviga('/home')}
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

export default Statistiche;