import { getParserForFile } from './ingestion/registry';
import { normalizeDocument, SourceDocument } from './normalization/normalize';
import { extractConceptsFromDocument } from './extraction/extract';
import { generateFlashcardsFromConcepts, Flashcard } from './outputs/flashcardExport';
import { exportConceptGraph, ConceptGraph } from './outputs/graphExport';
import { ExtractionResult } from './validation/schema';
import { saveDocument } from './storage/documentRepository';
import { saveConcepts, Concept } from './storage/conceptRepository';
import { saveRelationships, Relationship } from './storage/relationshipRepository';
import { saveFlashcards } from './storage/flashcardRepository';
import { saveSummary } from './storage/summaryRepository';
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
 * Executes: Ingest → Normalize → Extract → Validate/Repair → Structure → Persist.
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

  // 2. Map & save concepts
  const conceptMap = new Map<string, string>(); // normalized name -> concept id
  const conceptEntities: Concept[] = extractionResult.concepts.map((c: any) => {
    const conceptId = uuidv4();
    conceptMap.set(c.name.trim().toLowerCase(), conceptId);
    return {
      id: conceptId,
      documentId: normalizedDoc.id,
      name: c.name.trim(),
      description: c.description.trim(),
    };
  });
  saveConcepts(conceptEntities);

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
  const flashcardEntities = flashcards.map(f => {
    const matchedConceptId = conceptMap.get((f.conceptName || '').trim().toLowerCase()) || conceptEntities[0]?.id;
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

  return {
    document: normalizedDoc,
    extraction: extractionResult,
    flashcards,
    graph,
    summary: extractionResult.summary,
  };
}
