import { v4 as uuidv4 } from 'uuid';
import { saveDocument, getDocumentById } from '../src/storage/documentRepository';
import { saveConcepts, getConceptsByDocumentId, getConceptsByName, getAllConceptNames } from '../src/storage/conceptRepository';
import { saveRelationships, getRelationshipsForConceptIds } from '../src/storage/relationshipRepository';
import { saveFlashcards, getFlashcardsByConceptIds } from '../src/storage/flashcardRepository';
import { saveSummary, getSummaryByDocumentId } from '../src/storage/summaryRepository';
import { SourceDocument, Concept, Relationship, Flashcard, Summary } from '../src/shared/types';

function runRepositoryRoundtripTests() {
  console.log('Running Repository Round-Trip Data Integrity Tests...');

  const docId = uuidv4();
  const concept1Id = uuidv4();
  const concept2Id = uuidv4();
  const relId = uuidv4();
  const flashcardId = uuidv4();
  const summaryId = uuidv4();

  // 1. Document Repository Test
  console.log('\n--- 1. Document Repository Round-Trip ---');
  const sampleDoc: SourceDocument = {
    id: docId,
    filename: 'roundtrip_test.pdf',
    sourceType: 'pdf',
    rawText: 'Sample text for roundtrip storage testing.',
    metadata: { author: 'Test Suite', pageCount: 5 },
    ingestedAt: new Date().toISOString(),
  };

  saveDocument(sampleDoc);
  const retrievedDoc = getDocumentById(docId);

  if (!retrievedDoc) {
    throw new Error('Document round-trip failed: Document not found');
  }
  if (retrievedDoc.filename !== sampleDoc.filename || retrievedDoc.sourceType !== sampleDoc.sourceType) {
    throw new Error('Document round-trip failed: Field mismatch');
  }
  if (retrievedDoc.metadata.author !== 'Test Suite') {
    throw new Error('Document round-trip failed: Metadata JSON blob deserialization mismatch');
  }
  console.log('Document repository round-trip PASSED.');

  // 2. Concept Repository Test
  console.log('\n--- 2. Concept Repository Round-Trip ---');
  const sampleConcepts: Concept[] = [
    {
      id: concept1Id,
      documentId: docId,
      name: 'Convolutional Neural Network',
      description: 'Deep neural network architecture for grid-structured data.',
    },
    {
      id: concept2Id,
      documentId: docId,
      name: 'Deep Learning',
      description: 'Subset of machine learning based on artificial neural networks.',
    },
  ];

  saveConcepts(sampleConcepts);

  const docConcepts = getConceptsByDocumentId(docId);
  if (docConcepts.length !== 2) {
    throw new Error(`Concept round-trip failed: Expected 2 concepts for doc, got ${docConcepts.length}`);
  }

  const cnnSearch = getConceptsByName('convolutional neural network');
  if (cnnSearch.length !== 1 || cnnSearch[0].id !== concept1Id) {
    throw new Error('Concept round-trip failed: Concept lookup by normalized name failed');
  }

  const allNames = getAllConceptNames();
  if (!allNames.includes('Convolutional Neural Network') || !allNames.includes('Deep Learning')) {
    throw new Error('Concept round-trip failed: Distinct concept names list incomplete');
  }
  console.log('Concept repository round-trip PASSED.');

  // 3. Relationship Repository Test
  console.log('\n--- 3. Relationship Repository Round-Trip ---');
  const sampleRelationship: Relationship = {
    id: relId,
    fromConceptId: concept2Id,
    toConceptId: concept1Id,
    type: 'prerequisite',
  };

  saveRelationships([sampleRelationship]);
  const retrievedRelationships = getRelationshipsForConceptIds([concept1Id]);

  if (retrievedRelationships.length !== 1 || retrievedRelationships[0].id !== relId) {
    throw new Error('Relationship round-trip failed: Relationship edge lookup mismatch');
  }
  if (retrievedRelationships[0].type !== 'prerequisite') {
    throw new Error('Relationship round-trip failed: Relationship type mismatch');
  }
  console.log('Relationship repository round-trip PASSED.');

  // 4. Flashcard Repository Test
  console.log('\n--- 4. Flashcard Repository Round-Trip ---');
  const sampleFlashcard: Flashcard = {
    id: flashcardId,
    conceptId: concept1Id,
    question: 'What is a Convolutional Neural Network?',
    answer: 'Deep neural network architecture for grid-structured data.',
  };

  saveFlashcards([sampleFlashcard]);
  const retrievedFlashcards = getFlashcardsByConceptIds([concept1Id]);

  if (retrievedFlashcards.length !== 1 || retrievedFlashcards[0].id !== flashcardId) {
    throw new Error('Flashcard round-trip failed: Flashcard lookup mismatch');
  }
  if (retrievedFlashcards[0].question !== sampleFlashcard.question) {
    throw new Error('Flashcard round-trip failed: Flashcard question mismatch');
  }
  console.log('Flashcard repository round-trip PASSED.');

  // 5. Summary Repository Test
  console.log('\n--- 5. Summary Repository Round-Trip ---');
  const sampleSummary: Summary = {
    id: summaryId,
    documentId: docId,
    summaryText: 'Summary text for roundtrip document testing.',
  };

  saveSummary(sampleSummary);
  const retrievedSummary = getSummaryByDocumentId(docId);

  if (!retrievedSummary || retrievedSummary.id !== summaryId) {
    throw new Error('Summary round-trip failed: Summary lookup mismatch');
  }
  if (retrievedSummary.summaryText !== sampleSummary.summaryText) {
    throw new Error('Summary round-trip failed: Summary text mismatch');
  }
  console.log('Summary repository round-trip PASSED.');

  console.log('\nAll Repository Round-Trip Tests PASSED Successfully!');
}

runRepositoryRoundtripTests();
