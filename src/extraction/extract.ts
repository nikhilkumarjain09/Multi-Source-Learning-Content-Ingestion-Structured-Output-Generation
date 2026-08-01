import { SourceDocument } from '../normalization/normalize';
import { ExtractionResult } from '../validation/schema';
import { chunkText } from './chunk';
import { buildExtractionPrompt } from './prompts/extractConcepts.prompt';
import { getLLMProvider } from './providers';
import { reconcileMultiChunkExtractions } from './mergeChunks';
import { validateAndRepairExtraction } from '../validation/validateExtraction';

/**
 * Extracts concepts, relationships, and summary from a normalized SourceDocument.
 * Handles text chunking for long documents, invokes LLM provider abstraction,
 * validates raw outputs against Zod schema with retry-once repair logic,
 * and performs second-pass LLM concept reconciliation across chunk boundaries.
 */
export async function extractConceptsFromDocument(doc: SourceDocument): Promise<ExtractionResult> {
  const chunks = chunkText(doc.rawText);
  const provider = getLLMProvider();

  const chunkResults: ExtractionResult[] = [];

  for (const chunk of chunks) {
    const { prompt, systemPrompt } = buildExtractionPrompt(chunk);
    const result = await validateAndRepairExtraction(prompt, systemPrompt, provider);
    chunkResults.push(result);
  }

  if (chunkResults.length > 1) {
    return await reconcileMultiChunkExtractions(chunkResults, provider);
  }

  return chunkResults[0] || { concepts: [], relationships: [], summary: '' };
}
