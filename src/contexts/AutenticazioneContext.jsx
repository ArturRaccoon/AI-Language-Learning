/**
 * FILE: src/contexts/AutenticazioneContext.jsx
 * DATA ULTIMA MODIFICA: 2024-12-26 00:10
 * DESCRIZIONE: Context autenticazione + Google Sign-In
 */

import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { autenticazione } from '../config/firebase';
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
   */
  async function caricaProfilo(uid = null) {
    const idUtente = uid || utenteCorrente?.uid;
    
    console.log('🔍 caricaProfilo chiamato per UID:', idUtente);
    
    if (!idUtente) {
      console.warn('⚠️ Nessun utente loggato');
      setProfiloUtente(null);
      return false;
    }

    try {
      console.log('📡 Chiamata getProfiloUtente...');
      const risultato = await getProfiloUtente(idUtente);
      console.log('📦 Risultato getProfiloUtente:', risultato);

      if (risultato.successo && risultato.esiste) {
        setProfiloUtente(risultato.profilo);
        
        const onboardingOk = risultato.profilo.onboardingCompletato === true;
        
        console.log(
          onboardingOk 
            ? '✅ Profilo caricato, onboarding completato' 
            : '⚠️ Profilo trovato ma onboarding non completato'
        );
        
        return onboardingOk;
      } else {
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
   */
  function isOnboardingNecessario() {
    if (!utenteCorrente) return false;
    if (!profiloUtente) return true;
    return profiloUtente.onboardingCompletato !== true;
  }

  /**
   * Registrazione con email/password
   */
  async function registrazione(email, password) {
    console.log('🔵 Tentativo di registrazione per:', email);
    
    try {
      console.log('📡 Chiamata createUserWithEmailAndPassword...');
      const credenziali = await createUserWithEmailAndPassword(autenticazione, email, password);
      console.log('✅ Registrazione Riuscita:', credenziali.user.uid);
      
      console.log('📡 Inizializzazione profilo base...');
      await inizializzaProfiloBase(credenziali.user.uid, email);
      console.log('✅ Profilo base creato');
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ ERRORE registrazione:', errore);
      console.error('  - Codice errore:', errore.code);
      console.error('  - Messaggio:', errore.message);
      
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
        default:
          messaggioErrore = `Errore: ${errore.message}`;
      }
      
      return { successo: false, errore: messaggioErrore };
    }
  }

  /**
   * Login con email/password
   */
  async function login(email, password) {
    console.log('🔵 Tentativo di login per:', email);
    
    try {
      console.log('📡 Chiamata signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(autenticazione, email, password);
      console.log('✅ Login Riuscito:', userCredential.user.uid);
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ ERRORE login:', errore);
      console.error('  - Codice errore:', errore.code);
      
      let messaggioErrore = 'Errore durante il login';
      
      switch (errore.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          messaggioErrore = 'Email o password errati';
          break;
        case 'auth/invalid-email':
          messaggioErrore = 'Email non valida';
          break;
        case 'auth/user-disabled':
          messaggioErrore = 'Account disabilitato';
          break;
        case 'auth/too-many-requests':
          messaggioErrore = 'Troppi tentativi. Riprova tra qualche minuto.';
          break;
        default:
          messaggioErrore = `Errore: ${errore.message}`;
      }
      
      return { successo: false, errore: messaggioErrore };
    }
  }

  /**
   * Login con Google
   */
  async function loginConGoogle() {
    console.log('🔵 Tentativo di login con Google');
    
    try {
      const provider = new GoogleAuthProvider();
      
      // Configura provider per chiedere sempre la selezione account
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('📡 Apertura popup Google...');
      const risultato = await signInWithPopup(autenticazione, provider);
      
      console.log('✅ Login Google Riuscito:', risultato.user.uid);
      console.log('  - Email:', risultato.user.email);
      console.log('  - Nome:', risultato.user.displayName);
      console.log('  - Foto:', risultato.user.photoURL);
      
      // Verifica se è primo accesso (nuovo utente)
      const profiloEsiste = await getProfiloUtente(risultato.user.uid);
      
      if (!profiloEsiste.esiste) {
        console.log('📡 Primo accesso Google, inizializzazione profilo...');
        await inizializzaProfiloBase(risultato.user.uid, risultato.user.email);
        console.log('✅ Profilo base creato per utente Google');
      }
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ ERRORE login Google:', errore);
      console.error('  - Codice errore:', errore.code);
      console.error('  - Messaggio:', errore.message);
      
      let messaggioErrore = 'Errore durante il login con Google';
      
      switch (errore.code) {
        case 'auth/popup-closed-by-user':
          messaggioErrore = 'Popup chiuso prima del completamento';
          break;
        case 'auth/cancelled-popup-request':
          messaggioErrore = 'Richiesta popup annullata';
          break;
        case 'auth/popup-blocked':
          messaggioErrore = 'Popup bloccato dal browser. Abilita i popup per questo sito.';
          break;
        case 'auth/account-exists-with-different-credential':
          messaggioErrore = 'Account già esistente con diverso metodo di accesso';
          break;
        default:
          messaggioErrore = `Errore: ${errore.message}`;
      }
      
      return { successo: false, errore: messaggioErrore };
    }
  }

  /**
   * Logout
   */
  async function logout() {
    console.log('🔵 Tentativo di logout');
    
    try {
      await signOut(autenticazione);
      setProfiloUtente(null);
      
      console.log('✅ Logout effettuato');
      
      return { successo: true };
    } catch (errore) {
      console.error('❌ Errore logout:', errore);
      return { successo: false, errore: 'Errore durante il logout' };
    }
  }

  /**
   * Observer Firebase Auth
   */
  useEffect(() => {
    console.log('🔧 Inizializzazione observer Firebase Auth');
    
    const unsubscribe = onAuthStateChanged(autenticazione, async (utente) => {
      console.log('🔄 Stato autenticazione cambiato:', utente ? utente.uid : 'Nessun utente');
      
      if (utente) {
        console.log('  - Email:', utente.email);
        console.log('  - Provider:', utente.providerData.map(p => p.providerId).join(', '));
      }
      
      setUtenteCorrente(utente);

      if (utente) {
        console.log('📡 Caricamento profilo...');
        await caricaProfilo(utente.uid);
      } else {
        console.log('🔄 Reset profilo');
        setProfiloUtente(null);
      }

      setCaricamento(false);
      console.log('✅ Observer completato');
    });

    return () => {
      console.log('🔧 Cleanup observer');
      unsubscribe();
    };
  }, []);

  const value = {
    utenteCorrente,
    profiloUtente,
    registrazione,
    login,
    loginConGoogle,
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