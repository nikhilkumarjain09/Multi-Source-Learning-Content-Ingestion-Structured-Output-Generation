import { Relationship } from '../shared/types';
import { getDatabase } from './db';

export { Relationship };

export function saveRelationships(relationships: Relationship[]): void {
  if (relationships.length === 0) return;
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
  const sql = `
    SELECT * FROM relationships
    WHERE from_concept_id IN (${placeholders}) OR to_concept_id IN (${placeholders})
  `;
  const rows = db.prepare(sql).all(...conceptIds, ...conceptIds) as any[];

  return rows.map(r => ({
    id: r.id,
    fromConceptId: r.from_concept_id,
    toConceptId: r.to_concept_id,
    type: r.type,
  }));
}
