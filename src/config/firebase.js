// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// Configurazione Firebase
const configurazioneFire = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inizializza Firebase
const app = initializeApp(configurazioneFire);

// Export con nomi italiani (coerenti con il progetto)
export const autenticazione = getAuth(app);
export const database = getFirestore(app);

// Abilita cache offline persistente
enableIndexedDbPersistence(database)
  .then(() => {
    console.log("✅ Cache offline abilitata con successo!");
  })
  .catch((errore) => {
    if (errore.code === 'failed-precondition') {
      console.warn("⚠️ Cache offline: più schede aperte simultaneamente");
    } else if (errore.code === 'unimplemented') {
      console.warn("⚠️ Browser non supporta IndexedDB persistence");
    }
  });

export default app;