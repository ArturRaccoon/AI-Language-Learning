/**
 * FILE: src/components/__tests__/ProtectedRoute.test.jsx
 * DATA CREAZIONE: 2024-12-25 23:10
 * DESCRIZIONE: Test ProtectedRoute con redirect onboarding
 */

import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAutenticazione } from '../../contexts/AutenticazioneContext';

// Mock context
jest.mock('../../contexts/AutenticazioneContext');

describe('ProtectedRoute', () => {
  function renderWithRouter(ui, initialRoute = '/') {
    window.history.pushState({}, 'Test', initialRoute);

    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <div>Onboarding Page</div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div>Dashboard Page</div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    );
  }

  describe('Utente non autenticato', () => {
    beforeEach(() => {
      useAutenticazione.mockReturnValue({
        utenteCorrente: null,
        isOnboardingNecessario: () => false
      });
    });

    test('redirect a login se utente non loggato', () => {
      renderWithRouter(null, '/dashboard');

      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

  describe('Utente autenticato senza onboarding', () => {
    beforeEach(() => {
      useAutenticazione.mockReturnValue({
        utenteCorrente: { uid: 'test-123' },
        profiloUtente: null,
        isOnboardingNecessario: () => true
      });
    });

    test('redirect a onboarding da dashboard', () => {
      renderWithRouter(null, '/dashboard');

      expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
    });

    test('permette accesso a pagina onboarding stessa', () => {
      renderWithRouter(null, '/onboarding');

      expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
    });
  });

  describe('Utente autenticato con onboarding completato', () => {
    beforeEach(() => {
      useAutenticazione.mockReturnValue({
        utenteCorrente: { uid: 'test-123' },
        profiloUtente: {
          linguaMadre: 'it-IT',
          linguaObiettivo: 'en-US',
          onboardingCompletato: true
        },
        isOnboardingNecessario: () => false
      });
    });

    test('permette accesso a dashboard', () => {
      renderWithRouter(null, '/dashboard');

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    test('redirect a dashboard se prova ad accedere a onboarding', () => {
      renderWithRouter(null, '/onboarding');

      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    test('gestisce profilo con onboardingCompletato = false', () => {
      useAutenticazione.mockReturnValue({
        utenteCorrente: { uid: 'test-123' },
        profiloUtente: { onboardingCompletato: false },
        isOnboardingNecessario: () => true
      });

      renderWithRouter(null, '/dashboard');

      expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
    });

    test('gestisce profilo senza campo onboardingCompletato', () => {
      useAutenticazione.mockReturnValue({
        utenteCorrente: { uid: 'test-123' },
        profiloUtente: { linguaMadre: 'it-IT' }, // Senza flag
        isOnboardingNecessario: () => true
      });

      renderWithRouter(null, '/dashboard');

      expect(screen.getByText('Onboarding Page')).toBeInTheDocument();
    });
  });
});