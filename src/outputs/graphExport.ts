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

/**
 * Transforms concepts and relationships into graph nodes and edges.
 * Format adheres to API.md specification.
 */
export function exportConceptGraph(
  concepts: RawExtractedConcept[],
  relationships: RawExtractedRelationship[]
): ConceptGraphData {
  const nodeMap = new Map<string, GraphNode>();

  // Ensure all extracted concepts exist as nodes
  for (const concept of concepts) {
    const id = concept.name.trim().toLowerCase();
    if (!nodeMap.has(id)) {
      nodeMap.set(id, {
        id,
        label: concept.name.trim(),
        description: concept.description ? concept.description.trim() : '',
      });
    }
  }

  // Ensure concepts referenced in relationships exist as nodes even if missing in concepts list
  for (const rel of relationships) {
    const fromId = rel.from.trim().toLowerCase();
    const toId = rel.to.trim().toLowerCase();

    if (!nodeMap.has(fromId)) {
      nodeMap.set(fromId, {
        id: fromId,
        label: rel.from.trim(),
        description: '',
      });
    }
    if (!nodeMap.has(toId)) {
      nodeMap.set(toId, {
        id: toId,
        label: rel.to.trim(),
        description: '',
      });
    }
  }

  const edges: GraphEdge[] = relationships.map(rel => ({
    from: rel.from.trim().toLowerCase(),
    to: rel.to.trim().toLowerCase(),
    type: rel.type,
  }));

  return {
    nodes: Array.from(nodeMap.values()),
    edges,
  };
}
