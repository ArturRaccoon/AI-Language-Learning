// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAutenticazione } from './contexts/AutenticazioneContext';
import './App.css';

/**
 * Componente RottaProtetta - Protegge le rotte che richiedono autenticazione
 * Se l'utente non è loggato, reindirizza a /login
 */
function RottaProtetta({ children }) {
  const { utenteCorrente } = useAutenticazione();
  
  if (!utenteCorrente) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

/**
 * App Component - Gestisce tutto il routing dell'applicazione
 */
function App() {
  return (
    <Routes>
      {/* Rotta pubblica - Login/Registrazione */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotta protetta - Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <RottaProtetta>
            <Dashboard />
          </RottaProtetta>
        } 
      />
      
      {/* Rotta di default - Reindirizza a dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch-all - Qualsiasi altra rotta va alla dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
export default App;