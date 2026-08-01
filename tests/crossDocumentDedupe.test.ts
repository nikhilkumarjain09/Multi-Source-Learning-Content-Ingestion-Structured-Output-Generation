import { v4 as uuidv4 } from 'uuid';
import { saveDocument } from '../src/storage/documentRepository';
import {
  saveConcepts,
  findConceptByCanonicalName,
  linkConceptToDocument,
  updateConceptDescription,
  getDocumentIdsForConcept,
  getConceptsByName,
} from '../src/storage/conceptRepository';
import { saveSummary } from '../src/storage/summaryRepository';
import { getArtifactsByTopic } from '../src/retrieval/getArtifactsByTopic';
import { disconnectDB } from '../src/storage/db';
import { SourceDocument, Concept, Summary } from '../src/shared/types';

async function runCrossDocumentDedupeTests() {
  console.log('Running Cross-Document Concept Deduplication Tests...');

  const uniqueId = uuidv4().substring(0, 8);
  const doc1Id = uuidv4();
  const doc2Id = uuidv4();
  const conceptName = `Quantum Neural Net ${uniqueId}`;
  const canonicalName = conceptName.toLowerCase();

  try {
    // 1. Setup Document 1
    const doc1: SourceDocument = {
      id: doc1Id,
      filename: `doc1_${uniqueId}.txt`,
      sourceType: 'transcript',
      rawText: `Introduction to ${conceptName} concepts.`,
      metadata: {},
      ingestedAt: new Date().toISOString(),
    };
    await saveDocument(doc1);

    const conceptDoc1: Concept = {
      id: uuidv4(),
      documentId: doc1Id,
      name: conceptName,
      description: 'Basic study of intelligent quantum agents.',
    };
    await saveConcepts([conceptDoc1]);
    await linkConceptToDocument(conceptDoc1.id, doc1Id);

    const summary1: Summary = {
      id: uuidv4(),
      documentId: doc1Id,
      summaryText: `Summary for Document 1: Intro to ${conceptName}.`,
    };
    await saveSummary(summary1);

    console.log('Document 1 ingested and persisted.');

    // 2. Simulate Document 2 ingestion containing the same concept (case-insensitive match)
    const doc2: SourceDocument = {
      id: doc2Id,
      filename: `doc2_${uniqueId}.pdf`,
      sourceType: 'pdf',
      rawText: `Advanced study of ${conceptName.toLowerCase()} systems.`,
      metadata: {},
      ingestedAt: new Date().toISOString(),
    };
    await saveDocument(doc2);

    const existingConcept = await findConceptByCanonicalName(canonicalName);
    if (!existingConcept) {
      throw new Error('Test Failed: Expected to find existing concept by canonical name');
    }

    if (existingConcept.id !== conceptDoc1.id) {
      throw new Error(`Test Failed: Existing concept ID mismatch (expected ${conceptDoc1.id}, got ${existingConcept.id})`);
    }

    // Link Document 2 to the existing concept ID
    await linkConceptToDocument(existingConcept.id, doc2Id);

    // Upgrade description with longer/richer content
    const richerDescription = 'Comprehensive study of intelligent quantum agents and automated reasoning systems.';
    await updateConceptDescription(existingConcept.id, richerDescription);

    const summary2: Summary = {
      id: uuidv4(),
      documentId: doc2Id,
      summaryText: `Summary for Document 2: Advanced ${conceptName} applications.`,
    };
    await saveSummary(summary2);

    console.log('Document 2 deduplicated against existing concept.');

    // 3. Assertions
    const matchedConcepts = await getConceptsByName(conceptName);
    if (matchedConcepts.length !== 1) {
      throw new Error(`Test Failed: Expected 1 concept row, got ${matchedConcepts.length}`);
    }

    const linkedDocs = await getDocumentIdsForConcept(existingConcept.id);
    if (!linkedDocs.includes(doc1Id) || !linkedDocs.includes(doc2Id)) {
      throw new Error('Test Failed: Concept junction table missing linked document IDs');
    }
    console.log('Junction table verification PASSED: Concept linked to both Document 1 and Document 2.');

    // 4. Verify aggregated topic retrieval
    const artifacts = await getArtifactsByTopic(conceptName);
    if (!artifacts) {
      throw new Error('Test Failed: getArtifactsByTopic returned null');
    }

    if (!artifacts.summary.includes(summary1.summaryText) || !artifacts.summary.includes(summary2.summaryText)) {
      throw new Error('Test Failed: Aggregated summary missing content from one of the contributing documents');
    }

    console.log('Cross-Document Summary Aggregation PASSED: Combined summaries from all contributing documents.');
    console.log('\nAll Cross-Document Deduplication Tests PASSED Successfully!');
  } finally {
    await disconnectDB();
  }
}

runCrossDocumentDedupeTests().catch(err => {
  console.error('Cross-Document Dedupe Test Failure:', err);
  process.exit(1);
});
