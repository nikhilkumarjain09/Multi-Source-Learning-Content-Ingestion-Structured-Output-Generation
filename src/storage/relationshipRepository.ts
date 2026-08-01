import { Relationship } from '../shared/types';
import { getDatabase } from './db';

export function saveRelationships(relationships: Relationship[]): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO relationships (id, from_concept_id, to_concept_id, type)
    VALUES (?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items: Relationship[]) => {
    for (const item of items) {
      stmt.run(item.id, item.fromConceptId, item.toConceptId, item.type);
    }
  });
  insertMany(relationships);
}

export function getRelationshipsForConceptIds(conceptIds: string[]): Relationship[] {
  if (conceptIds.length === 0) return [];
  const db = getDatabase();
  const placeholders = conceptIds.map(() => '?').join(',');
  const stmt = db.prepare(`
    SELECT * FROM relationships
    WHERE from_concept_id IN (${placeholders}) OR to_concept_id IN (${placeholders})
  `);
  const rows = stmt.all(...conceptIds, ...conceptIds) as any[];

  return rows.map(row => ({
    id: row.id,
    fromConceptId: row.from_concept_id,
    toConceptId: row.to_concept_id,
    type: row.type,
  }));
}
