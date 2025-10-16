// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAutenticazione } from './contexts/AutenticazioneContext';

function RottaProtetta({ children }) {
  const { utenteCorrente } = useAutenticazione();
  return utenteCorrente ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={<RottaProtetta><Dashboard /></RottaProtetta>} 
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;