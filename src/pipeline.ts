import { v4 as uuidv4 } from 'uuid';
import { getParserForFile } from './ingestion/registry';
import { normalizeDocument } from './normalization/normalize';
import { extractConceptsFromDocument } from './extraction/extract';
import { generateFlashcardsFromConcepts, GeneratedFlashcard } from './outputs/flashcardExport';
import { exportConceptGraph, ConceptGraphData } from './outputs/graphExport';
import { SourceDocument, ExtractionResult, Concept, Relationship, Flashcard, Summary } from './shared/types';
import { saveDocument } from './storage/documentRepository';
import { saveConcepts } from './storage/conceptRepository';
import { saveRelationships } from './storage/relationshipRepository';
import { saveFlashcards } from './storage/flashcardRepository';
import { saveSummary } from './storage/summaryRepository';

export interface IngestionPipelineResult {
  document: SourceDocument;
  extraction: ExtractionResult;
  flashcards: GeneratedFlashcard[];
  graph: ConceptGraphData;
  summary: string;
}

/**
 * Runs the full end-to-end ingestion pipeline:
 * parser selection -> parsing -> normalization -> extraction & validation -> output structuring -> SQLite DB persistence.
 */
export async function runIngestionPipeline(filePath: string): Promise<IngestionPipelineResult> {
  if (!filePath) {
    throw new Error('File path must be provided to runIngestionPipeline');
  }

  const parser = getParserForFile(filePath);
  const parsed = await parser.parse(filePath);
  const normalizedDoc = normalizeDocument(filePath, parsed);
  const extractionResult = await extractConceptsFromDocument(normalizedDoc);

  const flashcards = generateFlashcardsFromConcepts(extractionResult.concepts);
  const graph = exportConceptGraph(extractionResult.concepts, extractionResult.relationships);

  // --- SQLite Storage Persistence Layer ---
  // 1. Save document
  saveDocument(normalizedDoc);

  // 2. Map & save concepts
  const conceptMap = new Map<string, string>(); // normalized name -> concept id
  const conceptEntities: Concept[] = extractionResult.concepts.map(c => {
    const conceptId = uuidv4();
    const normalizedName = c.name.trim().toLowerCase();
    conceptMap.set(normalizedName, conceptId);

    return {
      id: conceptId,
      documentId: normalizedDoc.id,
      name: c.name.trim(),
      description: c.description ? c.description.trim() : '',
    };
  });
  saveConcepts(conceptEntities);

  // 3. Map & save relationships
  const relationshipEntities: Relationship[] = [];
  for (const rel of extractionResult.relationships) {
    const fromConceptId = conceptMap.get(rel.from.trim().toLowerCase());
    const toConceptId = conceptMap.get(rel.to.trim().toLowerCase());

    if (fromConceptId && toConceptId) {
      relationshipEntities.push({
        id: uuidv4(),
        fromConceptId,
        toConceptId,
        type: rel.type,
      });
    }
  }
  saveRelationships(relationshipEntities);

  // 4. Map & save flashcards
  const flashcardEntities: Flashcard[] = [];
  for (const fc of flashcards) {
    const conceptId = conceptMap.get(fc.conceptName.trim().toLowerCase());
    if (conceptId) {
      flashcardEntities.push({
        id: fc.id,
        conceptId,
        question: fc.question,
        answer: fc.answer,
      });
    }
  }
  saveFlashcards(flashcardEntities);

  // 5. Save summary
  if (extractionResult.summary) {
    const summaryEntity: Summary = {
      id: uuidv4(),
      documentId: normalizedDoc.id,
      summaryText: extractionResult.summary,
    };
    saveSummary(summaryEntity);
  }

  return {
    document: normalizedDoc,
    extraction: extractionResult,
    flashcards,
    graph,
    summary: extractionResult.summary,
  };
}
