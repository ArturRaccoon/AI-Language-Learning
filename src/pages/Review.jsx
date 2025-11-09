/**
 * FILE: src/pages/Revisione.jsx
 * DATA CREAZIONE: 2024-12-25 23:35
 * DESCRIZIONE: Pagina sessione revisione SRS (placeholder)
 */

import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import '../styles/Dashboard.css';

function Revisione() {
  const { logout } = useAuthentication();
  const naviga = useNavigate();

  async function handleLogout() {
    await logout();
    naviga('/login');
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>🧠 Sessione di Revisione</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="sezione-lista">
          <h2>🚧 Pagina in Costruzione</h2>
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            Il sistema di revisione con Spaced Repetition sarà disponibile presto!
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

export default Revisione;