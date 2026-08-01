import { Relationship } from '../shared/types';
import { connectDB } from './db';
import { RelationshipModel } from './models';

export { Relationship };

export async function saveRelationships(relationships: Relationship[]): Promise<void> {
  if (relationships.length === 0) return;
  await connectDB();

  const operations = relationships.map(item => ({
    updateOne: {
      filter: { id: item.id },
      update: {
        $set: {
          id: item.id,
          fromConceptId: item.fromConceptId,
          toConceptId: item.toConceptId,
          type: item.type,
        },
      },
      upsert: true,
    },
  }));

  await RelationshipModel.bulkWrite(operations);
}

export async function getRelationshipsForConceptIds(conceptIds: string[]): Promise<Relationship[]> {
  if (conceptIds.length === 0) return [];
  await connectDB();

  const rows = (await RelationshipModel.find({
    $or: [{ fromConceptId: { $in: conceptIds } }, { toConceptId: { $in: conceptIds } }],
  }).lean()) as any[];

  return rows.map(r => ({
    id: r.id,
    fromConceptId: r.fromConceptId,
    toConceptId: r.toConceptId,
    type: r.type,
  }));
}
