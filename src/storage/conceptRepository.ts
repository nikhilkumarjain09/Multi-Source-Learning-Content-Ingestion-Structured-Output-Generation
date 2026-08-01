import { Concept } from '../shared/types';
import { getDatabase } from './db';

export { Concept };

export function saveConcepts(concepts: Concept[]): void {
  if (concepts.length === 0) return;
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO concepts (id, document_id, name, description, canonical_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items: Concept[]) => {
    for (const item of items) {
      const canonicalName = item.name.trim().toLowerCase();
      stmt.run(item.id, item.documentId, item.name, item.description, canonicalName);
    }
  });
  insertMany(concepts);
}

/**
 * Links a concept to a document in the concept_documents junction table.
 */
export function linkConceptToDocument(conceptId: string, documentId: string): void {
  const db = getDatabase();
  db.prepare(`
    INSERT OR IGNORE INTO concept_documents (concept_id, document_id)
    VALUES (?, ?)
  `).run(conceptId, documentId);
}

/**
 * Finds an existing concept by exact canonical (lowercased) name match.
 * Returns the first match or null if no existing concept with that name.
 */
export function findConceptByCanonicalName(canonicalName: string): Concept | null {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT * FROM concepts WHERE canonical_name = ? LIMIT 1'
  ).get(canonicalName) as any;

  if (!row) return null;

  return {
    id: row.id,
    documentId: row.document_id,
    name: row.name,
    description: row.description,
  };
}

/**
 * Updates an existing concept's description if the new one is longer/better.
 */
export function updateConceptDescription(conceptId: string, description: string): void {
  const db = getDatabase();
  db.prepare(
    'UPDATE concepts SET description = ? WHERE id = ? AND LENGTH(description) < LENGTH(?)'
  ).run(description, conceptId, description);
}

/**
 * Returns all document IDs linked to a concept via the junction table.
 */
export function getDocumentIdsForConcept(conceptId: string): string[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT document_id FROM concept_documents WHERE concept_id = ?'
  ).all(conceptId) as any[];
  return rows.map(r => r.document_id);
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
