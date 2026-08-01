import { Concept } from '../shared/types';
import { getDatabase } from './db';

export { Concept };

export function saveConcepts(concepts: Concept[]): void {
  if (concepts.length === 0) return;
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO concepts (id, document_id, name, description)
    VALUES (?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items: Concept[]) => {
    for (const item of items) {
      stmt.run(item.id, item.documentId, item.name, item.description);
    }
  });
  insertMany(concepts);
}

export function getConceptsByDocumentId(documentId: string): Concept[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM concepts WHERE document_id = ?').all(documentId) as any[];
  return rows.map(r => ({
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    description: r.description,
  }));
}

export function getConceptsByName(name: string): Concept[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM concepts WHERE LOWER(name) = LOWER(?)').all(name) as any[];
  return rows.map(r => ({
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    description: r.description,
  }));
}

export function searchConceptsByName(query: string): Concept[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT * FROM concepts WHERE LOWER(name) LIKE LOWER(?)').all(`%${query}%`) as any[];
  return rows.map(r => ({
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    description: r.description,
  }));
}

export function getConceptsByIds(ids: string[]): Concept[] {
  if (ids.length === 0) return [];
  const db = getDatabase();
  const placeholders = ids.map(() => '?').join(',');
  const rows = db.prepare(`SELECT * FROM concepts WHERE id IN (${placeholders})`).all(...ids) as any[];
  return rows.map(r => ({
    id: r.id,
    documentId: r.document_id,
    name: r.name,
    description: r.description,
  }));
}

export function getAllConceptNames(): string[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT DISTINCT name FROM concepts ORDER BY name ASC').all() as any[];
  return rows.map(r => r.name);
}
