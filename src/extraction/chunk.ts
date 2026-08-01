import { CONFIG } from '../shared/config';

export function chunkText(text: string): string[] {
  if (text.length <= CONFIG.CHUNK.MAX_CHARACTERS) {
    return [text];
  }
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + CONFIG.CHUNK.MAX_CHARACTERS, text.length);
    chunks.push(text.slice(startIndex, endIndex));
    startIndex += CONFIG.CHUNK.MAX_CHARACTERS - CONFIG.CHUNK.OVERLAP_CHARACTERS;
  }
  return chunks;
}
