import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ParsedDocument } from '../ingestion/types';
import { SourceDocument, SourceType } from '../shared/types';

export function normalizeDocument(filePath: string, parsed: ParsedDocument): SourceDocument {
  const filename = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();

  let sourceType: SourceType = 'transcript';
  if (ext === '.pdf') {
    sourceType = 'pdf';
  }

  return {
    id: uuidv4(),
    filename,
    sourceType,
    rawText: parsed.rawText,
    metadata: {
      ...parsed.metadata,
      originalFilePath: filePath,
    },
    ingestedAt: new Date().toISOString(),
  };
}
