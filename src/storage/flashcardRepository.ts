import { Flashcard } from '../shared/types';
import { getDatabase } from './db';

export function saveFlashcards(flashcards: Flashcard[]): void {
  if (flashcards.length === 0) return;
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO flashcards (id, concept_id, question, answer)
    VALUES (?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items: Flashcard[]) => {
    for (const item of items) {
      stmt.run(item.id, item.conceptId, item.question, item.answer);
    }
  });
  insertMany(flashcards);
}

export function getFlashcardsByConceptIds(conceptIds: string[]): Flashcard[] {
  if (conceptIds.length === 0) return [];
  const db = getDatabase();
  const placeholders = conceptIds.map(() => '?').join(',');
  const stmt = db.prepare(`SELECT * FROM flashcards WHERE concept_id IN (${placeholders})`);
  const rows = stmt.all(...conceptIds) as any[];

  return rows.map(row => ({
    id: row.id,
    conceptId: row.concept_id,
    question: row.question,
    answer: row.answer,
  }));
}
