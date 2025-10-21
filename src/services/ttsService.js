// src/services/ttsService.js
export function leggiTesto(testo, lingua = 'it-IT') {
  if (!('speechSynthesis' in window)) {
    console.error('TTS non supportato');
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(testo);
  utterance.lang = lingua;
  utterance.rate = 0.9; // Velocità leggermente ridotta per apprendimento
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
}

export function fermaTTS() {
  window.speechSynthesis.cancel();
}