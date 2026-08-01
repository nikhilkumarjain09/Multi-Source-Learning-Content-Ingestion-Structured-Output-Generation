import { getParserForFile } from './ingestion/registry';
import { normalizeDocument } from './normalization/normalize';
import { SourceDocument } from './shared/types';

/**
 * Runs the initial ingestion pipeline: parser selection -> parsing -> normalization.
 * Stops after returning the canonical SourceDocument shape.
 */
export async function runIngestionPipeline(filePath: string): Promise<SourceDocument> {
  if (!filePath) {
    throw new Error('File path must be provided to runIngestionPipeline');
  }

  const parser = getParserForFile(filePath);
  const parsed = await parser.parse(filePath);
  const normalizedDoc = normalizeDocument(filePath, parsed);

  return normalizedDoc;
}
