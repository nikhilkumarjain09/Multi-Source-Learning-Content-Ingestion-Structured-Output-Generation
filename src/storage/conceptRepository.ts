import { Concept } from '../shared/types';
import { connectDB } from './db';
import { ConceptModel } from './models';

export { Concept };

function mapConcept(row: any): Concept {
  return {
    id: row.id,
    documentId: row.documentId,
    name: row.name,
    description: row.description,
  };
}

export async function saveConcepts(concepts: Concept[]): Promise<void> {
  if (concepts.length === 0) return;
  await connectDB();

  const operations = concepts.map(item => {
    const canonicalName = item.name.trim().toLowerCase();
    return {
      updateOne: {
        filter: { id: item.id },
        update: {
          $set: {
            id: item.id,
            documentId: item.documentId,
            name: item.name,
            canonicalName,
            description: item.description,
          },
          $addToSet: { documentIds: item.documentId },
        },
        upsert: true,
      },
    };
  });

  await ConceptModel.bulkWrite(operations);
}

/**
 * Links a concept to a document via documentIds array.
 */
export async function linkConceptToDocument(conceptId: string, documentId: string): Promise<void> {
  await connectDB();
  await ConceptModel.updateOne(
    { id: conceptId },
    { $addToSet: { documentIds: documentId } }
  );
}

/**
 * Finds an existing concept by exact canonical (lowercased) name match.
 * Returns the first match or null if no existing concept with that name.
 */
export async function findConceptByCanonicalName(canonicalName: string): Promise<Concept | null> {
  await connectDB();
  const row = (await ConceptModel.findOne({ canonicalName: canonicalName.trim().toLowerCase() }).lean()) as any;
  if (!row) return null;
  return mapConcept(row);
}

/**
 * Updates an existing concept's description if the new one is longer/better.
 */
export async function updateConceptDescription(conceptId: string, description: string): Promise<void> {
  await connectDB();
  const concept = (await ConceptModel.findOne({ id: conceptId }).lean()) as any;
  if (concept && description.length > (concept.description || '').length) {
    await ConceptModel.updateOne({ id: conceptId }, { $set: { description } });
  }
}

/**
 * Returns all document IDs linked to a concept.
 */
export async function getDocumentIdsForConcept(conceptId: string): Promise<string[]> {
  await connectDB();
  const row = (await ConceptModel.findOne({ id: conceptId }).lean()) as any;
  if (!row) return [];
  const ids = new Set<string>();
  if (row.documentId) ids.add(row.documentId);
  if (Array.isArray(row.documentIds)) {
    row.documentIds.forEach((id: string) => ids.add(id));
  }
  return Array.from(ids);
}

export async function getConceptsByDocumentId(documentId: string): Promise<Concept[]> {
  await connectDB();
  const rows = (await ConceptModel.find({
    $or: [{ documentId }, { documentIds: documentId }],
  }).lean()) as any[];
  return rows.map(mapConcept);
}

export async function getConceptsByName(name: string): Promise<Concept[]> {
  await connectDB();
  const canonical = name.trim().toLowerCase();
  const rows = (await ConceptModel.find({ canonicalName: canonical }).lean()) as any[];
  return rows.map(mapConcept);
}

export async function searchConceptsByName(query: string): Promise<Concept[]> {
  await connectDB();
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rows = (await ConceptModel.find({
    $or: [
      { name: { $regex: escapedQuery, $options: 'i' } },
      { canonicalName: { $regex: query.trim().toLowerCase(), $options: 'i' } },
    ],
  }).lean()) as any[];
  return rows.map(mapConcept);
}

export async function getConceptsByIds(ids: string[]): Promise<Concept[]> {
  if (ids.length === 0) return [];
  await connectDB();
  const rows = (await ConceptModel.find({ id: { $in: ids } }).lean()) as any[];
  return rows.map(mapConcept);
}

export async function getAllConceptNames(): Promise<string[]> {
  await connectDB();
  const names = await ConceptModel.distinct('name');
  return names.sort((a, b) => a.localeCompare(b));
}
