import {
  generateFlashcardsFromConcepts,
  exportFlashcardsJSON,
  exportFlashcardsCSV,
} from '../src/outputs/flashcardExport';
import { exportConceptGraph } from '../src/outputs/graphExport';
import { RawExtractedConcept, RawExtractedRelationship } from '../src/shared/types';

function runStructuredOutputsTests() {
  console.log('Running Structured Outputs Tests...');

  const concepts: RawExtractedConcept[] = [
    { name: 'Supervised Learning', description: 'Learning from labeled training data.' },
    { name: 'Linear Regression', description: 'Regression algorithm for linear relationships.' },
  ];

  const relationships: RawExtractedRelationship[] = [
    { from: 'Supervised Learning', to: 'Linear Regression', type: 'part-of' },
  ];

  // 1. Flashcard Generation
  const flashcards = generateFlashcardsFromConcepts(concepts);
  if (flashcards.length !== 2) {
    throw new Error(`Expected 2 flashcards, got ${flashcards.length}`);
  }
  if (flashcards[0].question !== 'What is Supervised Learning?') {
    throw new Error(`Unexpected question format: ${flashcards[0].question}`);
  }
  console.log('Flashcard Generation Test PASSED.');

  // 2. Flashcard JSON Export
  const jsonExport = exportFlashcardsJSON(flashcards);
  const parsedJson = JSON.parse(jsonExport);
  if (!Array.isArray(parsedJson) || parsedJson.length !== 2) {
    throw new Error('Flashcard JSON export is invalid');
  }
  console.log('Flashcard JSON Export Test PASSED.');

  // 3. Flashcard CSV Export
  const csvExport = exportFlashcardsCSV(flashcards);
  if (!csvExport.includes('Concept,Question,Answer')) {
    throw new Error('Flashcard CSV export missing header');
  }
  if (!csvExport.includes('"Supervised Learning","What is Supervised Learning?"')) {
    throw new Error('Flashcard CSV export missing formatted row');
  }
  console.log('Flashcard CSV Export Test PASSED.');

  // 4. Concept Graph Export
  const graph = exportConceptGraph(concepts, relationships);
  if (graph.nodes.length !== 2) {
    throw new Error(`Expected 2 graph nodes, got ${graph.nodes.length}`);
  }
  if (graph.edges.length !== 1 || graph.edges[0].type !== 'part-of') {
    throw new Error('Graph edges build mismatch');
  }
  console.log('Concept Graph Export Test PASSED.');

  console.log('\nAll Structured Outputs Tests PASSED!');
}

runStructuredOutputsTests();
