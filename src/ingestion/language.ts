export interface LanguageDetectionResult {
  isSupported: boolean;
  language: string;
  reason?: string;
}

/**
 * Detects whether the input text contains non-English scripts.
 * Checks character frequency for non-Latin script ranges (CJK, Cyrillic, Arabic, Devanagari, Hebrew, Thai, etc.).
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return { isSupported: true, language: 'en' };
  }

  // Count non-Latin script characters
  const nonLatinRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FAF\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u0590-\u05FF\u0E00-\u0E7F]/g;
  const matches = text.match(nonLatinRegex);

  if (matches) {
    const nonLatinRatio = matches.length / text.length;
    if (nonLatinRatio > 0.15 || matches.length > 50) {
      return {
        isSupported: false,
        language: 'non-english',
        reason: `Unsupported language: Non-English content detected (${matches.length} non-Latin characters found). The system currently supports English documents.`,
      };
    }
  }

  return { isSupported: true, language: 'en' };
}
