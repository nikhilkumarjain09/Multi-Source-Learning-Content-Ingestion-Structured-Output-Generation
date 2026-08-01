import { Flashcard } from '../shared/types';
import { connectDB } from './db';
import { FlashcardModel } from './models';

export async function saveFlashcards(flashcards: Flashcard[]): Promise<void> {
  if (flashcards.length === 0) return;
  await connectDB();

  const operations = flashcards.map(item => ({
    updateOne: {
      filter: { id: item.id },
      update: {
        $set: {
          id: item.id,
          conceptId: item.conceptId,
          question: item.question,
          answer: item.answer,
        },
      },
      upsert: true,
    },
  }));

  await FlashcardModel.bulkWrite(operations);
}

export async function getFlashcardsByConceptIds(conceptIds: string[]): Promise<Flashcard[]> {
  if (conceptIds.length === 0) return [];
  await connectDB();

  const rows = (await FlashcardModel.find({
    conceptId: { $in: conceptIds },
  }).lean()) as any[];

  return rows.map(row => ({
    id: row.id,
    conceptId: row.conceptId,
    question: row.question,
    answer: row.answer,
  }));
}
