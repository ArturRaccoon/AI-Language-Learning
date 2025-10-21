// src/services/translationService.js
const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export async function traduciTesto(testo, linguaDa, linguaA) {
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(testo)}&langpair=${linguaDa}|${linguaA}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    traduzione: data.responseData.translatedText,
    affidabilita: data.responseData.match,
    alternative: data.matches?.slice(0, 3).map(m => m.translation) || []
  };
}