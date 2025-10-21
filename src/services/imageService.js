// src/services/imageService.js
const UNSPLASH_ACCESS = import.meta.env.VITE_UNSPLASH_KEY;

export async function cercaImmagine(query) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${query}&per_page=1`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS}`
      }
    }
  );
  
  const data = await response.json();
  return data.results[0]?.urls?.small || null;
}