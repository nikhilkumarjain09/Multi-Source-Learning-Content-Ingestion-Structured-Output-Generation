import { ExtractionResult } from '../validation/schema';
import { LLMProvider } from './providers';
import { buildReconcileChunksPrompt } from './prompts/extractConcepts.prompt';
import { validateAndRepairExtraction } from '../validation/validateExtraction';

/**
 * Deduplicates and merges concepts and relationships across chunks deterministically.
 */
export function mergeChunkExtractions(results: ExtractionResult[]): ExtractionResult {
  if (results.length === 0) {
    return { concepts: [], relationships: [], summary: '' };
  }

  if (results.length === 1) {
    return results[0];
  }

  const conceptMap = new Map<string, { name: string; description: string }>();

  for (const res of results) {
    for (const concept of res.concepts) {
      const normalizedKey = concept.name.trim().toLowerCase();

      if (!conceptMap.has(normalizedKey)) {
        conceptMap.set(normalizedKey, {
          name: concept.name.trim(),
          description: concept.description.trim(),
        });
      } else {
        const existing = conceptMap.get(normalizedKey)!;
        if (concept.description.length > existing.description.length) {
          existing.description = concept.description.trim();
        }
      }
    }
  }

  const mergedConcepts = Array.from(conceptMap.values());
  const validConceptNames = new Set(mergedConcepts.map(c => c.name.toLowerCase()));

  const relationshipSet = new Set<string>();
  const mergedRelationships: ExtractionResult['relationships'] = [];

  for (const res of results) {
    for (const rel of res.relationships) {
      const fromLower = rel.from.trim().toLowerCase();
      const toLower = rel.to.trim().toLowerCase();

      if (validConceptNames.has(fromLower) && validConceptNames.has(toLower) && fromLower !== toLower) {
        const relKey = `${fromLower}|${toLower}|${rel.type}`;
        if (!relationshipSet.has(relKey)) {
          relationshipSet.add(relKey);

          const fromName = mergedConcepts.find(c => c.name.toLowerCase() === fromLower)?.name || rel.from;
          const toName = mergedConcepts.find(c => c.name.toLowerCase() === toLower)?.name || rel.to;

          mergedRelationships.push({
            from: fromName,
            to: toName,
            type: rel.type,
          });
        }
      }
    }
  }

  const summaries = results.map(r => r.summary).filter(s => s && s.trim().length > 0);
  const mergedSummary = summaries.join(' ');

  return {
    concepts: mergedConcepts,
    relationships: mergedRelationships,
    summary: mergedSummary,
  };
}

/**
 * Reconciles concept extractions across chunk boundaries using a second-pass LLM call.
 * Reconciles synonymous concepts, merges descriptions, and deduplicates relationships.
 * Falls back to deterministic merge if second-pass LLM call fails.
 */
export async function reconcileMultiChunkExtractions(
  results: ExtractionResult[],
  provider: LLMProvider
): Promise<ExtractionResult> {
  if (results.length <= 1) {
    return mergeChunkExtractions(results);
  }

  try {
    const { prompt, systemPrompt } = buildReconcileChunksPrompt(results);
    const reconciled = await validateAndRepairExtraction(prompt, systemPrompt, provider);
    return reconciled;
  } catch (err: any) {
    console.warn('Second-pass LLM concept reconciliation failed. Falling back to deterministic merge:', err.message);
    return mergeChunkExtractions(results);
  }
}
