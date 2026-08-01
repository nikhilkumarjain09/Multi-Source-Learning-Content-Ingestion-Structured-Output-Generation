import { getParserForFile } from './ingestion/registry';
import { normalizeDocument } from './normalization/normalize';
import { extractConceptsFromDocument } from './extraction/extract';
import { generateFlashcardsFromConcepts, GeneratedFlashcard } from './outputs/flashcardExport';
import { exportConceptGraph, ConceptGraphData } from './outputs/graphExport';
import { SourceDocument, ExtractionResult } from './shared/types';

export interface IngestionPipelineResult {
  document: SourceDocument;
  extraction: ExtractionResult;
  flashcards: GeneratedFlashcard[];
  graph: ConceptGraphData;
  summary: string;
}

/**
 * Runs the full end-to-end ingestion pipeline:
 * parser selection -> parsing -> normalization -> extraction & validation -> output structuring (flashcards, graph, summary).
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

  return {
    document: normalizedDoc,
    extraction: extractionResult,
    flashcards,
    graph,
    summary: extractionResult.summary,
  };
}
