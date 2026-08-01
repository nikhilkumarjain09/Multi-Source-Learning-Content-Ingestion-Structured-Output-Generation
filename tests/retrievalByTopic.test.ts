import { v4 as uuidv4 } from 'uuid';
import { saveDocument } from '../src/storage/documentRepository';
import { saveConcepts } from '../src/storage/conceptRepository';
import { saveRelationships } from '../src/storage/relationshipRepository';
import { saveFlashcards } from '../src/storage/flashcardRepository';
import { saveSummary } from '../src/storage/summaryRepository';
import { getArtifactsByTopic } from '../src/retrieval/getArtifactsByTopic';
import { SourceDocument, Concept, Relationship, Flashcard, Summary } from '../src/shared/types';

function runRetrievalByTopicTests() {
  console.log('Running Topic Retrieval Layer Tests...');

  const docId = uuidv4();
  const c1Id = uuidv4();
  const c2Id = uuidv4();

  // Setup seed database records
  const doc: SourceDocument = {
    id: docId,
    filename: 'retrieval_seed.txt',
    sourceType: 'transcript',
    rawText: 'Text content about Artificial Intelligence and Neural Networks.',
    metadata: {},
    ingestedAt: new Date().toISOString(),
  };
  saveDocument(doc);

  const c1: Concept = {
    id: c1Id,
    documentId: docId,
    name: 'Artificial Intelligence',
    description: 'Study of intelligent agents.',
  };
  const c2: Concept = {
    id: c2Id,
    documentId: docId,
    name: 'Neural Networks',
    description: 'Computing systems inspired by biological neural networks.',
  };
  saveConcepts([c1, c2]);

  const rel: Relationship = {
    id: uuidv4(),
    fromConceptId: c1Id,
    toConceptId: c2Id,
    type: 'part-of',
  };
  saveRelationships([rel]);

  const flashcard: Flashcard = {
    id: uuidv4(),
    conceptId: c1Id,
    question: 'What is Artificial Intelligence?',
    answer: 'Study of intelligent agents.',
  };
  saveFlashcards([flashcard]);

  const summary: Summary = {
    id: uuidv4(),
    documentId: docId,
    summaryText: 'Overview of Artificial Intelligence and Neural Networks.',
  };
  saveSummary(summary);

  // Test 1: Exact Topic Match
  console.log('\n--- Test 1: Exact Topic Match ---');
  const exactResult = getArtifactsByTopic('Artificial Intelligence');
  if (!exactResult) {
    throw new Error('Test 1 Failed: Expected non-null result for exact topic match');
  }
  if (exactResult.concepts.length === 0 || !exactResult.concepts.some(c => c.id === c1Id)) {
    throw new Error('Test 1 Failed: Concept match mismatch');
  }
  if (exactResult.flashcards.length === 0 || !exactResult.flashcards.some(f => f.question === flashcard.question)) {
    throw new Error('Test 1 Failed: Flashcards match mismatch');
  }
  if (exactResult.graph.nodes.length === 0 || exactResult.graph.edges.length === 0) {
    throw new Error('Test 1 Failed: Scoped graph nodes/edges count mismatch');
  }
  if (!exactResult.summary.includes(summary.summaryText)) {
    throw new Error('Test 1 Failed: Document summary text mismatch');
  }
  console.log('Test 1 Passed: Exact topic match returned complete artifacts and scoped graph.');

  // Test 2: Substring Fallback Match
  console.log('\n--- Test 2: Substring Fallback Match ---');
  const substringResult = getArtifactsByTopic('intelligence');
  if (!substringResult) {
    throw new Error('Test 2 Failed: Expected non-null result for substring match');
  }
  if (substringResult.concepts[0].name !== 'Artificial Intelligence') {
    throw new Error('Test 2 Failed: Substring fallback failed to match concept');
  }
  console.log('Test 2 Passed: Substring fallback match retrieved expected artifacts.');

  // Test 3: Non-Existent Topic
  console.log('\n--- Test 3: Non-Existent Topic Returns Null ---');
  const nonExistent = getArtifactsByTopic('Quantum Computing 123');
  if (nonExistent !== null) {
    throw new Error('Test 3 Failed: Expected null for non-existent topic');
  }
  console.log('Test 3 Passed: Non-existent topic returned null.');

  console.log('\nAll Retrieval Layer Tests PASSED Successfully!');
}

runRetrievalByTopicTests();
