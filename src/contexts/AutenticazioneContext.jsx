// src/contexts/AutenticazioneContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { autenticazione } from '../config/firebase';

const AutenticazioneContext = createContext();

export function useAutenticazione() {
  return useContext(AutenticazioneContext);
}

export function AutenticazioneProvider({ children }) {
  const [utenteCorrente, setUtenteCorrente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);

  function registrazione(email, password) {
    return createUserWithEmailAndPassword(autenticazione, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(autenticazione, email, password);
  }

  function logout() {
    return signOut(autenticazione);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(autenticazione, (user) => {
      setUtenteCorrente(user);
      setCaricamento(false);
    });
    return unsubscribe;
  }, []);

  const valore = { utenteCorrente, registrazione, login, logout };

  return (
    <AutenticazioneContext.Provider value={valore}>
      {!caricamento && children}
    </AutenticazioneContext.Provider>
  );
}