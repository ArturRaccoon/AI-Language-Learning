// src/pages/Dashboard.jsx
import { useAutenticazione } from '../contexts/AutenticazioneContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { utenteCorrente, logout } = useAutenticazione();
  const naviga = useNavigate();

  async function gestisciLogout() {
    try {
      await logout();
      naviga('/login');
    } catch {
      console.error("Errore durante il logout");
    }
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Benvenuto, {utenteCorrente && utenteCorrente.email}</p>
      <button onClick={gestisciLogout}>Logout</button>
    </div>
  );
}
export default Dashboard;