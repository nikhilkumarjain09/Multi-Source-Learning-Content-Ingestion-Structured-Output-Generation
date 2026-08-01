import { normalizeDocument, SourceDocument } from './normalization/normalize';
import { extractConceptsFromDocument } from './extraction/extract';
import { generateFlashcardsFromConcepts, Flashcard } from './outputs/flashcardExport';
import { exportConceptGraph, ConceptGraph } from './outputs/graphExport';
import { ExtractionResult } from './validation/schema';
import { saveDocument } from './storage/documentRepository';
import {
  saveConcepts,
  Concept,
  findConceptByCanonicalName,
  linkConceptToDocument,
  updateConceptDescription,
} from './storage/conceptRepository';
import { saveRelationships, Relationship } from './storage/relationshipRepository';
import { saveFlashcards } from './storage/flashcardRepository';
import { saveSummary } from './storage/summaryRepository';
import { saveConceptEmbeddings } from './storage/embeddingRepository';
import { generateEmbedding, conceptToEmbeddingText } from './retrieval/embeddings';
import { v4 as uuidv4 } from 'uuid';

export interface IngestionPipelineResult {
  document: SourceDocument;
  extraction: ExtractionResult;
  flashcards: Flashcard[];
  graph: ConceptGraph;
  summary: string;
}

/**
 * Main Orchestrator for the Learning Content Ingestion & Structured Output Generation Pipeline.
 * Executes: Ingest -> Normalize -> Extract -> Validate/Repair -> Structure -> Persist.
 *
 * Cross-document concept deduplication:
 * When a newly extracted concept matches an existing concept in the database (by canonical name),
 * the existing concept_id is reused and the new document is linked via the concept_documents
 * junction table, rather than inserting a duplicate concept row.
 */
export async function runIngestionPipeline(filePath: string): Promise<IngestionPipelineResult> {
  if (!filePath) {
    throw new Error('File path must be provided to runIngestionPipeline');
  }

  const normalizedDoc = await normalizeDocument(filePath);
  const extractionResult = await extractConceptsFromDocument(normalizedDoc);

  const flashcards = generateFlashcardsFromConcepts(extractionResult.concepts);
  const graph = exportConceptGraph(extractionResult.concepts, extractionResult.relationships);

  // --- SQLite Storage Persistence Layer ---
  // 1. Save document
  saveDocument(normalizedDoc);

  // 2. Map & save concepts with cross-document deduplication
  const conceptMap = new Map<string, string>(); // canonical name -> concept id
  const newConcepts: Concept[] = [];

  for (const c of extractionResult.concepts) {
    const canonicalName = c.name.trim().toLowerCase();

    // Check if a concept with this canonical name already exists in the database
    const existingConcept = findConceptByCanonicalName(canonicalName);

    if (existingConcept) {
      // Reuse existing concept_id; link it to the new document via junction table
      conceptMap.set(canonicalName, existingConcept.id);
      linkConceptToDocument(existingConcept.id, normalizedDoc.id);

      // Upgrade description if the new one is more detailed
      if (c.description.trim().length > (existingConcept.description || '').length) {
        updateConceptDescription(existingConcept.id, c.description.trim());
      }
    } else {
      // New concept: create a fresh row and link to this document
      const conceptId = uuidv4();
      conceptMap.set(canonicalName, conceptId);
      newConcepts.push({
        id: conceptId,
        documentId: normalizedDoc.id,
        name: c.name.trim(),
        description: c.description.trim(),
      });
    }
  }

  // Persist only genuinely new concept rows
  if (newConcepts.length > 0) {
    saveConcepts(newConcepts);
  }

  // Link all concepts (new and existing) to this document via junction table
  for (const [, conceptId] of conceptMap) {
    linkConceptToDocument(conceptId, normalizedDoc.id);
  }

  // 3. Map & save relationships
  const relationshipEntities: Relationship[] = [];
  for (const rel of extractionResult.relationships) {
    const fromId = conceptMap.get(rel.from.trim().toLowerCase());
    const toId = conceptMap.get(rel.to.trim().toLowerCase());

    if (fromId && toId && fromId !== toId) {
      relationshipEntities.push({
        id: uuidv4(),
        fromConceptId: fromId,
        toConceptId: toId,
        type: rel.type,
      });
    }
  }
  if (relationshipEntities.length > 0) {
    saveRelationships(relationshipEntities);
  }

  // 4. Map & save flashcards
  const allConceptIds = Array.from(conceptMap.values());
  const flashcardEntities = flashcards.map(f => {
    const matchedConceptId = conceptMap.get((f.conceptName || '').trim().toLowerCase()) || allConceptIds[0];
    return {
      id: f.id || uuidv4(),
      conceptId: matchedConceptId,
      question: f.question,
      answer: f.answer,
    };
  });
  if (flashcardEntities.length > 0) {
    saveFlashcards(flashcardEntities);
  }

  // 5. Save summary
  if (extractionResult.summary) {
    saveSummary({
      id: uuidv4(),
      documentId: normalizedDoc.id,
      summaryText: extractionResult.summary,
    });
  }

  // 6. Generate and store concept embeddings for semantic search
  const embeddingEntries = extractionResult.concepts.map(c => {
    const canonicalName = c.name.trim().toLowerCase();
    const conceptId = conceptMap.get(canonicalName);
    if (!conceptId) return null;
    const text = conceptToEmbeddingText(c.name, c.description);
    const embedding = generateEmbedding(text);
    return { conceptId, embedding };
  }).filter((e): e is { conceptId: string; embedding: number[] } => e !== null);

  if (embeddingEntries.length > 0) {
    saveConceptEmbeddings(embeddingEntries);
  }

  return {
    document: normalizedDoc,
    extraction: extractionResult,
    flashcards,
    graph,
    summary: extractionResult.summary,
  };
}
