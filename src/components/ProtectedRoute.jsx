/**
 * FILE: src/components/ProtectedRoute.jsx
 * DATA CREAZIONE: 2024-12-25 22:35
 * DESCRIZIONE: Route protette con:
 *   - Verifica autenticazione
 *   - Redirect onboarding se necessario
 *   - Eccezione per route `/onboarding` stessa
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAutenticazione } from '../contexts/AutenticazioneContext';

function ProtectedRoute({ children }) {
  const { utenteCorrente, isOnboardingNecessario } = useAutenticazione();
  const location = useLocation();

  // 1. Utente non loggato → redirect login
  if (!utenteCorrente) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Utente loggato ma onboarding non completato
  if (isOnboardingNecessario()) {
    // Eccezione: se è già nella route onboarding, non redirect
    if (location.pathname === '/onboarding') {
      return children;
    }

    // Altrimenti redirect a onboarding
    console.log('🔄 Redirect a onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // 3. Utente loggato con onboarding completato
  // Ma se prova ad accedere a /onboarding → redirect dashboard
  if (location.pathname === '/onboarding') {
    console.log('✅ Onboarding già completato, redirect dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Tutto ok → mostra contenuto
  return children;
}

export default ProtectedRoute;