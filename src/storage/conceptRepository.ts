import { Concept } from '../shared/types';
import { getDatabase } from './db';

export function saveConcepts(concepts: Concept[]): void {
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

export function getConceptsByName(name: string): Concept[] {
  const db = getDatabase();
  const normalized = name.trim().toLowerCase();
  const stmt = db.prepare('SELECT * FROM concepts WHERE LOWER(name) = ?');
  const rows = stmt.all(normalized) as any[];

  return rows.map(row => ({
    id: row.id,
    documentId: row.document_id,
    name: row.name,
    description: row.description,
  }));
}

export function getAllConceptNames(): string[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT DISTINCT name FROM concepts ORDER BY name ASC');
  const rows = stmt.all() as { name: string }[];
  return rows.map(row => row.name);
}
