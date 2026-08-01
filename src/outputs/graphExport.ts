import { Concept, Relationship } from '../shared/types';

export interface GraphData {
  nodes: Array<{ id: string; label: string; description: string }>;
  edges: Array<{ id: string; from: string; to: string; type: string }>;
}

export function exportConceptGraph(concepts: Concept[], relationships: Relationship[]): GraphData {
  return {
    nodes: concepts.map(c => ({ id: c.id, label: c.name, description: c.description })),
    edges: relationships.map(r => ({ id: r.id, from: r.fromConceptId, to: r.toConceptId, type: r.type })),
  };
}
