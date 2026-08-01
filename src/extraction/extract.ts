import { SourceDocument, ExtractionResult } from '../shared/types';
import { getLLMProvider } from './providers';
import { buildExtractConceptsPrompt, EXTRACT_CONCEPTS_SYSTEM_PROMPT } from './prompts/extractConcepts.prompt';
import { chunkText } from './chunk';
import { mergeChunkExtractions } from './mergeChunks';

/**
 * Clean LLM response markdown formatting if present.
 */
function cleanJsonOutput(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
  }
  return cleaned;
}

/**
 * Extracts concepts, relationships, and summary from a SourceDocument.
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

    try {
      const rawResponse = await provider.complete(userPrompt, EXTRACT_CONCEPTS_SYSTEM_PROMPT);
      const cleanedJsonText = cleanJsonOutput(rawResponse);

      try {
        const parsedData = JSON.parse(cleanedJsonText) as ExtractionResult;
        chunkResults.push({
          concepts: parsedData.concepts || [],
          relationships: parsedData.relationships || [],
          summary: parsedData.summary || '',
        });
      } catch (parseError: any) {
        console.error(`Failed to parse LLM JSON response for chunk ${i + 1}/${chunks.length}:`, parseError.message);
        console.error('Raw LLM output was:', rawResponse);
        throw new Error(`LLM JSON parse error on chunk ${i + 1}: ${parseError.message}`);
      }
    } catch (llmError: any) {
      console.error(`Extraction failed on chunk ${i + 1}/${chunks.length}:`, llmError.message);
      throw llmError;
    }
  }

  return mergeChunkExtractions(chunkResults);
}
