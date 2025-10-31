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
  startAfter,
  getDoc
} from 'firebase/firestore';
import { database } from '../config/firebase';

const COLLEZIONE_FLASHCARD = 'flashcards';
const LIMITE_PER_PAGINA = 20;
const LIMITE_SESSIONE_STUDIO = 20; // Max card per sessione

/**
 * CREA nuova flashcard
 */
export async function creaFlashcard(idUtente, datiFlashcard) {
  try {
    const docRef = await addDoc(collection(database, COLLEZIONE_FLASHCARD), {
      idUtente: idUtente,
      parolaOriginale: datiFlashcard.parolaOriginale.trim(),
      traduzione: datiFlashcard.traduzione.trim(),
      linguaOriginale: datiFlashcard.linguaOriginale || 'en-US',
      linguaTraduzione: datiFlashcard.linguaTraduzione || 'it-IT',
      note: datiFlashcard.note || '',
      categoria: datiFlashcard.categoria || 'generale',
      dataCreazione: new Date().toISOString(),
      
      // Campi SRS (SuperMemo 2)
      livelloConoscenza: 1,
      ultimaRevisione: null,
      prossimaRevisione: new Date().toISOString(), // Disponibile subito
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
    console.error("❌ Errore creazione flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * OTTIENI flashcard con paginazione (per dashboard)
 */
export async function ottieniFlashcards(idUtente, ultimoDocumento = null) {
  try {
    let q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      orderBy('dataCreazione', 'desc'),
      limit(LIMITE_PER_PAGINA)
    );
    
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
    
    const ultimoDocVisibile = snapshot.docs[snapshot.docs.length - 1];
    const haAltrePagine = flashcards.length === LIMITE_PER_PAGINA;
    
    console.log(`✅ Recuperate ${flashcards.length} flashcard`);
    
    return { 
      successo: true, 
      dati: flashcards,
      ultimoDocumento: ultimoDocVisibile,
      haAltrePagine
    };
  } catch (errore) {
    console.error("❌ Errore recupero flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * OTTIENI flashcard PER REVISIONE (solo quelle da studiare oggi)
 */
export async function ottieniFlashcardPerRevisione(idUtente, limiteMax = LIMITE_SESSIONE_STUDIO) {
  try {
    const oggi = new Date().toISOString();
    
    console.log('🔍 Ricerca card da rivedere...');
    console.log('  - Utente:', idUtente);
    console.log('  - Data limite:', oggi);
    console.log('  - Limite max:', limiteMax);
    
    const q = query(
      collection(database, COLLEZIONE_FLASHCARD),
      where('idUtente', '==', idUtente),
      where('prossimaRevisione', '<=', oggi),
      orderBy('prossimaRevisione', 'asc'),
      limit(limiteMax)
    );
    
    const snapshot = await getDocs(q);
    const flashcards = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    
    console.log(`✅ ${flashcards.length} flashcard da rivedere oggi`);
    
    // Log dettaglio card
    flashcards.forEach((card, idx) => {
      console.log(`  ${idx + 1}. ${card.parolaOriginale} (prossima: ${card.prossimaRevisione})`);
    });
    
    return { 
      successo: true, 
      dati: flashcards,
      totale: flashcards.length
    };
  } catch (errore) {
    console.error("❌ Errore recupero card per revisione:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * REGISTRA REVISIONE - Implementa algoritmo SM-2
 * @param {string} idFlashcard - ID della flashcard
 * @param {number} qualita - Qualità risposta (0-5)
 *   0 = Blackout totale
 *   1 = Risposta sbagliata ma ricordata dopo aver visto la soluzione
 *   2 = Risposta sbagliata ma sembrava familiare
 *   3 = Risposta corretta ma con difficoltà
 *   4 = Risposta corretta con esitazione
 *   5 = Risposta perfetta
 */
export async function registraRevisione(idFlashcard, qualita) {
  try {
    console.log('🔵 Registrazione revisione');
    console.log('  - Card ID:', idFlashcard);
    console.log('  - Qualità:', qualita);
    
    // Recupera flashcard corrente
    const flashcardRef = doc(database, COLLEZIONE_FLASHCARD, idFlashcard);
    const flashcardSnap = await getDoc(flashcardRef);
    
    if (!flashcardSnap.exists()) {
      throw new Error('Flashcard non trovata');
    }
    
    const flashcard = flashcardSnap.data();
    
    console.log('📦 Dati flashcard correnti:');
    console.log('  - Facilità:', flashcard.facilita);
    console.log('  - Intervallo:', flashcard.intervallo);
    console.log('  - Numero revisioni:', flashcard.numeroRevisioni);
    
    // Algoritmo SM-2 (SuperMemo 2)
    let { facilita = 2.5, intervallo = 1, numeroRevisioni = 0 } = flashcard;
    
    // Calcola nuova facilità (EF - Easiness Factor)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    facilita = Math.max(1.3, facilita + (0.1 - (5 - qualita) * (0.08 + (5 - qualita) * 0.02)));
    
    console.log('📊 Nuova facilità calcolata:', facilita);
    
    // Calcola nuovo intervallo
    if (qualita < 3) {
      // Risposta sbagliata: riparti da 1 giorno
      intervallo = 1;
      console.log('❌ Risposta errata → Intervallo reset a 1 giorno');
    } else {
      // Risposta corretta: aumenta intervallo
      if (numeroRevisioni === 0) {
        intervallo = 1;
      } else if (numeroRevisioni === 1) {
        intervallo = 6;
      } else {
        intervallo = Math.round(intervallo * facilita);
      }
      console.log('✅ Risposta corretta → Nuovo intervallo:', intervallo, 'giorni');
    }
    
    // Calcola prossima revisione
    const prossimaRevisione = new Date();
    prossimaRevisione.setDate(prossimaRevisione.getDate() + intervallo);
    
    // Calcola livello di conoscenza (1-5)
    const nuovoLivello = Math.min(5, Math.max(1, Math.round(facilita)));
    
    console.log('📅 Prossima revisione:', prossimaRevisione.toISOString());
    console.log('⭐ Nuovo livello conoscenza:', nuovoLivello);
    
    // Aggiorna documento
    await updateDoc(flashcardRef, {
      facilita,
      intervallo,
      numeroRevisioni: numeroRevisioni + 1,
      livelloConoscenza: nuovoLivello,
      ultimaRevisione: new Date().toISOString(),
      prossimaRevisione: prossimaRevisione.toISOString()
    });
    
    console.log('✅ Revisione registrata con successo');
    
    return { 
      successo: true, 
      prossimaRevisione: prossimaRevisione.toISOString(),
      intervallo,
      livelloConoscenza: nuovoLivello
    };
  } catch (errore) {
    console.error("❌ Errore registrazione revisione:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * AGGIORNA flashcard esistente
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
    console.error("❌ Errore aggiornamento flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * ELIMINA flashcard
 */
export async function eliminaFlashcard(idFlashcard) {
  try {
    await deleteDoc(doc(database, COLLEZIONE_FLASHCARD, idFlashcard));
    
    console.log('🗑️ Flashcard eliminata:', idFlashcard);
    return { successo: true };
  } catch (errore) {
    console.error("❌ Errore eliminazione flashcard:", errore);
    return { successo: false, errore: errore.message };
  }
}

/**
 * STATISTICHE UTENTE - Per dashboard e widget
 */
export async function ottieniStatistiche(idUtente) {
  try {
    console.log('📊 Calcolo statistiche per:', idUtente);
    
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
      mediaTotaleRevisioni: flashcards.length > 0 
        ? Math.round(flashcards.reduce((sum, f) => sum + (f.numeroRevisioni || 0), 0) / flashcards.length)
        : 0,
      
      // Statistiche aggiuntive
      perLivello: {
        livello1: flashcards.filter(f => f.livelloConoscenza === 1).length,
        livello2: flashcards.filter(f => f.livelloConoscenza === 2).length,
        livello3: flashcards.filter(f => f.livelloConoscenza === 3).length,
        livello4: flashcards.filter(f => f.livelloConoscenza === 4).length,
        livello5: flashcards.filter(f => f.livelloConoscenza === 5).length,
      }
    };
    
    console.log('📊 Statistiche calcolate:', statistiche);
    
    return { successo: true, dati: statistiche };
  } catch (errore) {
    console.error("❌ Errore calcolo statistiche:", errore);
    return { successo: false, errore: errore.message };
  }
}