// src/contexts/AutenticazioneContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider, // <-- NUOVO: Importiamo il provider di Google
  signInWithPopup    // <-- NUOVO: Importiamo la funzione per il login tramite pop-up
} from 'firebase/auth';
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
  
  // <-- NUOVO: Funzione per gestire il login con Google
  function loginConGoogle() {
    const provider = new GoogleAuthProvider(); // Creiamo un'istanza del provider
    return signInWithPopup(autenticazione, provider); // Avviamo il flusso di autenticazione
  }

  function logout() {
    return signOut(autenticazione);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(autenticazione, (utente) => {
      setUtenteCorrente(utente);
      setCaricamento(false);
    });
    return unsubscribe;
  }, []);

  const valore = {
    utenteCorrente,
    registrazione,
    login,
    logout,
    loginConGoogle // <-- NUOVO: Esponiamo la nuova funzione al resto dell'app
  };

  return (
    <AutenticazioneContext.Provider value={valore}>
      {!caricamento && children}
    </AutenticazioneContext.Provider>
  );
}