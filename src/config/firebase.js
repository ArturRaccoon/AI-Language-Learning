// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// La tua configurazione Firebase personale
const firebaseConfig = {
  apiKey: "AIzaSyBG7L3VEVZFCLUNz2TDoIuAbL20dUc_WIw",
  authDomain: "language-learning-ai-6a367.firebaseapp.com",
  projectId: "language-learning-ai-6a367",
  storageBucket: "language-learning-ai-6a367.appspot.com",
  messagingSenderId: "838945541559",
  appId: "1:838945541559:web:344ef0182f02309aba2c32",
  measurementId: "G-HFX9JJRXDX"
};

// Inizializza Firebase
const app = initializeApp(firebaseConfig);

// Esporta i servizi che useremo: Autenticazione e Database
export const autenticazione = getAuth(app);
export const database = getFirestore(app);

export default app;
