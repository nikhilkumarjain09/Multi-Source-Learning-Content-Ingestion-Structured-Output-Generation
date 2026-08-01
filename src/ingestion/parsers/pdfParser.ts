import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Parser, ParsedDocument } from '../types';

export const pdfParser: Parser = {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.pdf';
  },

  async parse(filePath: string): Promise<ParsedDocument> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: "${filePath}"`);
    }

    let dataBuffer: Buffer;
    try {
      dataBuffer = await fs.promises.readFile(resolvedPath);
    } catch (readErr: any) {
      throw new Error(`Failed to read PDF file "${filePath}": ${readErr.message}`);
    }

    try {
      const data = await pdfParse(dataBuffer);
      if (data && typeof data.text === 'string' && data.text.trim().length > 0) {
        return {
          rawText: data.text,
          metadata: {
            filePath: resolvedPath,
            pageCount: data.numpages || 1,
          },
        };
      }
    } catch (pdfParseErr: any) {
      // Fallback text extraction for PDF text streams
      const rawString = dataBuffer.toString('latin1');
      const matches: string[] = [];
      const regex = /\(([^)]+)\)\s*Tj/g;
      let match;
      while ((match = regex.exec(rawString)) !== null) {
        if (match[1]) {
          matches.push(match[1]);
        }
      }

      if (matches.length > 0) {
        return {
          rawText: matches.join('\n'),
          metadata: {
            filePath: resolvedPath,
            pageCount: 1,
            fallbackExtracted: true,
          },
        };
      }

      throw new Error(`Corrupted or unparseable PDF file "${filePath}": ${pdfParseErr.message}`);
    }

    return {
      rawText: '',
      metadata: { filePath: resolvedPath, pageCount: 0 },
    };
  },
};
