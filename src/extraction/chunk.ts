import { CONFIG } from '../shared/config';

/**
 * Splits text into chunks if it exceeds max character/token threshold from config.
 */
export function chunkText(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const maxChars = CONFIG.CHUNK.MAX_CHARACTERS;
  const overlap = CONFIG.CHUNK.OVERLAP_CHARACTERS;

  if (text.length <= maxChars) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChars;

    if (endIndex < text.length) {
      // Try to break at paragraph or newline boundary to preserve context
      const lastNewline = text.lastIndexOf('\n', endIndex);
      if (lastNewline > startIndex + maxChars * 0.5) {
        endIndex = lastNewline + 1;
      }
    } else {
      endIndex = text.length;
    }

    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (endIndex >= text.length) {
      break;
    }

    startIndex = endIndex - overlap;
  }

  return chunks;
}
