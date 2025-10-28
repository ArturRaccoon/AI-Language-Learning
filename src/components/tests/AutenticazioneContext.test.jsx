/**
 * FILE: src/contexts/__tests__/AutenticazioneContext.test.jsx
 * DATA CREAZIONE: 2024-12-25 23:00
 * DESCRIZIONE: Test context autenticazione + profilo utente
 */

import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AutenticazioneProvider, useAutenticazione } from '../AutenticazioneContext';
import { getProfiloUtente, inizializzaProfiloBase } from '../../services/userService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Mock Firebase
jest.mock('firebase/auth');
jest.mock('../../services/userService');
jest.mock('../../config/firebase', () => ({
  auth: {}
}));

describe('AutenticazioneContext', () => {
  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@example.com'
  };

  const mockProfiloCompleto = {
    linguaMadre: 'it-IT',
    linguaObiettivo: 'en-US',
    obiettivi: ['viaggio', 'lavoro'],
    livelloConoscenza: 'intermedio',
    onboardingCompletato: true
  };

  const mockProfiloIncompleto = {
    email: 'test@example.com',
    dataCreazione: '2024-12-25',
    onboardingCompletato: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Caricamento Profilo', () => {
    test('caricaProfilo() recupera profilo esistente', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: true,
        profilo: mockProfiloCompleto
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      let onboardingOk;
      await act(async () => {
        onboardingOk = await result.current.caricaProfilo('test-uid-123');
      });

      expect(onboardingOk).toBe(true);
      expect(result.current.profiloUtente).toEqual(mockProfiloCompleto);
    });

    test('caricaProfilo() gestisce profilo mancante', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: false,
        profilo: null
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      let onboardingOk;
      await act(async () => {
        onboardingOk = await result.current.caricaProfilo('test-uid-123');
      });

      expect(onboardingOk).toBe(false);
      expect(result.current.profiloUtente).toBeNull();
    });

    test('caricaProfilo() gestisce onboarding non completato', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: true,
        profilo: mockProfiloIncompleto
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      let onboardingOk;
      await act(async () => {
        onboardingOk = await result.current.caricaProfilo('test-uid-123');
      });

      expect(onboardingOk).toBe(false);
      expect(result.current.profiloUtente).toEqual(mockProfiloIncompleto);
    });
  });

  describe('isOnboardingNecessario()', () => {
    test('ritorna false se nessun utente loggato', () => {
      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      expect(result.current.isOnboardingNecessario()).toBe(false);
    });

    test('ritorna true se profilo non esiste', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: false,
        profilo: null
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      // Simula utente loggato senza profilo
      await act(async () => {
        result.current.utenteCorrente = mockUser;
        await result.current.caricaProfilo('test-uid-123');
      });

      expect(result.current.isOnboardingNecessario()).toBe(true);
    });

    test('ritorna true se onboardingCompletato è false', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: true,
        profilo: mockProfiloIncompleto
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      await act(async () => {
        result.current.utenteCorrente = mockUser;
        await result.current.caricaProfilo('test-uid-123');
      });

      expect(result.current.isOnboardingNecessario()).toBe(true);
    });

    test('ritorna false se onboarding completato', async () => {
      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: true,
        profilo: mockProfiloCompleto
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      await act(async () => {
        result.current.utenteCorrente = mockUser;
        await result.current.caricaProfilo('test-uid-123');
      });

      expect(result.current.isOnboardingNecessario()).toBe(false);
    });
  });

  describe('Registrazione con Profilo Base', () => {
    test('registrazione() crea profilo base', async () => {
      createUserWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      });

      inizializzaProfiloBase.mockResolvedValue({
        successo: true
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      let risultato;
      await act(async () => {
        risultato = await result.current.registrazione('test@example.com', 'password123');
      });

      expect(risultato.successo).toBe(true);
      expect(inizializzaProfiloBase).toHaveBeenCalledWith(
        mockUser.uid,
        'test@example.com'
      );
    });
  });

  describe('Integrazione Login + Profilo', () => {
    test('login() con onboarding completato carica profilo', async () => {
      signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      });

      getProfiloUtente.mockResolvedValue({
        successo: true,
        esiste: true,
        profilo: mockProfiloCompleto
      });

      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      // Il profilo dovrebbe essere caricato automaticamente dall'observer
      await waitFor(() => {
        expect(result.current.profiloUtente).toBeTruthy();
      });
    });
  });

  describe('Logout', () => {
    test('logout() resetta profilo', async () => {
      const { result } = renderHook(() => useAutenticazione(), {
        wrapper: ({ children }) => (
          <AutenticazioneProvider>{children}</AutenticazioneProvider>
        )
      });

      // Imposta profilo
      await act(async () => {
        result.current.utenteCorrente = mockUser;
        result.current.profiloUtente = mockProfiloCompleto;
        await result.current.logout();
      });

      expect(result.current.profiloUtente).toBeNull();
    });
  });
});