// src/services/flashcardService.js
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { database } from '../config/firebase';

// Configurazione paginazione
const COLLEZIONE_FLASHCARD = 'flashcards';
const LIMITE_PER_PAGINA = 20; // Numero di card per pagina

/**
 * CREA una nuova flashcard
 * @param {string} idUtente - UID dell'utente autenticato
 * @param {Object} datiFlashcard - Dati della flashcard
 * @returns {Promise<Object>} - Risultato dell'operazione con ID della card creata
 */
export async function creaFlashcard(idUtente, datiFlashcard) {
  try {
    const docRef = await addDoc(collection(database, COLLEZIONE_FLASHCARD), {
      idUtente: idUtente,
      parolaOriginale: datiFlashcard.parolaOriginale.trim(),
      traduzione: datiFlashcard.traduzione.trim(),
      linguaOriginale: datiFlashcard.linguaOriginale || 'en-US', // NUOVO
      linguaTraduzione: datiFlashcard.linguaTraduzione || 'it-IT', // NUOVO
      dataCreazione: new Date().toISOString(),
      // Campi per Spaced Repetition System (SRS)
      livelloConoscenza: 1,
      ultimaRevisione: null,
      prossimaRevisione: new Date().toISOString(),
      numeroRevisioni: 0,
      facilita: 2.5,
      intervallo: 1,
    });
    
    console.log('✅ Flashcard creata con ID:', docRef.id);
    return { 
      successo: true, 
      id: docRef.id, 
      dati: { 
        id: docRef.id, 
        ...datiFlashcard 
      } 
    };
  } catch (errore) {
    console.error("❌ Errore nella creazione della flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * OTTIENI flashcard con PAGINAZIONE
 * Questa è la funzione principale per caricare le flashcard
 * @param {string} idUtente - UID dell'utente autenticato
 * @param {Object|null} ultimoDocumento - Snapshot dell'ultimo documento visto (per paginazione)
 * @returns {Promise<Object>} - Risultato con array di flashcard e ultimo documento
 */
export async function ottieniFlashcards(idUtente, ultimoDocumento = null) {
  try {
    // Costruisci la query base
    let q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      orderBy('dataCreazione', 'desc'),
      limit(LIMITE_PER_PAGINA)
    );
    
    // Se c'è un punto di partenza, continua da lì
    if (ultimoDocumento) {
      q = query(
        collection(database, COLLEZIONE_FLASHCARD),
        where('idUtente', '==', idUtente),
        orderBy('dataCreazione', 'desc'),
        startAfter(ultimoDocumento),
        limit(LIMITE_PER_PAGINA)
      );
    }
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    // L'ultimo documento diventa il cursore per la prossima pagina
    const ultimoDocVisibile = snapshot.docs[snapshot.docs.length - 1];
    
    // Se abbiamo meno card del limite, non ci sono altre pagine
    const haAltrePagine = flashcards.length === LIMITE_PER_PAGINA;
    
    console.log(`✅ Recuperate ${flashcards.length} flashcard (altre pagine: ${haAltrePagine})`);
    
    return { 
      successo: true, 
      dati: flashcards,
      ultimoDocumento: ultimoDocVisibile,
      haAltrePagine
    };
  } catch (errore) {
    console.error("❌ Errore nel recupero delle flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * OTTIENI flashcard PER REVISIONE (per SRS)
 * Carica solo le flashcard che devono essere revisionate oggi
 * @param {string} idUtente - UID dell'utente autenticato
 * @param {number} limite - Numero massimo di card da caricare
 * @returns {Promise<Object>} - Flashcard in scadenza oggi
 */
export async function ottieniFlashcardPerRevisione(idUtente, limite = 20) {
  try {
    const oggi = new Date().toISOString();
    
    const q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      where('prossimaRevisione', '<=', oggi),
      orderBy('prossimaRevisione', 'asc'),
      limit(limite)
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`🧠 ${flashcards.length} flashcard in scadenza oggi`);
    
    return { successo: true, dati: flashcards };
  } catch (errore) {
    console.error("❌ Errore nel recupero flashcard per revisione:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * AGGIORNA una flashcard esistente
 * @param {string} idFlashcard - ID della flashcard da aggiornare
 * @param {Object} nuoviDati - Nuovi dati da salvare
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function aggiornaFlashcard(idFlashcard, nuoviDati) {
  try {
    const rifDocumento = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    await updateDoc(rifDocumento, {
      ...nuoviDati,
      dataAggiornamento: new Date().toISOString()
    });
    
    console.log('✅ Flashcard aggiornata:', idFlashcard);
    return { successo: true };
  } catch (errore) {
    console.error("❌ Errore nell'aggiornamento della flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * ELIMINA una flashcard
 * @param {string} idFlashcard - ID della flashcard da eliminare
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function eliminaFlashcard(idFlashcard) {
  try {
    await deleteDoc(doc(database, COLLEZIONE_FLASHCARD, idFlashcard));
    
    console.log('🗑️ Flashcard eliminata:', idFlashcard);
    return { successo: true };
  } catch (errore) {
    console.error("❌ Errore nell'eliminazione della flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * REGISTRA REVISIONE - Implementa algoritmo SM-2 per Spaced Repetition
 * @param {string} idFlashcard - ID della flashcard
 * @param {number} qualita - Qualità della risposta (0-5): 0=totale blackout, 5=perfetto
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function registraRevisione(idFlashcard, qualita) {
  try {
    // Recupera la flashcard corrente
    const flashcardRef = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    const flashcardSnap = await getDocs(query(collection(database, COLLEZIONE_FLASHCARD), where('__name__', '==', idFlashcard)));
    
    if (flashcardSnap.empty) {
      throw new Error('Flashcard non trovata');
    }
    
    const flashcard = flashcardSnap.docs[0].data();
    
    // Algoritmo SM-2 (SuperMemo 2)
    let { facilita = 2.5, intervallo = 1, numeroRevisioni = 0 } = flashcard;
    
    // Calcola nuova facilità
    facilita = Math.max(1.3, facilita + (0.1 - (5 - qualita) * (0.08 + (5 - qualita) * 0.02)));
    
    // Calcola nuovo intervallo
    if (qualita < 3) {
      // Risposta sbagliata: riparti da 1 giorno
      intervallo = 1;
    } else {
      // Risposta corretta: aumenta intervallo
      if (numeroRevisioni === 0) {
        intervallo = 1;
      } else if (numeroRevisioni === 1) {
        intervallo = 6;
      } else {
        intervallo = Math.round(intervallo * facilita);
      }
    }
    
    // Calcola prossima revisione
    const prossimaRevisione = new Date();
    prossimaRevisione.setDate(prossimaRevisione.getDate() + intervallo);
    
    // Aggiorna livello di conoscenza (1-5)
    const nuovoLivello = Math.min(5, Math.max(1, Math.round(facilita)));
    
    await updateDoc(flashcardRef, {
      facilita,
      intervallo,
      numeroRevisioni: numeroRevisioni + 1,
      livelloConoscenza: nuovoLivello,
      ultimaRevisione: new Date().toISOString(),
      prossimaRevisione: prossimaRevisione.toISOString()
    });
    
    console.log(`✅ Revisione registrata: prossima tra ${intervallo} giorni`);
    
    return { 
      successo: true, 
      prossimaRevisione: prossimaRevisione.toISOString(),
      intervallo 
    };
  } catch (errore) {
    console.error("❌ Errore nella registrazione revisione:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * STATISTICHE UTENTE - Dati per dashboard SRS
 * @param {string} idUtente - UID dell'utente
 * @returns {Promise<Object>} - Statistiche complete
 */
export async function ottieniStatistiche(idUtente) {
  try {
    const q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente)
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => doc.data());
    
    const oggi = new Date().toISOString();
    
    const statistiche = {
      totale: flashcards.length,
      daRivedere: flashcards.filter(f => f.prossimaRevisione <= oggi).length,
      nuove: flashcards.filter(f => f.numeroRevisioni === 0).length,
      padroneggiate: flashcards.filter(f => f.livelloConoscenza >= 4).length,
      mediaTotaleRevisioni: flashcards.reduce((sum, f) => sum + (f.numeroRevisioni || 0), 0) / flashcards.length || 0
    };
    
    console.log('📊 Statistiche:', statistiche);
    
    return { successo: true, dati: statistiche };
  } catch (errore) {
    console.error("❌ Errore nel calcolo statistiche:", errore);
    return { successo: false, errore: errore.message };
  }
}