import { Flashcard } from '../shared/types';

export function exportFlashcardsJSON(flashcards: Flashcard[]): string {
  return JSON.stringify(flashcards, null, 2);
}

export function exportFlashcardsCSV(flashcards: Flashcard[]): string {
  const headers = ['id', 'conceptId', 'question', 'answer'];
  const rows = flashcards.map(f => [
    `"${f.id}"`,
    `"${f.conceptId}"`,
    `"${f.question.replace(/"/g, '""')}"`,
    `"${f.answer.replace(/"/g, '""')}"`,
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
