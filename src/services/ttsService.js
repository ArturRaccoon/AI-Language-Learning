// src/services/ttsService.js

/**
 * Servizio Text-to-Speech con Google Cloud TTS
 * Selezione CASUALE delle voci ad ogni riproduzione (stile Duolingo)
 * Voci Neural2/WaveNet per massima naturalezza
 */

// Configurazione API
const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';
const GOOGLE_VOICES_ENDPOINT = 'https://texttospeech.googleapis.com/v1/voices';

// Gestione stato audio
let audioCorrente = null;
let inRiproduzione = false;

// Cache voci per lingua (evita chiamate ripetute)
const cacheVoci = new Map();

// Cache audio per testo+voce (evita rigenerazioni)
const cacheAudio = new Map();
const MAX_CACHE_AUDIO = 50;

/**
 * Inizializza il servizio TTS
 */
export function inizializzaTTS() {
  if (!GOOGLE_TTS_API_KEY) {
    console.error('❌ Google Cloud TTS API key non trovata!');
    console.error('Aggiungi VITE_GOOGLE_TTS_API_KEY in .env.local');
    return false;
  }

  console.log('✅ Google Cloud TTS inizializzato (voci dinamiche)');
  return true;
}

/**
 * Ottiene le voci disponibili per una lingua specifica
 * Filtra SOLO voci di alta qualità (Neural2, WaveNet)
 * @param {string} languageCode - Codice lingua (es. 'en-US', 'it-IT')
 * @returns {Promise<Array>} - Array di voci di alta qualità
 */
async function getVoicesForLanguage(languageCode) {
  try {
    // Controlla cache
    if (cacheVoci.has(languageCode)) {
      console.log(`✅ Voci per ${languageCode} da cache`);
      return cacheVoci.get(languageCode);
    }

    console.log(`🔍 Recupero voci per ${languageCode}...`);

    const response = await fetch(
      `${GOOGLE_VOICES_ENDPOINT}?languageCode=${languageCode}&key=${GOOGLE_TTS_API_KEY}`
    );

    if (!response.ok) {
      console.error(`❌ Errore recupero voci: ${response.status}`);
      return [];
    }

    const data = await response.json();

    if (!data.voices || data.voices.length === 0) {
      console.warn(`⚠️ Nessuna voce trovata per ${languageCode}`);
      return [];
    }

    // Filtra SOLO voci di alta qualità
    const vociHighQuality = data.voices.filter(voice => {
      const name = voice.name.toLowerCase();
      return name.includes('neural2') || name.includes('wavenet');
    });

    console.log(`✅ ${vociHighQuality.length} voci di alta qualità per ${languageCode}`);

    // Salva in cache
    cacheVoci.set(languageCode, vociHighQuality);

    return vociHighQuality;

  } catch (errore) {
    console.error('❌ Errore getVoicesForLanguage:', errore);
    return [];
  }
}

/**
 * Seleziona una voce CASUALE dall'array
 * @param {Array} voci - Array di voci disponibili
 * @returns {Object|null} - Voce selezionata o null
 */
function selezionaVoceCasuale(voci) {
  if (!voci || voci.length === 0) {
    return null;
  }

  const indiceCasuale = Math.floor(Math.random() * voci.length);
  const voceScelta = voci[indiceCasuale];

  console.log(`🎲 Voce casuale: ${voceScelta.name} (${voceScelta.ssmlGender})`);

  return voceScelta;
}

/**
 * Genera chiave cache per audio
 */
function generaChiaveAudio(testo, lingua, nomeVoce) {
  return `${lingua}:${nomeVoce}:${testo.substring(0, 50)}`;
}

/**
 * Legge un testo usando Google Cloud TTS con voce CASUALE
 * @param {string} testo - Testo da leggere (max 5000 caratteri)
 * @param {string} lingua - Codice lingua (es. 'en-US', 'it-IT')
 * @param {Object} opzioni - Opzioni aggiuntive
 * @returns {Promise<void>}
 */
