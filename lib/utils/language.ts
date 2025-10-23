import { francAll } from 'franc-min';

/**
 * Detects the language of a text sample
 * Returns ISO 639-1 language code (es, en, fr, pt, etc.)
 */
export function detectLanguage(text: string): string {
  // Combine all text if it's an array
  const sample = Array.isArray(text) ? text.join(' ') : text;

  // Remove empty strings and get a good sample
  const cleanSample = sample.trim();

  if (cleanSample.length < 10) {
    return 'es'; // Default to Spanish for short texts
  }

  const detected = francAll(cleanSample, { minLength: 3 });

  // franc-min returns ISO 639-3 codes, we need to map to ISO 639-1
  const languageMap: Record<string, string> = {
    'spa': 'es',  // Spanish
    'eng': 'en',  // English
    'fra': 'fr',  // French
    'por': 'pt',  // Portuguese
    'ita': 'it',  // Italian
    'deu': 'de',  // German
    'und': 'es',  // Undetermined -> default to Spanish
  };

  const topLanguage = detected[0]?.[0] || 'spa';
  return languageMap[topLanguage] || 'es';
}

/**
 * Get language name in Spanish
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'es': 'Español',
    'en': 'Inglés',
    'fr': 'Francés',
    'pt': 'Portugués',
    'it': 'Italiano',
    'de': 'Alemán',
  };
  return names[code] || 'Español';
}
