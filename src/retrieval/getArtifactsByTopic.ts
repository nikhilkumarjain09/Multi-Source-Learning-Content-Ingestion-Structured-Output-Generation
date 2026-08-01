import { Concept, Flashcard, Summary } from '../shared/types';
import { searchConceptsByName, getConceptsByIds, getDocumentIdsForConcept } from '../storage/conceptRepository';
import { getFlashcardsByConceptIds } from '../storage/flashcardRepository';
import { getRelationshipsForConceptIds } from '../storage/relationshipRepository';
import { getSummaryByDocumentId } from '../storage/summaryRepository';
import { getAllConceptEmbeddings } from '../storage/embeddingRepository';
import { generateEmbedding, cosineSimilarity, conceptToEmbeddingText } from './embeddings';

export interface GraphNode {
  id: string;
  label: string;
  description: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export interface TopicArtifacts {
  topic: string;
  concepts: Concept[];
  flashcards: Flashcard[];
  summary: string;
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

/** Minimum cosine similarity threshold for semantic fallback matches. */
const SEMANTIC_SIMILARITY_THRESHOLD = 0.25;
/** Maximum number of concepts to return from semantic search. */
const SEMANTIC_MAX_RESULTS = 5;

/**
 * Retrieves all stored learning artifacts associated with a topic/concept name,
 * aggregated across ALL documents that contributed to the matching concepts
 * (cross-document deduplication aware).
 *
 * Search strategy (in order):
 *  1. Case-insensitive substring match on concept name
 *  2. Semantic nearest-embedding match (fallback when string match returns nothing)
 *
 * The external interface and return shape remain unchanged regardless of which
 * search strategy found the results.
 */
export async function getArtifactsByTopic(topicName: string): Promise<TopicArtifacts | null> {
  if (!topicName || topicName.trim().length === 0) {
    return null;
  }

  // Strategy 1: exact/fuzzy string match
  let matchedConcepts = await searchConceptsByName(topicName);

  // Strategy 2: semantic embedding fallback
  if (matchedConcepts.length === 0) {
    matchedConcepts = await semanticConceptSearch(topicName);
  }

  if (matchedConcepts.length === 0) {
    return null;
  }

  return await buildTopicArtifacts(topicName, matchedConcepts);
}

/**
 * Searches for concepts by nearest-embedding cosine similarity.
 * Returns the top-N concepts above the similarity threshold.
 */
async function semanticConceptSearch(query: string): Promise<Concept[]> {
  const allEmbeddings = await getAllConceptEmbeddings();
  if (allEmbeddings.length === 0) return [];

  const queryText = conceptToEmbeddingText(query, query);
  const queryVec = generateEmbedding(queryText);

  // Score every stored concept embedding against the query
  const scored = allEmbeddings
    .map(entry => ({
      conceptId: entry.conceptId,
      score: cosineSimilarity(queryVec, entry.embedding),
    }))
    .filter(s => s.score >= SEMANTIC_SIMILARITY_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, SEMANTIC_MAX_RESULTS);

  if (scored.length === 0) return [];

  const conceptIds = scored.map(s => s.conceptId);
  return await getConceptsByIds(conceptIds);
}

/**
 * Builds the full TopicArtifacts response from a set of matched concepts.
 * Shared by both string-match and semantic-match paths.
 */
async function buildTopicArtifacts(topicName: string, matchedConcepts: Concept[]): Promise<TopicArtifacts> {
  const matchedConceptIds = matchedConcepts.map(c => c.id);
  const flashcards = await getFlashcardsByConceptIds(matchedConceptIds);
  const relationships = await getRelationshipsForConceptIds(matchedConceptIds);

  // Collect neighbor concept IDs referenced in direct relationships
  const neighborConceptIds = new Set<string>();
  for (const rel of relationships) {
    neighborConceptIds.add(rel.fromConceptId);
    neighborConceptIds.add(rel.toConceptId);
  }

  const allRelevantConceptIds = Array.from(new Set([...matchedConceptIds, ...Array.from(neighborConceptIds)]));
  const allRelevantConcepts = await getConceptsByIds(allRelevantConceptIds);
  const conceptMap = new Map<string, Concept>();
  for (const c of allRelevantConcepts) {
    conceptMap.set(c.id, c);
  }

  // Construct scoped graph nodes and edges
  const nodes: GraphNode[] = allRelevantConceptIds.map(id => {
    const concept = conceptMap.get(id);
    return {
      id,
      label: concept ? concept.name : id,
      description: concept ? concept.description : '',
    };
  });

  const edges: GraphEdge[] = relationships.map(rel => ({
    from: rel.fromConceptId,
    to: rel.toConceptId,
    type: rel.type,
  }));

  // Aggregate summaries across ALL documents linked to matching concepts
  const documentIds = new Set<string>();
  for (const concept of matchedConcepts) {
    documentIds.add(concept.documentId);

    const linkedDocIds = await getDocumentIdsForConcept(concept.id);
    for (const docId of linkedDocIds) {
      documentIds.add(docId);
    }
  }

  const summaryPromises = Array.from(documentIds).map(docId => getSummaryByDocumentId(docId));
  const summaries = await Promise.all(summaryPromises);

  const summaryTexts = summaries
    .filter((s): s is Summary => s !== null && Boolean(s.summaryText))
    .map(s => s.summaryText);

  const combinedSummary = summaryTexts.join('\n\n');

  return {
    topic: topicName,
    concepts: matchedConcepts,
    flashcards,
    summary: combinedSummary,
    graph: {
      nodes,
      edges,
    },
  };
}
