// src/services/translationService.js

/**
 * Servizio di traduzione usando MyMemory API
 * Limite: 1000 richieste/giorno (sufficiente per MVP)
 * Nessuna API key richiesta per uso base
 */

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Cache delle traduzioni per evitare richieste duplicate
const cacheTraduzioni = new Map();

// Mappa codici lingua comuni
const CODICI_LINGUA = {
  'inglese': 'en',
  'italiano': 'it',
  'spagnolo': 'es',
  'francese': 'fr',
  'tedesco': 'de',
  'portoghese': 'pt',
  'giapponese': 'ja',
  'cinese': 'zh',
  'coreano': 'ko',
  'arabo': 'ar',
  'olandese': 'nl',
  'polacco': 'pl',
  'turco': 'tr'
};

/**
 * Traduce un testo da una lingua all'altra
 * @param {string} testo - Testo da tradurre
 * @param {string} linguaDa - Codice lingua sorgente (es. 'en', 'it')
 * @param {string} linguaA - Codice lingua destinazione
 * @returns {Promise<Object>} - Risultato con traduzione e alternative
 */
export async function traduciTesto(testo, linguaDa = 'en', linguaA = 'it') {
  try {
    // Validazione input
    if (!testo || testo.trim().length === 0) {
      throw new Error('Testo vuoto');
    }

    if (testo.length > 500) {
      throw new Error('Testo troppo lungo (max 500 caratteri)');
    }

    // Controlla cache
    const chiaveCache = `${testo}-${linguaDa}-${linguaA}`;
    if (cacheTraduzioni.has(chiaveCache)) {
      console.log('✅ Traduzione da cache');
      return cacheTraduzioni.get(chiaveCache);
    }

    // Costruisci URL
    const params = new URLSearchParams({
      q: testo,
      langpair: `${linguaDa}|${linguaA}`
    });

    const url = `${MYMEMORY_API_URL}?${params.toString()}`;

    // Chiamata API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Verifica risposta
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'Errore API');
    }

    // Prepara risultato
    const risultato = {
      successo: true,
      testoOriginale: testo,
      traduzione: data.responseData.translatedText,
      affidabilita: parseFloat(data.responseData.match || 0),
      linguaDa,
      linguaA,
      alternative: [],
      metadata: {
        timestamp: new Date().toISOString(),
        fonte: 'MyMemory'
      }
    };

    // Aggiungi traduzioni alternative (se disponibili)
    if (data.matches && Array.isArray(data.matches)) {
      risultato.alternative = data.matches
        .filter(m => m.translation !== risultato.traduzione) // Escludi duplicati
        .slice(0, 3) // Max 3 alternative
        .map(m => ({
          testo: m.translation,
          affidabilita: parseFloat(m.match || 0),
          fonte: m.reference || 'Community'
        }));
    }

    // Salva in cache
    cacheTraduzioni.set(chiaveCache, risultato);

    // Limita dimensione cache (max 100 elementi)
    if (cacheTraduzioni.size > 100) {
      const primaChiave = cacheTraduzioni.keys().next().value;
      cacheTraduzioni.delete(primaChiave);
    }

    console.log('🌐 Traduzione completata:', risultato.traduzione);

    return risultato;

  } catch (errore) {
    console.error('❌ Errore traduzione:', errore);
    
    return {
      successo: false,
      errore: errore.message,
      testoOriginale: testo,
      traduzione: null,
      alternative: []
    };
  }
}

/**
 * Rileva automaticamente la lingua di un testo
 * @param {string} testo
 * @returns {Promise<string>} - Codice lingua rilevato
 */
export async function rilevaLingua(testo) {
  try {
    // MyMemory non ha endpoint dedicato, usiamo euristica
    // Traduciamo in inglese e vediamo se cambia
    const risultato = await traduciTesto(testo, 'auto', 'en');
    
    if (risultato.successo && risultato.traduzione !== testo) {
      // Il testo è cambiato, probabilmente non è inglese
      return 'unknown';
    }
    
    return 'en';
  } catch (errore) {
    console.error('Errore rilevamento lingua:', errore);
    return 'unknown';
  }
}

/**
 * Traduce con rilevamento automatico lingua sorgente
 * @param {string} testo
 * @param {string} linguaA - Lingua destinazione
 */
export async function traduciAuto(testo, linguaA = 'it') {
  // MyMemory supporta 'auto' come lingua sorgente
  return traduciTesto(testo, 'auto', linguaA);
}

/**
 * Ottieni traduzioni multiple simultanee (per confronto)
 * @param {string} testo
 * @param {string} linguaDa
 * @param {Array<string>} lingueA - Array di lingue destinazione
 */
export async function traduciMultiplo(testo, linguaDa, lingueA) {
  try {
    const promesse = lingueA.map(lingua => 
      traduciTesto(testo, linguaDa, lingua)
    );

    const risultati = await Promise.all(promesse);

    return {
      successo: true,
      traduzioni: risultati.map((r, i) => ({
        lingua: lingueA[i],
        traduzione: r.traduzione,
        affidabilita: r.affidabilita
      }))
    };
  } catch (errore) {
    return {
      successo: false,
      errore: errore.message
    };
  }
}

/**
 * Suggerisci traduzioni durante la digitazione (con debounce)
 * @param {string} testo
 * @param {string} linguaDa
 * @param {string} linguaA
 * @param {number} delay - Millisecondi di attesa (default 500ms)
 */
let timeoutSuggerimenti = null;

export function suggerisciTraduzione(testo, linguaDa, linguaA, callback, delay = 500) {
  // Cancella timer precedente
  if (timeoutSuggerimenti) {
    clearTimeout(timeoutSuggerimenti);
  }

  // Non suggerire per testi troppo corti
  if (testo.trim().length < 3) {
    callback(null);
    return;
  }

  // Imposta nuovo timer
  timeoutSuggerimenti = setTimeout(async () => {
    const risultato = await traduciTesto(testo, linguaDa, linguaA);
    callback(risultato);
  }, delay);
}

/**
 * Pulisci cache traduzioni
 */
export function pulisciCache() {
  cacheTraduzioni.clear();
  console.log('🧹 Cache traduzioni pulita');
}

/**
 * Ottieni statistiche cache
 */
export function statisticheCache() {
  return {
    dimensione: cacheTraduzioni.size,
    limite: 100
  };
}

/**
 * Converti nome lingua in codice (helper)
 * @param {string} nomeLingua - Nome completo (es. "Inglese")
 * @returns {string} - Codice (es. "en")
 */
export function ottieniCodiceLingua(nomeLingua) {
  const nome = nomeLingua.toLowerCase();
  return CODICI_LINGUA[nome] || 'en';
}