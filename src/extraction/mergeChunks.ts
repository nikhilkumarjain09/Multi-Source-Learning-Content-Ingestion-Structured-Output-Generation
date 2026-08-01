import { ExtractionResult } from '../shared/types';

export function mergeChunkExtractions(results: ExtractionResult[]): ExtractionResult {
  if (results.length === 0) {
    return { concepts: [], relationships: [], summary: '' };
  }
  if (results.length === 1) {
    return results[0];
  }

  // Deduplicate concepts by normalized name
  const conceptMap = new Map<string, { name: string; description: string }>();
  for (const res of results) {
    for (const concept of res.concepts) {
      const key = concept.name.trim().toLowerCase();
      if (!conceptMap.has(key)) {
        conceptMap.set(key, concept);
      }
    }
  }

  const mergedRelationships = results.flatMap(r => r.relationships);
  const mergedSummary = results.map(r => r.summary).filter(Boolean).join('\n\n');

  return {
    concepts: Array.from(conceptMap.values()),
    relationships: mergedRelationships,
    summary: mergedSummary,
  };
}
