// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
// import SessioneStudio from './pages/SessioneStudio'; // <-- Importeremo questo quando lo creeremo
import { useAutenticazione } from './contexts/AutenticazioneContext';
import './App.css'; // Manteniamo gli stili di base se necessario

/**
 * Componente RottaProtetta - Protegge le rotte che richiedono autenticazione
 * Se l'utente non è loggato, reindirizza a /login
 */
function RottaProtetta({ children }) {
  const { utenteCorrente } = useAutenticazione();
  
  // Se il contesto sta ancora caricando, potremmo mostrare un loader
  // const { caricamento } = useAutenticazione(); // Se hai esposto 'caricamento' dal context
  // if (caricamento) return <div>Caricamento...</div>; 

  if (!utenteCorrente) {
    // replace evita che l'utente possa tornare indietro alla pagina protetta con il tasto back
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
      {/* Rotta pubblica per Login/Registrazione */}
      <Route path="/login" element={<Login />} />
      
      {/* Rotta protetta per la Dashboard principale */}
      <Route 
        path="/dashboard" 
        element={
          <RottaProtetta>
            <Dashboard />
          </RottaProtetta>
        } 
      />

      {/* --- Rotte Future (Commentate per ora) --- */}
      {/* <Route 
        path="/studia" 
        element={
          <RottaProtetta>
            <SessioneStudio /> 
          </RottaProtetta>
        } 
      /> 
      */}

      {/* --- Fallback Routes --- */}
      {/* Se l'utente visita '/', viene reindirizzato alla dashboard (che poi lo manderà al login se non autenticato) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Qualsiasi altra rotta non definita viene reindirizzata alla dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;