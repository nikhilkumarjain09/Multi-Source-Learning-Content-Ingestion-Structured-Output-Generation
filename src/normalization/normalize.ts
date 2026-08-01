import { ParsedDocument } from '../ingestion/types';
import { SourceDocument, SourceType } from '../shared/types';

export function normalizeDocument(
  filename: string,
  sourceType: SourceType,
  parsed: ParsedDocument
): SourceDocument {
  // Placeholder implementation - pipeline logic to be added in implementation phase
  return {
    id: '',
    filename,
    sourceType,
    rawText: parsed.rawText,
    metadata: parsed.metadata,
    ingestedAt: new Date().toISOString(),
  };
}
