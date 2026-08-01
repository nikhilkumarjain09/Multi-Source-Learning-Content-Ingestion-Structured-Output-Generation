import { getParserForFile } from './ingestion/registry';
import { normalizeDocument } from './normalization/normalize';
import { extractConceptsFromDocument } from './extraction/extract';
import { SourceDocument, ExtractionResult } from './shared/types';

export interface IngestionPipelineResult {
  document: SourceDocument;
  extraction: ExtractionResult;
}

/**
 * Runs the ingestion pipeline: parser selection -> parsing -> normalization -> concept extraction.
 */
export async function runIngestionPipeline(filePath: string): Promise<IngestionPipelineResult> {
  if (!filePath) {
    throw new Error('File path must be provided to runIngestionPipeline');
  }

  const parser = getParserForFile(filePath);
  const parsed = await parser.parse(filePath);
  const normalizedDoc = normalizeDocument(filePath, parsed);
  const extractionResult = await extractConceptsFromDocument(normalizedDoc);

  return {
    document: normalizedDoc,
    extraction: extractionResult,
  };
}
