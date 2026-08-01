import { Parser } from './types';
import { pdfParser } from './parsers/pdfParser';
import { textTranscriptParser } from './parsers/textTranscriptParser';
import { videoParser } from './parsers/videoParser';

const parsers: Parser[] = [
  pdfParser,
  textTranscriptParser,
  videoParser,
];

export function getParserForFile(filePath: string): Parser {
  const parser = parsers.find(p => p.supports(filePath));
  if (!parser) {
    throw new Error(`Unsupported file type for file: ${filePath}`);
  }
  return parser;
}
