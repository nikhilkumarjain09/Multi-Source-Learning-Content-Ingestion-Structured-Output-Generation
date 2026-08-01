export interface ParsedDocument {
  rawText: string;
  metadata: Record<string, unknown>;
}

export interface Parser {
  supports(filePath: string): boolean;
  parse(filePath: string): Promise<ParsedDocument>;
}
