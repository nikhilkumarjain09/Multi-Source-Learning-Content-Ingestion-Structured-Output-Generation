import fs from 'fs';
import path from 'path';
import { Parser, ParsedDocument } from '../types';

export const textTranscriptParser: Parser = {
  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.txt' || ext === '.md' || ext === '.transcript';
  },

  async parse(filePath: string): Promise<ParsedDocument> {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File not found: "${filePath}"`);
    }

    try {
      const rawText = await fs.promises.readFile(resolvedPath, 'utf-8');
      return {
        rawText,
        metadata: {
          filePath: resolvedPath,
          fileSize: (await fs.promises.stat(resolvedPath)).size,
        },
      };
    } catch (err: any) {
      throw new Error(`Failed to read transcript file "${filePath}": ${err.message}`);
    }
  },
};
