import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { 
  creaProfiloUtente, 
  getProfiloUtente 
} from '../services/userService';

const AutenticazioneContext = createContext();

export const useAutenticazione = () => {
  const context = useContext(AutenticazioneContext);
  if (!context) {
    throw new Error('useAutenticazione deve essere usato dentro AutenticazioneProvider');
  }
  return context;
};

export const AutenticazioneProvider = ({ children }) => {
  const [utenteCorrente, setUtenteCorrente] = useState(null);
  const [profiloUtente, setProfiloUtente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // Registrazione con email/password
  const registrazione = async (email, password, nome) => {
    try {
      setErrore(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Aggiorna display name
      await updateProfile(user, { displayName: nome });

      // Crea profilo base (onboarding NON completato)
      await creaProfiloUtente(user.uid, {
        email,
        nome,
        displayName: nome,
        onboardingCompletato: false,
        metodiAutenticazione: ['password']
      });

      return user;
    } catch (error) {
      console.error('Errore registrazione:', error);
      setErrore(tradurreErroreFirebase(error.code));
      throw error;
    }
  };

  // Login con Google
  const loginConGoogle = async () => {
    try {
      setErrore(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Verifica se utente esiste già
      let profilo = await getProfiloUtente(user.uid);

      if (!profilo) {
        // Primo accesso con Google: crea profilo base
        await creaProfiloUtente(user.uid, {
          email: user.email,
          nome: user.displayName,
          displayName: user.displayName,
          onboardingCompletato: false, // Deve fare onboarding
          metodiAutenticazione: ['google']
        });
      }

      return user;
    } catch (error) {
      console.error('Errore login Google:', error);
      setErrore(tradurreErroreFirebase(error.code));
      throw error;
    }
  };

  // Login con email/password
  const login = async (email, password) => {
    try {
      setErrore(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      console.error('Errore login:', error);
      setErrore(tradurreErroreFirebase(error.code));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setProfiloUtente(null);
    } catch (error) {
      console.error('Errore logout:', error);
      throw error;
    }
  };

  // Monitor stato autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUtenteCorrente(user);

      if (user) {
        try {
          // Carica profilo utente da Firestore
          const profilo = await getProfiloUtente(user.uid);
          setProfiloUtente(profilo);
        } catch (error) {
          console.error('Errore caricamento profilo:', error);
          setProfiloUtente(null);
        }
      } else {
        setProfiloUtente(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    utenteCorrente,
    profiloUtente,
    setProfiloUtente, // Permette aggiornamento dopo onboarding
    loading,
    errore,
    registrazione,
    login,
    loginConGoogle,
    logout
  };

  return (
    <AutenticazioneContext.Provider value={value}>
      {children}
    </AutenticazioneContext.Provider>
  );
};

// Traduzione errori Firebase
function tradurreErroreFirebase(codiceErrore) {
  const errori = {
    'auth/email-already-in-use': 'Email già registrata',
    'auth/invalid-email': 'Email non valida',
    'auth/weak-password': 'Password troppo debole (minimo 6 caratteri)',
    'auth/user-not-found': 'Utente non trovato',
    'auth/wrong-password': 'Password errata',
    'auth/popup-closed-by-user': 'Popup chiuso dall\'utente',
    'auth/cancelled-popup-request': 'Richiesta popup annullata',
    'auth/account-exists-with-different-credential': 'Account esistente con metodo diverso'
  };

  return errori[codiceErrore] || 'Errore sconosciuto';
}

