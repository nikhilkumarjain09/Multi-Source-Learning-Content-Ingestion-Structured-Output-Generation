import { connectDB } from './db';
import { ConceptEmbeddingModel } from './models';

export interface ConceptEmbedding {
  conceptId: string;
  embedding: number[];
}

export async function saveConceptEmbedding(conceptId: string, embedding: number[]): Promise<void> {
  await connectDB();
  await ConceptEmbeddingModel.findOneAndUpdate(
    { conceptId },
    { conceptId, embedding },
    { upsert: true, new: true }
  );
}

export async function saveConceptEmbeddings(entries: ConceptEmbedding[]): Promise<void> {
  if (entries.length === 0) return;
  await connectDB();

  const operations = entries.map(item => ({
    updateOne: {
      filter: { conceptId: item.conceptId },
      update: { $set: { conceptId: item.conceptId, embedding: item.embedding } },
      upsert: true,
    },
  }));

  await ConceptEmbeddingModel.bulkWrite(operations);
}

export async function getConceptEmbedding(conceptId: string): Promise<ConceptEmbedding | null> {
  await connectDB();
  const row = (await ConceptEmbeddingModel.findOne({ conceptId }).lean()) as any;
  if (!row) return null;

  return {
    conceptId: row.conceptId,
    embedding: row.embedding,
  };
}

export async function getAllConceptEmbeddings(): Promise<ConceptEmbedding[]> {
  await connectDB();
  const rows = (await ConceptEmbeddingModel.find().lean()) as any[];
  return rows.map(r => ({
    conceptId: r.conceptId,
    embedding: r.embedding,
  }));
}
