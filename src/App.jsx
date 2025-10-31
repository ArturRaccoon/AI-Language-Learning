/**
 * FILE: src/App.jsx
 * DATA ULTIMA MODIFICA: 2024-12-26 00:45
 * DESCRIZIONE: Router con onboarding pubblico prima di registrazione
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AutenticazioneProvider } from './contexts/AutenticazioneContext';

// Pages
import Login from './pages/Login';
import Registrazione from './pages/Registrazione';
import OnboardingFlow from './pages/OnboardingFlow';
import Home from './pages/Home';
import SessioneStudio from './pages/SessioneStudio';
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

          {/* ONBOARDING PUBBLICO - Accessibile senza login */}
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* Route protette (richiedono auth + onboarding completato) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/studia"
            element={
              <ProtectedRoute>
                <SessioneStudio />
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

          {/* Redirect root → onboarding (per iniziare il flow) */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />

          {/* 404 → onboarding */}
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    </AutenticazioneProvider>
  );
}

export default App;