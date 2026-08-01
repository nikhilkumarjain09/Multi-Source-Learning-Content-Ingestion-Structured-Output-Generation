import path from 'path';
import { Parser, ParsedDocument } from '../types';

export const pdfParser: Parser = {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.pdf';
  },

  async parse(filePath: string): Promise<ParsedDocument> {
    // Placeholder implementation - pipeline logic to be added in implementation phase
    return {
      rawText: '',
      metadata: { filePath, pageCount: 0 },
    };
  },
};
