import { Flashcard, Summary, Concept, Relationship } from '../shared/types';
import { getConceptsByName } from '../storage/conceptRepository';
import { getFlashcardsByConceptIds } from '../storage/flashcardRepository';
import { getRelationshipsForConceptIds } from '../storage/relationshipRepository';
import { getSummaryByDocumentId } from '../storage/summaryRepository';

export interface TopicArtifacts {
  topic: string;
  concepts: Concept[];
  flashcards: Flashcard[];
  summary: string;
  graph: {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ from: string; to: string; type: string }>;
  };
}

export function getArtifactsByTopic(topicName: string): TopicArtifacts | null {
  const concepts = getConceptsByName(topicName);
  if (concepts.length === 0) {
    return null;
  }

  const conceptIds = concepts.map(c => c.id);
  const flashcards = getFlashcardsByConceptIds(conceptIds);
  const relationships = getRelationshipsForConceptIds(conceptIds);

  const documentIds = Array.from(new Set(concepts.map(c => c.documentId)));
  const summaries = documentIds
    .map(id => getSummaryByDocumentId(id))
    .filter((s): s is Summary => s !== null)
    .map(s => s.summaryText)
    .join('\n\n');

  const nodes = concepts.map(c => ({ id: c.id, label: c.name }));
  const edges = relationships.map(r => ({ from: r.fromConceptId, to: r.toConceptId, type: r.type }));

  return {
    topic: topicName,
    concepts,
    flashcards,
    summary: summaries,
    graph: {
      nodes,
      edges,
    },
  };
}
