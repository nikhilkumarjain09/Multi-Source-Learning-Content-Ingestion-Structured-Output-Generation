import { Summary } from '../shared/types';
import { connectDB } from './db';
import { SummaryModel } from './models';

export async function saveSummary(summary: Summary): Promise<void> {
  await connectDB();
  await SummaryModel.findOneAndUpdate(
    { id: summary.id },
    {
      id: summary.id,
      documentId: summary.documentId,
      summaryText: summary.summaryText,
    },
    { upsert: true, new: true }
  );
}

export async function getSummaryByDocumentId(documentId: string): Promise<Summary | null> {
  await connectDB();
  const row = (await SummaryModel.findOne({ documentId }).lean()) as any;
  if (!row) return null;

  return {
    id: row.id,
    documentId: row.documentId,
    summaryText: row.summaryText,
  };
}
