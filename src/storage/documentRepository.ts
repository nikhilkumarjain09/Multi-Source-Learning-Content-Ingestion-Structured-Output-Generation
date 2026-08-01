import { SourceDocument } from '../shared/types';
import { connectDB } from './db';
import { DocumentModel } from './models';

export async function saveDocument(doc: SourceDocument): Promise<void> {
  await connectDB();
  await DocumentModel.findOneAndUpdate(
    { id: doc.id },
    {
      id: doc.id,
      filename: doc.filename,
      sourceType: doc.sourceType,
      rawText: doc.rawText,
      metadata: doc.metadata,
      ingestedAt: doc.ingestedAt,
    },
    { upsert: true, new: true }
  );
}

export async function getDocumentById(id: string): Promise<SourceDocument | null> {
  await connectDB();
  const row = (await DocumentModel.findOne({ id }).lean()) as any;
  if (!row) return null;

  return {
    id: row.id,
    filename: row.filename,
    sourceType: row.sourceType,
    rawText: row.rawText,
    metadata: (row.metadata || {}) as Record<string, unknown>,
    ingestedAt: row.ingestedAt,
  };
}
