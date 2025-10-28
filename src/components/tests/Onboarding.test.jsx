/**
 * FILE: src/pages/__tests__/Onboarding.test.jsx
 * DATA CREAZIONE: 2024-12-25 23:05
 * DESCRIZIONE: Test componente Onboarding multi-step
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from '../Onboarding';
import { useAutenticazione } from '../../contexts/AutenticazioneContext';
import { salvaProfiloUtente } from '../../services/userService';

// Mock dependencies
jest.mock('../../contexts/AutenticazioneContext');
jest.mock('../../services/userService');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Onboarding', () => {
  const mockUtenteCorrente = {
    uid: 'test-uid-123',
    email: 'test@example.com'
  };

  const mockCaricaProfilo = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useAutenticazione.mockReturnValue({
      utenteCorrente: mockUtenteCorrente,
      caricaProfilo: mockCaricaProfilo
    });

    // Mock navigate
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  function renderOnboarding() {
    return render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
  }

  describe('Step 1 - Lingue', () => {
    test('mostra step 1 con selettori lingue', () => {
      renderOnboarding();

      expect(screen.getByText('🌍 Che lingue vuoi imparare?')).toBeInTheDocument();
      expect(screen.getByText('La tua lingua madre')).toBeInTheDocument();
      expect(screen.getByText('Lingua che vuoi imparare')).toBeInTheDocument();
    });

    test('valida che lingue siano diverse', () => {
      renderOnboarding();

      // Seleziona stessa lingua per entrambi
      const selettori = screen.getAllByRole('combobox');
      fireEvent.change(selettori[0], { target: { value: 'en-US' } });
      fireEvent.change(selettori[1], { target: { value: 'en-US' } });

      // Clicca avanti
      fireEvent.click(screen.getByText('Avanti →'));

      expect(screen.getByText('Lingua madre e obiettivo devono essere diverse')).toBeInTheDocument();
    });

    test('passa a step 2 con lingue valide', () => {
      renderOnboarding();

      // Clicca avanti (lingue default sono diverse)
      fireEvent.click(screen.getByText('Avanti →'));

      expect(screen.getByText('🎯 Perché vuoi imparare?')).toBeInTheDocument();
    });
  });

  describe('Step 2 - Obiettivi', () => {
    beforeEach(() => {
      renderOnboarding();
      // Vai a step 2
      fireEvent.click(screen.getByText('Avanti →'));
    });

    test('mostra obiettivi selezionabili', () => {
      expect(screen.getByText(/✈️ Viaggio e turismo/)).toBeInTheDocument();
      expect(screen.getByText(/💼 Lavoro e business/)).toBeInTheDocument();
      expect(screen.getByText(/📚 Studio e università/)).toBeInTheDocument();
    });

    test('permette selezione multipla obiettivi', () => {
      const viaggioBtn = screen.getByText(/✈️ Viaggio e turismo/).closest('button');
      const lavoroBtn = screen.getByText(/💼 Lavoro e business/).closest('button');

      fireEvent.click(viaggioBtn);
      fireEvent.click(lavoroBtn);

      expect(viaggioBtn).toHaveClass('selected');
      expect(lavoroBtn).toHaveClass('selected');
    });

    test('valida almeno un obiettivo selezionato', () => {
      // Non seleziona nulla, clicca avanti
      fireEvent.click(screen.getByText('Avanti →'));

      expect(screen.getByText('Seleziona almeno un obiettivo')).toBeInTheDocument();
    });

    test('passa a step 3 con obiettivi selezionati', () => {
      fireEvent.click(screen.getByText(/✈️ Viaggio/).closest('button'));
      fireEvent.click(screen.getByText('Avanti →'));

      expect(screen.getByText('📊 Qual è il tuo livello?')).toBeInTheDocument();
    });

    test('pulsante indietro torna a step 1', () => {
      fireEvent.click(screen.getByText('← Indietro'));

      expect(screen.getByText('🌍 Che lingue vuoi imparare?')).toBeInTheDocument();
    });
  });

  describe('Step 3 - Livello', () => {
    beforeEach(() => {
      renderOnboarding();
      
      // Vai a step 3
      fireEvent.click(screen.getByText('Avanti →')); // Step 1 → 2
      fireEvent.click(screen.getByText(/✈️ Viaggio/).closest('button')); // Seleziona obiettivo
      fireEvent.click(screen.getByText('Avanti →')); // Step 2 → 3
    });

    test('mostra livelli selezionabili', () => {
      expect(screen.getByText('Principiante')).toBeInTheDocument();
      expect(screen.getByText('Elementare')).toBeInTheDocument();
      expect(screen.getByText('Intermedio')).toBeInTheDocument();
      expect(screen.getByText('Avanzato')).toBeInTheDocument();
      expect(screen.getByText('Madrelingua')).toBeInTheDocument();
    });

    test('valida livello selezionato', () => {
      // Non seleziona livello, clicca completa
      fireEvent.click(screen.getByText('Completa ✓'));

      expect(screen.getByText('Seleziona il tuo livello')).toBeInTheDocument();
    });

    test('pulsante indietro torna a step 2', () => {
      fireEvent.click(screen.getByText('← Indietro'));

      expect(screen.getByText('🎯 Perché vuoi imparare?')).toBeInTheDocument();
    });
  });

  describe('Completamento Onboarding', () => {
    test('salva profilo e reindirizza a dashboard', async () => {
      salvaProfiloUtente.mockResolvedValue({
        successo: true,
        profilo: {}
      });

      renderOnboarding();

      // Completa tutti gli step
      fireEvent.click(screen.getByText('Avanti →')); // Step 1 → 2
      fireEvent.click(screen.getByText(/✈️ Viaggio/).closest('button'));
      fireEvent.click(screen.getByText('Avanti →')); // Step 2 → 3
      fireEvent.click(screen.getByText('Intermedio').closest('button'));
      fireEvent.click(screen.getByText('Completa ✓'));

      await waitFor(() => {
        expect(salvaProfiloUtente).toHaveBeenCalledWith(
          mockUtenteCorrente.uid,
          expect.objectContaining({
            linguaMadre: 'it-IT',
            linguaObiettivo: 'en-US',
            obiettivi: ['viaggio'],
            livelloConoscenza: 'intermedio'
          })
        );
      });

      await waitFor(() => {
        expect(mockCaricaProfilo).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('gestisce errore salvataggio', async () => {
      salvaProfiloUtente.mockResolvedValue({
        successo: false,
        errore: 'Errore DB'
      });

      renderOnboarding();

      // Completa tutti gli step
      fireEvent.click(screen.getByText('Avanti →'));
      fireEvent.click(screen.getByText(/✈️ Viaggio/).closest('button'));
      fireEvent.click(screen.getByText('Avanti →'));
      fireEvent.click(screen.getByText('Intermedio').closest('button'));
      fireEvent.click(screen.getByText('Completa ✓'));

      await waitFor(() => {
        expect(screen.getByText('Errore nel salvataggio. Riprova.')).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Progress Bar', () => {
    test('aggiorna progress bar per ogni step', () => {
      renderOnboarding();

      // Step 1
      expect(screen.getByText('Step 1 di 3')).toBeInTheDocument();

      // Step 2
      fireEvent.click(screen.getByText('Avanti →'));
      expect(screen.getByText('Step 2 di 3')).toBeInTheDocument();

      // Step 3
      fireEvent.click(screen.getByText(/✈️ Viaggio/).closest('button'));
      fireEvent.click(screen.getByText('Avanti →'));
      expect(screen.getByText('Step 3 di 3')).toBeInTheDocument();
    });
  });
});