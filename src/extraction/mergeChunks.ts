import { ExtractionResult, RawExtractedConcept, RawExtractedRelationship } from '../shared/types';

/**
 * Merges extraction results across multiple text chunks.
 * Deduplicates concepts by normalized (lowercased, trimmed) concept name.
 */
export function mergeChunkExtractions(results: ExtractionResult[]): ExtractionResult {
  if (results.length === 0) {
    return { concepts: [], relationships: [], summary: '' };
  }
  if (results.length === 1) {
    return results[0];
  }

  const conceptMap = new Map<string, RawExtractedConcept>();
  const conceptNameLookup = new Map<string, string>(); // normalized -> canonical original casing

  for (const res of results) {
    if (!res.concepts) continue;
    for (const concept of res.concepts) {
      if (!concept.name) continue;
      const normalizedKey = concept.name.trim().toLowerCase();
      if (!conceptMap.has(normalizedKey)) {
        conceptMap.set(normalizedKey, {
          name: concept.name.trim(),
          description: concept.description ? concept.description.trim() : '',
        });
        conceptNameLookup.set(normalizedKey, concept.name.trim());
      } else {
        // Append extra details to description if not already present
        const existing = conceptMap.get(normalizedKey)!;
        if (concept.description && !existing.description.includes(concept.description.trim())) {
          existing.description = `${existing.description} ${concept.description.trim()}`.trim();
        }
      }
    }
  }

  // Merge relationships
  const relationshipSet = new Set<string>();
  const mergedRelationships: RawExtractedRelationship[] = [];

  for (const res of results) {
    if (!res.relationships) continue;
    for (const rel of res.relationships) {
      if (!rel.from || !rel.to) continue;

      const fromNormalized = rel.from.trim().toLowerCase();
      const toNormalized = rel.to.trim().toLowerCase();

      // Ensure both from and to concepts exist in extracted concepts map
      const canonicalFrom = conceptNameLookup.get(fromNormalized) || rel.from.trim();
      const canonicalTo = conceptNameLookup.get(toNormalized) || rel.to.trim();

      const key = `${fromNormalized}->${rel.type}->${toNormalized}`;
      if (!relationshipSet.has(key)) {
        relationshipSet.add(key);
        mergedRelationships.push({
          from: canonicalFrom,
          to: canonicalTo,
          type: rel.type,
        });
      }
    }
  }

  // Combine summaries
  const summaries = results
    .map(r => r.summary ? r.summary.trim() : '')
    .filter(s => s.length > 0);
  const mergedSummary = summaries.join('\n\n');

  return {
    concepts: Array.from(conceptMap.values()),
    relationships: mergedRelationships,
    summary: mergedSummary,
  };
}
