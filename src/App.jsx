/**
 * FILE: src/App.jsx
 * DATA ULTIMA MODIFICA: 2024-12-25 22:40
 * DESCRIZIONE: Router principale con route onboarding protetta
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AutenticazioneProvider } from './contexts/AutenticazioneContext';

// Pages
import Login from './pages/Login';
import Registrazione from './pages/Registrazione';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Flashcards from './pages/Flashcards';
import Revisione from './pages/Revisione';
import Statistiche from './pages/Statistiche';
import Impostazioni from './pages/Impostazioni';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AutenticazioneProvider>
      <BrowserRouter>
        <Routes>
          {/* Route pubbliche */}
          <Route path="/login" element={<Login />} />
          <Route path="/registrazione" element={<Registrazione />} />

          {/* Route onboarding (protetta da auth, gestita da ProtectedRoute) */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } 
          />

          {/* Route protette (richiedono auth + onboarding completato) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            }
          />

          <Route
            path="/revisione"
            element={
              <ProtectedRoute>
                <Revisione />
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistiche"
            element={
              <ProtectedRoute>
                <Statistiche />
              </ProtectedRoute>
            }
          />

          <Route
            path="/impostazioni"
            element={
              <ProtectedRoute>
                <Impostazioni />
              </ProtectedRoute>
            }
          />

          {/* Redirect root → dashboard o login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 → dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AutenticazioneProvider>
  );
}

export default App;