/**
 * FILE: src/contexts/AutenticazioneContext.jsx
 * DATA ULTIMA MODIFICA: 2024-12-25 22:30
 * DESCRIZIONE: Context autenticazione + profilo utente
 * CHANGELOG:
 *   - Aggiunto stato `profiloUtente` e `isOnboardingNecessario`
 *   - Funzione `caricaProfilo()` per fetch profilo da Firestore
 *   - Auto-caricamento profilo dopo login/registrazione
 *   - Inizializzazione profilo base al primo login
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  getProfiloUtente, 
  inizializzaProfiloBase 
} from '../services/userService';

const AutenticazioneContext = createContext();

export function useAutenticazione() {
  const context = useContext(AutenticazioneContext);
  if (!context) {
    throw new Error('useAutenticazione deve essere usato dentro AutenticazioneProvider');
  }
  return context;
}

export function AutenticazioneProvider({ children }) {
  const [utenteCorrente, setUtenteCorrente] = useState(null);
  const [profiloUtente, setProfiloUtente] = useState(null);
  const [caricamento, setCaricamento] = useState(true);

  /**
   * Carica profilo utente da Firestore
   * @returns {Promise<boolean>} - true se profilo esiste e onboarding completato
   */
  async function caricaProfilo(uid = null) {
    const idUtente = uid || utenteCorrente?.uid;
    
    if (!idUtente) {
      console.warn('⚠️ Nessun utente loggato, impossibile caricare profilo');
      setProfiloUtente(null);
      return false;
    }

    try {
      const risultato = await getProfiloUtente(idUtente);

      if (risultato.successo && risultato.esiste) {
        setProfiloUtente(risultato.profilo);
        
        // Verifica se onboarding completato
        const onboardingOk = risultato.profilo.onboardingCompletato === true;
        
        console.log(
          onboardingOk 
            ? '✅ Profilo caricato, onboarding completato' 
            : '⚠️ Profilo trovato ma onboarding non completato'
        );
        
        return onboardingOk;
      } else {
        // Profilo non esiste → onboarding necessario
        setProfiloUtente(null);
        console.log('ℹ️ Nessun profilo trovato, onboarding necessario');
        return false;
      }
    } catch (errore) {
      console.error('❌ Errore caricamento profilo:', errore);
      setProfiloUtente(null);
      return false;
    }
  }

  /**
   * Verifica se utente deve fare onboarding
   * @returns {boolean}
   */
  function isOnboardingNecessario() {
    // Se non c'è utente loggato → no redirect
    if (!utenteCorrente) return false;

    // Se non c'è profilo → onboarding necessario
    if (!profiloUtente) return true;

    // Se profilo esiste ma flag è false → onboarding necessario
    return profiloUtente.onboardingCompletato !== true;
  }

  /**
   * Registrazione nuovo utente
   */
  async function registrazione(email, password) {
    try {
      const credenziali = await createUserWithEmailAndPassword(auth, email, password);
      
      // Inizializza profilo base
      await inizializzaProfiloBase(credenziali.user.uid, email);
      
      console.log('✅ Utente registrato, profilo base creato');
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ Errore registrazione:', errore);
      
      let messaggioErrore = 'Errore durante la registrazione';
      
      switch (errore.code) {
        case 'auth/email-already-in-use':
          messaggioErrore = 'Email già registrata';
          break;
        case 'auth/weak-password':
          messaggioErrore = 'Password troppo debole (min 6 caratteri)';
          break;
        case 'auth/invalid-email':
          messaggioErrore = 'Email non valida';
          break;
      }
      
      return { successo: false, errore: messaggioErrore };
    }
  }

  /**
   * Login utente esistente
   */
  async function login(email, password) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ Login effettuato');
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ Errore login:', errore);
      
      let messaggioErrore = 'Errore durante il login';
      
      switch (errore.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          messaggioErrore = 'Email o password errati';
          break;
        case 'auth/invalid-email':
          messaggioErrore = 'Email non valida';
          break;
        case 'auth/user-disabled':
          messaggioErrore = 'Account disabilitato';
          break;
      }
      
      return { successo: false, errore: messaggioErrore };
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await signOut(auth);
      setProfiloUtente(null);
      
      console.log('✅ Logout effettuato');
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ Errore logout:', errore);
      return { successo: false, errore: 'Errore durante il logout' };
    }
  }

  /**
   * Observer Firebase Auth + Auto-caricamento profilo
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (utente) => {
      setUtenteCorrente(utente);

      if (utente) {
        // Utente loggato → carica profilo
        await caricaProfilo(utente.uid);
      } else {
        // Utente sloggato → reset profilo
        setProfiloUtente(null);
      }

      setCaricamento(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    utenteCorrente,
    profiloUtente,
    registrazione,
    login,
    logout,
    caricaProfilo,
    isOnboardingNecessario
  };

  return (
    <AutenticazioneContext.Provider value={value}>
      {!caricamento && children}
    </AutenticazioneContext.Provider>
  );
}