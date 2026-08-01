import { getDatabase } from './db';

export interface ConceptEmbedding {
  conceptId: string;
  embedding: number[];
}

export function saveConceptEmbedding(conceptId: string, embedding: number[]): void {
  const db = getDatabase();
  const serialized = JSON.stringify(embedding);
  db.prepare(`
    INSERT OR REPLACE INTO concept_embeddings (concept_id, embedding)
    VALUES (?, ?)
  `).run(conceptId, serialized);
}

export function saveConceptEmbeddings(entries: ConceptEmbedding[]): void {
  if (entries.length === 0) return;
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO concept_embeddings (concept_id, embedding)
    VALUES (?, ?)
  `);
  const insertMany = db.transaction((items: ConceptEmbedding[]) => {
    for (const item of items) {
      stmt.run(item.conceptId, JSON.stringify(item.embedding));
    }
  });
  insertMany(entries);
}

export function getConceptEmbedding(conceptId: string): ConceptEmbedding | null {
  const db = getDatabase();
  const row = db.prepare(
    'SELECT concept_id, embedding FROM concept_embeddings WHERE concept_id = ?'
  ).get(conceptId) as any;

  if (!row) return null;

  return {
    conceptId: row.concept_id,
    embedding: JSON.parse(row.embedding),
  };
}

export function getAllConceptEmbeddings(): ConceptEmbedding[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT concept_id, embedding FROM concept_embeddings').all() as any[];
  return rows.map(r => ({
    conceptId: r.concept_id,
    embedding: JSON.parse(r.embedding),
  }));
}
