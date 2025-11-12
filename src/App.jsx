/**
 * FILE: src/App.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Main application router with authentication flow
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticationProvider } from './contexts/AuthenticationContext';

// Pages
import PublicLanding from './pages/PublicLanding';
import Login from './pages/Login';
import Registration from './pages/Registration';
import OnboardingFlow from './pages/OnboardingFlow';
import Home from './pages/Home';
import StudySession from './pages/StudySession';
import Flashcards from './pages/Flashcards';
import Review from './pages/Review';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Chat from './pages/Chat';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthenticationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          {/* Onboarding - now PUBLIC (no authentication required) */}
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* Protected routes (require auth + completed onboarding) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/study"
            element={
              <ProtectedRoute>
                <StudySession />
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
            path="/review"
            element={
              <ProtectedRoute>
                <Review />
              </ProtectedRoute>
            }
          />

          <Route
            path="/statistics"
            element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* 404 → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthenticationProvider>
  );
}

export default App;
