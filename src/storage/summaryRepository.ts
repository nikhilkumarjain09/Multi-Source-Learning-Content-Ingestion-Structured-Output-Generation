import { Summary } from '../shared/types';
import { getDatabase } from './db';

export function saveSummary(summary: Summary): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO summaries (id, document_id, summary_text)
    VALUES (?, ?, ?)
  `);
  stmt.run(summary.id, summary.documentId, summary.summaryText);
}

export function getSummaryByDocumentId(documentId: string): Summary | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM summaries WHERE document_id = ?');
  const row = stmt.get(documentId) as any;
  if (!row) return null;

  return {
    id: row.id,
    documentId: row.document_id,
    summaryText: row.summary_text,
  };
}
