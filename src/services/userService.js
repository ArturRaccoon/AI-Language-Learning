/**
 * FILE: src/services/userService.js
 * DATA CREAZIONE: 2024-12-25 22:00
 * DESCRIZIONE: Servizio per gestione profilo utente:
 *   - Salvataggio preferenze onboarding
 *   - Recupero profilo utente
 *   - Flag onboarding completato
 *   - Lingue predefinite
 */

import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { database } from '../config/firebase';

const COLLEZIONE_UTENTI = 'utenti';

/**
 * Salva o aggiorna il profilo utente completo
 * @param {string} idUtente - UID Firebase
 * @param {Object} datiProfilo - Dati profilo utente
 * @returns {Promise<Object>}
 */
export async function salvaProfiloUtente(idUtente, datiProfilo) {
  try {
    const riferimentoUtente = doc(database, COLLEZIONE_UTENTI, idUtente);
    
    const profiloCompleto = {
      // Dati onboarding
      linguaMadre: datiProfilo.linguaMadre,
      linguaObiettivo: datiProfilo.linguaObiettivo,
      obiettivi: datiProfilo.obiettivi || [],
      livelloConoscenza: datiProfilo.livelloConoscenza,
      
      // Metadata
      onboardingCompletato: true,
      dataOnboarding: new Date().toISOString(),
      dataAggiornamento: new Date().toISOString(),
      
      // Info aggiuntive (per future feature)
      impostazioniNotifiche: datiProfilo.impostazioniNotifiche || {
        revisioni: true,
        progressi: true,
        suggerimenti: false
      },
      
      tema: datiProfilo.tema || 'auto' // auto, light, dark
    };

    // Usa setDoc con merge per non sovrascrivere campi esistenti
    await setDoc(riferimentoUtente, profiloCompleto, { merge: true });

    console.log('✅ Profilo utente salvato:', idUtente);
    
    return { 
      successo: true, 
      profilo: profiloCompleto 
    };

  } catch (errore) {
    console.error('❌ Errore salvataggio profilo:', errore);
    return { 
      successo: false, 
      errore: errore.message 
    };
  }
}

/**
 * Recupera il profilo utente da Firestore
 * @param {string} idUtente - UID Firebase
 * @returns {Promise<Object>}
 */
export async function getProfiloUtente(idUtente) {
  try {
    const riferimentoUtente = doc(database, COLLEZIONE_UTENTI, idUtente);
    const snapshot = await getDoc(riferimentoUtente);

    if (snapshot.exists()) {
      const profilo = snapshot.data();
      
      console.log('✅ Profilo utente recuperato:', idUtente);
      
      return { 
        successo: true, 
        profilo,
        esiste: true 
      };
    } else {
      // Utente esiste in Auth ma non ha profilo → onboarding necessario
      console.log('⚠️ Profilo non trovato, onboarding necessario');
      
      return { 
        successo: true, 
        profilo: null,
        esiste: false 
      };
    }

  } catch (errore) {
    console.error('❌ Errore recupero profilo:', errore);
    return { 
      successo: false, 
      errore: errore.message 
    };
  }
}

/**
 * Verifica se l'utente ha completato l'onboarding
 * @param {string} idUtente - UID Firebase
 * @returns {Promise<boolean>}
 */
export async function isOnboardingCompletato(idUtente) {
  try {
    const risultato = await getProfiloUtente(idUtente);
    
    if (!risultato.successo) {
      return false;
    }

    return risultato.esiste && risultato.profilo?.onboardingCompletato === true;

  } catch (errore) {
    console.error('❌ Errore verifica onboarding:', errore);
    return false;
  }
}

/**
 * Aggiorna solo le lingue predefinite
 * @param {string} idUtente - UID Firebase
 * @param {string} linguaMadre - Codice lingua madre (es. 'it-IT')
 * @param {string} linguaObiettivo - Codice lingua obiettivo (es. 'en-US')
 * @returns {Promise<Object>}
 */
export async function aggiornaLingue(idUtente, linguaMadre, linguaObiettivo) {
  try {
    const riferimentoUtente = doc(database, COLLEZIONE_UTENTI, idUtente);
    
    await updateDoc(riferimentoUtente, {
      linguaMadre,
      linguaObiettivo,
      dataAggiornamento: new Date().toISOString()
    });

    console.log('✅ Lingue aggiornate');
    
    return { successo: true };

  } catch (errore) {
    console.error('❌ Errore aggiornamento lingue:', errore);
    return { 
      successo: false, 
      errore: errore.message 
    };
  }
}

/**
 * Aggiorna preferenze utente parziali
 * @param {string} idUtente - UID Firebase
 * @param {Object} preferenze - Oggetto con preferenze da aggiornare
 * @returns {Promise<Object>}
 */
export async function aggiornaPreferenze(idUtente, preferenze) {
  try {
    const riferimentoUtente = doc(database, COLLEZIONE_UTENTI, idUtente);
    
    await updateDoc(riferimentoUtente, {
      ...preferenze,
      dataAggiornamento: new Date().toISOString()
    });

    console.log('✅ Preferenze aggiornate');
    
    return { successo: true };

  } catch (errore) {
    console.error('❌ Errore aggiornamento preferenze:', errore);
    return { 
      successo: false, 
      errore: errore.message 
    };
  }
}

/**
 * Inizializza un profilo base per l'utente
 * (chiamata al primo login, prima dell'onboarding)
 * @param {string} idUtente - UID Firebase
 * @param {string} email - Email utente
 * @returns {Promise<Object>}
 */
export async function inizializzaProfiloBase(idUtente, email) {
  try {
    const riferimentoUtente = doc(database, COLLEZIONE_UTENTI, idUtente);
    
    const profiloBase = {
      email,
      dataCreazione: new Date().toISOString(),
      onboardingCompletato: false,
      linguaMadre: null,
      linguaObiettivo: null
    };

    await setDoc(riferimentoUtente, profiloBase, { merge: true });

    console.log('✅ Profilo base inizializzato');
    
    return { successo: true };

  } catch (errore) {
    console.error('❌ Errore inizializzazione profilo:', errore);
    return { 
      successo: false, 
      errore: errore.message 
    };
  }
}