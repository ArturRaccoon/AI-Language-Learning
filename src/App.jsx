/**
 * FILE: src/App.jsx
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Main application router with public onboarding flow before registration
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthenticationProvider } from './contexts/AuthenticationContext';

// Pages
import Login from './pages/Login';
import Registration from './pages/Registration';
import OnboardingFlow from './pages/OnboardingFlow';
import Home from './pages/Home';
import StudySession from './pages/StudySession';
import Flashcards from './pages/Flashcards';
import Review from './pages/Review';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';g
import Chat from './pages/Chat';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthenticationProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          {/* PUBLIC ONBOARDING - Accessible without login */}
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

          {/* Redirect root → onboarding (to start the flow) */}
          <Route path="/" element={<Navigate to="/onboarding" replace />} />

          {/* 404 → onboarding */}
          <Route path="*" element={<Navigate to="/onboarding" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthenticationProvider>
  );
}

export default App;
