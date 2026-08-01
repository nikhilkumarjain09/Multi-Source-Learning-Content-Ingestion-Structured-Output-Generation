import { SourceDocument, ExtractionResult } from '../shared/types';
import { getLLMProvider } from './providers';
import { buildExtractConceptsPrompt, EXTRACT_CONCEPTS_SYSTEM_PROMPT } from './prompts/extractConcepts.prompt';
import { chunkText } from './chunk';
import { mergeChunkExtractions } from './mergeChunks';
import { validateAndRepairExtraction } from '../validation/validateExtraction';

/**
 * Extracts concepts, relationships, and summary from a SourceDocument with schema validation and repair retry logic.
 */
export async function extractConceptsFromDocument(doc: SourceDocument): Promise<ExtractionResult> {
  const provider = getLLMProvider();
  const chunks = chunkText(doc.rawText);

  if (chunks.length === 0) {
    return { concepts: [], relationships: [], summary: 'Empty document content.' };
  }

  const chunkResults: ExtractionResult[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkTextContent = chunks[i];
    const userPrompt = buildExtractConceptsPrompt(chunkTextContent);

    const rawResponse = await provider.complete(userPrompt, EXTRACT_CONCEPTS_SYSTEM_PROMPT);
    const validatedResult = await validateAndRepairExtraction(rawResponse, userPrompt, provider);

    chunkResults.push(validatedResult);
  }

  return mergeChunkExtractions(chunkResults);
}
