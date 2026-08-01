import { Concept, Flashcard, Summary } from '../shared/types';
import { searchConceptsByName, getConceptsByIds } from '../storage/conceptRepository';
import { getFlashcardsByConceptIds } from '../storage/flashcardRepository';
import { getRelationshipsForConceptIds } from '../storage/relationshipRepository';
import { getSummaryByDocumentId } from '../storage/summaryRepository';

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

/**
 * Retrieves all stored learning artifacts associated with a topic/concept name.
 * Queries stored concepts by exact match, falling back to case-insensitive substring match.
 */
export function getArtifactsByTopic(topicName: string): TopicArtifacts | null {
  if (!topicName || topicName.trim().length === 0) {
    return null;
  }

  const matchedConcepts = searchConceptsByName(topicName);
  if (matchedConcepts.length === 0) {
    return null;
  }

  const matchedConceptIds = matchedConcepts.map(c => c.id);
  const flashcards = getFlashcardsByConceptIds(matchedConceptIds);
  const relationships = getRelationshipsForConceptIds(matchedConceptIds);

  // Collect neighbor concept IDs referenced in direct relationships
  const neighborConceptIds = new Set<string>();
  for (const rel of relationships) {
    neighborConceptIds.add(rel.fromConceptId);
    neighborConceptIds.add(rel.toConceptId);
  }

  const allRelevantConceptIds = Array.from(new Set([...matchedConceptIds, ...Array.from(neighborConceptIds)]));
  const allRelevantConcepts = getConceptsByIds(allRelevantConceptIds);
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

  // Retrieve summaries for associated documents
  const documentIds = Array.from(new Set(matchedConcepts.map(c => c.documentId)));
  const summaryTexts = documentIds
    .map(docId => getSummaryByDocumentId(docId))
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
