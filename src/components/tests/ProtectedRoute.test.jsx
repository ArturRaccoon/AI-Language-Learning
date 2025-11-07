import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { AutenticazioneProvider } from '../../contexts/AutenticazioneContext';

// Mock del context
const mockContextValue = (overrides = {}) => ({
  utenteCorrente: null,
  loading: false,
  ...overrides
});

// Wrapper con Router per i test
const TestWrapper = ({ children, contextValue }) => (
  <BrowserRouter>
    <AutenticazioneProvider value={contextValue}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/protected" element={children} />
      </Routes>
    </AutenticazioneProvider>
  </BrowserRouter>
);

describe('ProtectedRoute', () => {
  it('mostra loader durante il caricamento', () => {
    const contextValue = mockContextValue({ loading: true });
    
    render(
      <TestWrapper contextValue={contextValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Caricamento...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirige a /login se utente non autenticato', () => {
    const contextValue = mockContextValue({ 
      loading: false, 
      utenteCorrente: null 
    });
    
    render(
      <TestWrapper contextValue={contextValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('mostra contenuto protetto se utente autenticato', () => {
    const contextValue = mockContextValue({ 
      loading: false, 
      utenteCorrente: { uid: '123', email: 'test@test.com' } 
    });
    
    render(
      <TestWrapper contextValue={contextValue}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('supporta redirectTo personalizzato', () => {
    const contextValue = mockContextValue({ 
      loading: false, 
      utenteCorrente: null 
    });
    
    render(
      <BrowserRouter>
        <AutenticazioneProvider value={contextValue}>
          <Routes>
            <Route path="/custom-login" element={<div>Custom Login</div>} />
            <Route 
              path="/protected" 
              element={
                <ProtectedRoute redirectTo="/custom-login">
                  <div>Protected Content</div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AutenticazioneProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('Custom Login')).toBeInTheDocument();
  });

  it('non causa re-render infiniti', () => {
    const renderSpy = vi.fn();
    const contextValue = mockContextValue({ 
      loading: false, 
      utenteCorrente: { uid: '123' } 
    });

    const TestComponent = () => {
      renderSpy();
      return <div>Protected Content</div>;
    };
    
    render(
      <TestWrapper contextValue={contextValue}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Il componente dovrebbe renderizzare una sola volta
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});