import { v4 as uuidv4 } from 'uuid';
import { RawExtractedConcept } from '../shared/types';

export interface GeneratedFlashcard {
  id: string;
  conceptName?: string;
  question: string;
  answer: string;
}

export type Flashcard = GeneratedFlashcard;

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
export function exportFlashcardsJSON(flashcards: any[]): string {
  return JSON.stringify(flashcards, null, 2);
}

/**
 * Serializes flashcards to CSV format.
 */
export function exportFlashcardsCSV(flashcards: any[]): string {
  const headers = ['Concept', 'Question', 'Answer'];
  const rows = flashcards.map(f => [
    `"${(f.conceptName || '').replace(/"/g, '""')}"`,
    `"${(f.question || '').replace(/"/g, '""')}"`,
    `"${(f.answer || '').replace(/"/g, '""')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
