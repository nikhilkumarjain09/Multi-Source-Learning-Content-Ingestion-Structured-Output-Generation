import { SourceDocument } from '../shared/types';
import { getDatabase } from './db';

export function saveDocument(doc: SourceDocument): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO documents (id, filename, source_type, raw_text, metadata, ingested_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(doc.id, doc.filename, doc.sourceType, doc.rawText, JSON.stringify(doc.metadata), doc.ingestedAt);
}

export function getDocumentById(id: string): SourceDocument | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
  const row = stmt.get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    filename: row.filename,
    sourceType: row.source_type,
    rawText: row.raw_text,
    metadata: JSON.parse(row.metadata),
    ingestedAt: row.ingested_at,
  };
}
