import { v4 as uuidv4 } from 'uuid';
import { RawExtractedConcept } from '../shared/types';

export interface GeneratedFlashcard {
  id: string;
  conceptName: string;
  question: string;
  answer: string;
}

/**
 * Generates flashcard question/answer pairs from validated concepts.
 */
export function generateFlashcardsFromConcepts(concepts: RawExtractedConcept[]): GeneratedFlashcard[] {
  return concepts.map(concept => ({
    id: uuidv4(),
    conceptName: concept.name,
    question: `What is ${concept.name}?`,
    answer: concept.description || `Key concept in the domain: ${concept.name}`,
  }));
}

/**
 * Serializes flashcards to formatted JSON string.
 */
export function exportFlashcardsJSON(flashcards: Array<{ question: string; answer: string; conceptName?: string }>): string {
  return JSON.stringify(flashcards, null, 2);
}

/**
 * Escapes a cell value for CSV output according to RFC-4180.
 */
function escapeCsvCell(value: string): string {
  return `"${(value || '').replace(/"/g, '""')}"`;
}

/**
 * Serializes flashcards to CSV format.
 */
export function exportFlashcardsCSV(flashcards: Array<{ question: string; answer: string; conceptName?: string }>): string {
  const headers = ['Concept', 'Question', 'Answer'];
  const rows = flashcards.map(f => [
    escapeCsvCell(f.conceptName || ''),
    escapeCsvCell(f.question),
    escapeCsvCell(f.answer),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
