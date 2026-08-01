import { v4 as uuidv4 } from 'uuid';
import { getParserForFile } from '../ingestion/registry';
import { detectLanguage } from '../ingestion/language';

export interface SourceDocument {
  id: string;
  filename: string;
  sourceType: 'pdf' | 'transcript';
  rawText: string;
  metadata: Record<string, any>;
  ingestedAt: string;
}

/**
 * Normalizes a raw input file into a canonical SourceDocument format.
 * Inspects file extension, selects parser, extracts raw text, and verifies language support.
 */
export async function normalizeDocument(filePath: string): Promise<SourceDocument> {
  const parser = getParserForFile(filePath);
  const parsed = await parser.parse(filePath);

  const langCheck = detectLanguage(parsed.rawText);
  if (!langCheck.isSupported) {
    throw new Error(langCheck.reason || 'Unsupported non-English content.');
  }

  const sourceType = parser.supports(filePath) && filePath.toLowerCase().endsWith('.pdf')
    ? 'pdf'
    : 'transcript';

  return {
    id: uuidv4(),
    filename: filePath.split(/[/\\]/).pop() || filePath,
    sourceType,
    rawText: parsed.rawText,
    metadata: parsed.metadata || {},
    ingestedAt: new Date().toISOString(),
  };
}
