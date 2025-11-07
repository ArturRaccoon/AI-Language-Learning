/**
 * FILE: src/services/translationService.js
 * LAST MODIFIED: 2025-01-19
 * DESCRIPTION: Translation service using MyMemory API with caching
 */

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Translation cache to avoid duplicate requests
const translationCache = new Map();

// Common language code mappings
const LANGUAGE_CODES = {
  'english': 'en',
  'italian': 'it',
  'spanish': 'es',
  'french': 'fr',
  'german': 'de',
  'portuguese': 'pt',
  'japanese': 'ja',
  'chinese': 'zh',
  'korean': 'ko',
  'arabic': 'ar',
  'dutch': 'nl',
  'polish': 'pl',
  'turkish': 'tr',
  'ukrainian': 'uk'
};

/**
 * Translate text from one language to another
 */
export async function translateText(text, fromLang = 'en', toLang = 'it') {
  try {
    // Input validation
    if (!text || text.trim().length === 0) {
      throw new Error('Empty text');
    }

    if (text.length > 500) {
      throw new Error('Text too long (max 500 characters)');
    }

    // Check cache
    const cacheKey = `${text}-${fromLang}-${toLang}`;
    if (translationCache.has(cacheKey)) {
      console.log('✅ Translation from cache');
      return translationCache.get(cacheKey);
    }

    // Build URL
    const params = new URLSearchParams({
      q: text,
      langpair: `${fromLang}|${toLang}`
    });

    const url = `${MYMEMORY_API_URL}?${params.toString()}`;

    // API call
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Verify response
    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails || 'API error');
    }

    // Prepare result
    const result = {
      success: true,
      originalText: text,
      translation: data.responseData.translatedText,
      confidence: parseFloat(data.responseData.match || 0),
      fromLang,
      toLang,
      alternatives: [],
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'MyMemory'
      }
    };

    // Add alternative translations (if available)
    if (data.matches && Array.isArray(data.matches)) {
      result.alternatives = data.matches
        .filter(m => m.translation !== result.translation)
        .slice(0, 3)
        .map(m => ({
          text: m.translation,
          confidence: parseFloat(m.match || 0),
          source: m.reference || 'Community'
        }));
    }

    // Save to cache
    translationCache.set(cacheKey, result);

    // Limit cache size (max 100 items)
    if (translationCache.size > 100) {
      const firstKey = translationCache.keys().next().value;
      translationCache.delete(firstKey);
    }

    console.log('🌐 Translation completed:', result.translation);

    return result;

  } catch (error) {
    console.error('❌ Translation error:', error);
    
    return {
      success: false,
      error: error.message,
      originalText: text,
      translation: null,
      alternatives: []
    };
  }
}

/**
 * Automatically detect text language
 */
export async function detectLanguage(text) {
  try {
    // MyMemory doesn't have dedicated endpoint, use heuristics
    const result = await translateText(text, 'auto', 'en');
    
    if (result.success && result.translation !== text) {
      return 'unknown';
    }
    
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'unknown';
  }
}

/**
 * Translate with automatic source language detection
 */
export async function translateAuto(text, toLang = 'it') {
  return translateText(text, 'auto', toLang);
}

/**
 * Get multiple simultaneous translations (for comparison)
 */
export async function translateMultiple(text, fromLang, toLangs) {
  try {
    const promises = toLangs.map(lang => 
      translateText(text, fromLang, lang)
    );

    const results = await Promise.all(promises);

    return {
      success: true,
      translations: results.map((r, i) => ({
        language: toLangs[i],
        translation: r.translation,
        confidence: r.confidence
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Suggest translations during typing (with debounce)
 */
let suggestionTimeout = null;

export function suggestTranslation(text, fromLang, toLang, callback, delay = 500) {
  // Cancel previous timer
  if (suggestionTimeout) {
    clearTimeout(suggestionTimeout);
  }

  // Don't suggest for very short texts
  if (text.trim().length < 3) {
    callback(null);
    return;
  }

  // Set new timer
  suggestionTimeout = setTimeout(async () => {
    const result = await translateText(text, fromLang, toLang);
    callback(result);
  }, delay);
}

/**
 * Clear translation cache
 */
export function clearCache() {
  translationCache.clear();
  console.log('🧹 Translation cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: translationCache.size,
    limit: 100
  };
}

/**
 * Convert language name to code (helper)
 */
export function getLanguageCode(languageName) {
  const name = languageName.toLowerCase();
  return LANGUAGE_CODES[name] || 'en';
}
