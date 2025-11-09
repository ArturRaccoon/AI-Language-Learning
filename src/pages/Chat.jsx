/**
 * FILE: src/pages/Chat.jsx
 * DESCRIPTION: AI Chat interface (placeholder)
 */

import { useNavigate } from 'react-router-dom';
import { useAuthentication } from '../contexts/AuthenticationContext';
import '../styles/Dashboard.css';

function Chat() {
  const { logout } = useAuthentication();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="dashboard-contenitore">
      <header className="dashboard-header">
        <h1>💬 AI Chat</h1>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </header>

      <main className="dashboard-main">
        <div className="sezione-lista">
          <h2>🚧 Under Construction</h2>
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
            AI chat feature coming soon!
          </p>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => navigate('/home')}
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
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;
