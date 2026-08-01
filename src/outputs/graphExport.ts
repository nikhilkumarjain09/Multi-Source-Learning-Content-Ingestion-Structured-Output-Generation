import { RawExtractedConcept, RawExtractedRelationship } from '../shared/types';

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

export interface ConceptGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type ConceptGraph = ConceptGraphData;

/**
 * Transforms concepts and relationships into graph nodes and edges.
 * Format adheres to API.md specification.
 */
export function exportConceptGraph(
  concepts: RawExtractedConcept[],
  relationships: RawExtractedRelationship[]
): ConceptGraphData {
  const nodes: GraphNode[] = concepts.map(c => ({
    id: c.name,
    label: c.name,
    description: c.description,
  }));

  const edges: GraphEdge[] = relationships.map(r => ({
    from: r.from,
    to: r.to,
    type: r.type,
  }));

  return { nodes, edges };
}
