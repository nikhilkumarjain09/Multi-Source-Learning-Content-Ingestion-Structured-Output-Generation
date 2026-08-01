export type SourceType = 'pdf' | 'transcript';

export type RelationshipType = 'prerequisite' | 'related-to' | 'part-of';

export interface SourceDocument {
  id: string;
  filename: string;
  sourceType: SourceType | string;
  rawText: string;
  metadata: Record<string, unknown>;
  ingestedAt: string;
}

export interface Concept {
  id: string;
  documentId: string;
  name: string;
  description: string;
}

export interface Relationship {
  id: string;
  fromConceptId: string;
  toConceptId: string;
  type: RelationshipType;
}

export interface Flashcard {
  id: string;
  conceptId: string;
  question: string;
  answer: string;
}

export interface Summary {
  id: string;
  documentId: string;
  summaryText: string;
}

export interface RawExtractedConcept {
  name: string;
  description: string;
}

export interface RawExtractedRelationship {
  from: string;
  to: string;
  type: RelationshipType;
}

export interface ExtractionResult {
  concepts: RawExtractedConcept[];
  relationships: RawExtractedRelationship[];
  summary: string;
}
