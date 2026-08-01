import path from 'path';
import { Parser, ParsedDocument } from '../types';

export const textTranscriptParser: Parser = {
  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.txt' || ext === '.md' || ext === '.transcript';
  },

  async parse(filePath: string): Promise<ParsedDocument> {
    // Placeholder implementation - pipeline logic to be added in implementation phase
    return {
      rawText: '',
      metadata: { filePath },
    };
  },
};
