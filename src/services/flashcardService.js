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
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { database } from '../config/firebase';

// Nome della collezione Firestore
const COLLEZIONE_FLASHCARD = 'flashcards';

/**
 * CREA una nuova flashcard
 * @param {string} idUtente - UID dell'utente autenticato
 * @param {Object} datiFlashcard - Dati della flashcard (parolaOriginale, traduzione)
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function creaFlashcard(idUtente, datiFlashcard) {
  try {
    const docRef = await addDoc(collection(database, COLLEZIONE_FLASHCARD), {
      idUtente: idUtente,
      parolaOriginale: datiFlashcard.parolaOriginale,
      traduzione: datiFlashcard.traduzione,
      dataCreazione: new Date().toISOString(),
      // Campi per spaced repetition (fase futura)
      livelloConoscenza: 1, // 1 = nuovo, 5 = padroneggiato
      ultimaRevisione: new Date().toISOString(),
      prossimaRevisione: new Date().toISOString(),
      numeroRevisioni: 0,
    });
    
    console.log('✅ Flashcard creata con ID:', docRef.id);
    return { successo: true, id: docRef.id };
  } catch (errore) {
    console.error("❌ Errore nella creazione della flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * ASCOLTA le flashcard in tempo reale (real-time updates)
 * Questa funzione usa onSnapshot per ricevere aggiornamenti istantanei
 * @param {string} idUtente - UID dell'utente autenticato
 * @param {Function} callback - Funzione chiamata quando i dati cambiano
 * @returns {Function} - Funzione per fermare l'ascolto (cleanup)
 */
export function ascoltaFlashcards(idUtente, callback) {
  const q = query(
    collection(database, COLLEZIONE_FLASHCARD),
    where('idUtente', '==', idUtente),
    orderBy('dataCreazione', 'desc')
  );
  
  // onSnapshot restituisce una funzione unsubscribe per fermare l'ascolto
  const unsubscribe = onSnapshot(q, 
    (snapshot) => {
      const flashcards = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      console.log(`📥 Ricevute ${flashcards.length} flashcard da Firestore`);
      callback({ successo: true, dati: flashcards });
    },
    (errore) => {
      console.error("❌ Errore nell'ascolto delle flashcard:", errore);
      callback({ successo: false, errore: errore.message });
    }
  );
  
  return unsubscribe;
}

/**
 * OTTIENI flashcard (fetch singolo, senza real-time)
 * Usa questa funzione se non hai bisogno di aggiornamenti in tempo reale
 * @param {string} idUtente - UID dell'utente autenticato
 * @returns {Promise<Object>} - Risultato con array di flashcard
 */
export async function ottieniFlashcards(idUtente) {
  try {
    const q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      orderBy('dataCreazione', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`✅ Recuperate ${flashcards.length} flashcard`);
    return { successo: true, dati: flashcards };
  } catch (errore) {
    console.error("❌ Errore nel recupero delle flashcard:", errore);
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
 * AGGIORNA REVISIONE - Segna una flashcard come revisionata
 * Questa funzione sarà usata quando implementeremo lo spaced repetition
 * @param {string} idFlashcard - ID della flashcard
 * @param {number} difficolta - 1 (facile) a 5 (difficile)
 * @returns {Promise<Object>} - Risultato dell'operazione
 */
export async function aggiornaRevisione(idFlashcard, difficolta) {
  try {
    const rifDocumento = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    
    // Calcola la prossima revisione basata sulla difficoltà
    const giorniDaAggiungere = difficolta === 1 ? 7 : difficolta === 2 ? 3 : 1;
    const prossimaRevisione = new Date();
    prossimaRevisione.setDate(prossimaRevisione.getDate() + giorniDaAggiungere);
    
    await updateDoc(rifDocumento, {
      ultimaRevisione: new Date().toISOString(),
      prossimaRevisione: prossimaRevisione.toISOString(),
      numeroRevisioni: increment(1),
      livelloConoscenza: Math.min(5, difficolta + 1)
    });
    
    console.log('✅ Revisione registrata per flashcard:', idFlashcard);
    return { successo: true };
  } catch (errore) {
    console.error("❌ Errore nell'aggiornamento della revisione:", errore);
    return { successo: false, errore: errore.message };
  }
}

// Helper per incrementare valori numerici
function increment(value) {
  return { increment: value };
}