export async function leggiTesto(
  testo, 
  lingua = 'en-US', 
  opzioni = {}
) {
  try {
    // Validazione API key
    if (!GOOGLE_TTS_API_KEY) {
      throw new Error('API key Google Cloud TTS non configurata');
    }

    // Validazione testo
    if (!testo || testo.trim().length === 0) {
      throw new Error('Testo vuoto');
    }

    if (testo.length > 5000) {
      throw new Error('Testo troppo lungo (max 5000 caratteri)');
    }

    // Ferma audio precedente
    if (inRiproduzione && audioCorrente) {
      fermaTTS();
    }

    // 🎲 OTTIENI VOCI DISPONIBILI PER LA LINGUA
    const vociDisponibili = await getVoicesForLanguage(lingua);

    // Prepara configurazione voce
    let voiceConfig;

    if (vociDisponibili.length > 0) {
      // 🎲 SELEZIONA VOCE CASUALE
      const voceCasuale = selezionaVoceCasuale(vociDisponibili);

      voiceConfig = {
        languageCode: lingua,
        name: voceCasuale.name
        // Non specifichiamo ssmlGender, Google usa quello della voce
      };

      // Controlla cache audio specifica per questa voce
      const chiaveCache = generaChiaveAudio(testo, lingua, voceCasuale.name);
      
      if (cacheAudio.has(chiaveCache)) {
        console.log('✅ Audio specifico da cache');
        const audioUrl = cacheAudio.get(chiaveCache);
        return riproduciAudio(audioUrl);
      }

    } else {
      // Fallback: usa configurazione base
      console.warn(`⚠️ Nessuna voce trovata, uso fallback per ${lingua}`);
      voiceConfig = {
        languageCode: lingua,
        ssmlGender: 'NEUTRAL'
      };
    }

    // 🎙️ CHIAMATA API Google Cloud TTS
    console.log('🔊 Richiesta Google Cloud TTS...');

    const requestBody = {
      input: {
        text: testo
      },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: opzioni.pitch || 0, // Variazione tonale (da -20 a +20)
        speakingRate: opzioni.speakingRate || 1.0, // Velocità (0.25 a 4.0)
        volumeGainDb: opzioni.volumeGainDb || 0,
        effectsProfileId: ['small-bluetooth-speaker-class-device']
      }
    };

    const response = await fetch(
      `${GOOGLE_TTS_ENDPOINT}?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    // Gestione errori API
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Errore API Google TTS:', errorData);
      
      if (response.status === 403) {
        throw new Error('API key non valida o quota esaurita');
      } else if (response.status === 429) {
        throw new Error('Troppe richieste, riprova tra poco');
      } else {
        throw new Error(`Errore API: ${response.status}`);
      }
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('Nessun audio ricevuto dall\'API');
    }

    // Crea URL audio da Base64
    const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;

    // Salva in cache (solo se abbiamo usato voce specifica)
    if (voiceConfig.name) {
      const chiaveCache = generaChiaveAudio(testo, lingua, voiceConfig.name);
      cacheAudio.set(chiaveCache, audioUrl);

      // Gestisci dimensione cache
      if (cacheAudio.size > MAX_CACHE_AUDIO) {
        const primaChiave = cacheAudio.keys().next().value;
        cacheAudio.delete(primaChiave);
      }
    }

    console.log('✅ Audio ricevuto');

    // Riproduzione
    return riproduciAudio(audioUrl);

  } catch (errore) {
    console.error('❌ Errore TTS:', errore);
    inRiproduzione = false;
    throw errore;
  }
}

/**
 * Riproduce audio da URL (helper interno)
 * @param {string} audioUrl - Data URL dell'audio
 * @returns {Promise<void>}
 */
function riproduciAudio(audioUrl) {
  return new Promise((resolve, reject) => {
    audioCorrente = new Audio(audioUrl);
    
    audioCorrente.onloadeddata = () => {
      console.log('🔊 Riproduzione avviata');
      inRiproduzione = true;
    };

    audioCorrente.onended = () => {
      console.log('✅ Riproduzione completata');
      inRiproduzione = false;
      audioCorrente = null;
      resolve();
    };

    audioCorrente.onerror = (errore) => {
      console.error('❌ Errore riproduzione audio:', errore);
      inRiproduzione = false;
      audioCorrente = null;
      reject(new Error('Errore riproduzione audio'));
    };

    // Avvia riproduzione
    audioCorrente.play().catch(err => {
      console.error('❌ Errore play():', err);
      inRiproduzione = false;
      reject(err);
    });
  });
}

/**
 * Ferma qualsiasi riproduzione TTS in corso
 */
export function fermaTTS() {
  if (audioCorrente) {
    try {
      audioCorrente.pause();
      audioCorrente.currentTime = 0;
      audioCorrente = null;
      inRiproduzione = false;
      console.log('⏸️ TTS fermato');
    } catch (err) {
      console.error('Errore durante stop TTS:', err);
    }
  }
}

/**
 * Verifica se TTS è in riproduzione
 * @returns {boolean}
 */
export function isTTSInRiproduzione() {
  return inRiproduzione && audioCorrente && !audioCorrente.paused;
}

/**
 * Metti in pausa TTS
 */
export function pausaTTS() {
  if (audioCorrente && !audioCorrente.paused) {
    audioCorrente.pause();
    inRiproduzione = false;
    console.log('⏸️ TTS in pausa');
  }
}

/**
 * Riprendi TTS dalla pausa
 */
export function riprendiTTS() {
  if (audioCorrente && audioCorrente.paused) {
    audioCorrente.play();
    inRiproduzione = true;
    console.log('▶️ TTS ripreso');
  }
}

/**
 * Pulisci tutte le cache
 */
export function pulisciCache() {
  cacheVoci.clear();
  cacheAudio.clear();
  console.log('🧹 Cache pulite (voci + audio)');
}

/**
 * Ottieni statistiche cache
 */
export function statisticheCache() {
  return {
    vociLingue: cacheVoci.size,
    audioSalvati: cacheAudio.size,
    limiteAudio: MAX_CACHE_AUDIO,
    percentualeUsoAudio: Math.round((cacheAudio.size / MAX_CACHE_AUDIO) * 100)
  };
}

/**
 * Pre-carica voci per una lingua (ottimizzazione)
 * @param {string} languageCode
 */
export async function precaricaVoci(languageCode) {
  await getVoicesForLanguage(languageCode);
  console.log(`✅ Voci pre-caricate per ${languageCode}`);
}

// Inizializza all'import
inizializzaTTS();