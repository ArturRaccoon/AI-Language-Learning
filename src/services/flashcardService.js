// Servizio per gestire le operazioni CRUD delle flashcard su Firestore
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { database } from '../config/firebase';

// Nome della collezione Firestore
const COLLEZIONE_FLASHCARD = 'flashcards';

// Crea una nuova flashcard
export async function creaFlashcard(idUtente, datiFlashcard) {
  try {
    const docRef = await addDoc(collection(database, COLLEZIONE_FLASHCARD), {
      idUtente,
      parolaOriginale: datiFlashcard.parolaOriginale,
      traduzione: datiFlashcard.traduzione,
      linguaOriginale: datiFlashcard.linguaOriginale,
      linguaTraduzione: datiFlashcard.linguaTraduzione,
      contatoreRipetizioni: 0,
      livelloConoscenza: 0,
      dataCreazione: new Date().toISOString(),
      ultimaRevisione: null
    });
    
    return { successo: true, id: docRef.id };
  } catch (errore) {
    console.error('Errore nella creazione della flashcard:', errore);
    return { successo: false, errore: errore.message };
  }
}

// Ottieni tutte le flashcard di un utente
export async function ottieniFlashcards(idUtente) {
  try {
    const q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      orderBy('dataCreazione', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const flashcards = [];
    
    snapshot.forEach((doc) => {
      flashcards.push({ id: doc.id, ...doc.data() });
    });
    
    return { successo: true, flashcards };
  } catch (errore) {
    console.error('Errore nel recupero delle flashcard:', errore);
    return { successo: false, errore: errore.message };
  }
}

// Aggiorna una flashcard esistente
export async function aggiornaFlashcard(idFlashcard, nuoviDati) {
  try {
    const rifDocumento = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    await updateDoc(rifDocumento, {
      ...nuoviDati,
      ultimaRevisione: new Date().toISOString()
    });
    
    return { successo: true };
  } catch (errore) {
    console.error('Errore nell\'aggiornamento della flashcard:', errore);
    return { successo: false, errore: errore.message };
  }
}

// Elimina una flashcard
export async function eliminaFlashcard(idFlashcard) {
  try {
    await deleteDoc(doc(database, COLLEZIONE_FLASHCARD, idFlashcard));
    return { successo: true };
  } catch (errore) {
    console.error('Errore nell\'eliminazione della flashcard:', errore);
    return { successo: false, errore: errore.message };
  }
}

// Incrementa il contatore di ripetizioni
export async function incrementaRipetizioni(idFlashcard, nuovoLivello) {
  try {
    const rifDocumento = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    const snapshot = await getDocs(query(collection(database, COLLEZIONE_FLASHCARD), where('__name__', '==', idFlashcard)));
    
    if (!snapshot.empty) {
      const contatoreAttuale = snapshot.docs[0].data().contatoreRipetizioni || 0;
      
      await updateDoc(rifDocumento, {
        contatoreRipetizioni: contatoreAttuale + 1,
        livelloConoscenza: nuovoLivello,
        ultimaRevisione: new Date().toISOString()
      });
    }
    
    return { successo: true };
  } catch (errore) {
    console.error('Errore nell\'incremento ripetizioni:', errore);
    return { successo: false, errore: errore.message };
  }
}