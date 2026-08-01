import { Concept, Relationship, RawExtractedConcept, RawExtractedRelationship } from '../shared/types';
import { getArtifactsByTopic } from '../retrieval/getArtifactsByTopic';

export interface LearningPathStep {
  step: number;
  conceptName: string;
  description: string;
  prerequisites: string[];
}

export interface LearningPath {
  topic?: string;
  totalSteps: number;
  steps: LearningPathStep[];
}

/**
 * Generates an ordered learning path respecting prerequisite relationship edges
 * using topological sorting (Kahn's algorithm).
 */
export function generateLearningPathFromGraph(
  concepts: Array<{ name: string; description: string }>,
  relationships: Array<{ from: string; to: string; type: string }>,
  topicName?: string
): LearningPath {
  if (!concepts || concepts.length === 0) {
    return { topic: topicName, totalSteps: 0, steps: [] };
  }

  // Map concept names to descriptions
  const conceptMap = new Map<string, string>();
  for (const c of concepts) {
    conceptMap.set(c.name.trim(), c.description || '');
  }

  // Filter prerequisite edges: "from" concept is a prerequisite for "to" concept
  // i.e., "from" must come BEFORE "to" in the learning path.
  const prereqEdges = relationships.filter(
    r => r.type.toLowerCase() === 'prerequisite' && conceptMap.has(r.from.trim()) && conceptMap.has(r.to.trim())
  );

  // Build adjacency list & in-degree map for prerequisite graph
  const inDegree = new Map<string, number>();
  const graph = new Map<string, string[]>(); // node -> list of dependent nodes (nodes that require 'node')
  const directPrereqs = new Map<string, Set<string>>(); // node -> set of required prerequisites

  for (const name of conceptMap.keys()) {
    inDegree.set(name, 0);
    graph.set(name, []);
    directPrereqs.set(name, new Set());
  }

  for (const edge of prereqEdges) {
    const u = edge.from.trim(); // prerequisite
    const v = edge.to.trim();   // target concept

    graph.get(u)!.push(v);
    inDegree.set(v, (inDegree.get(v) || 0) + 1);
    directPrereqs.get(v)!.add(u);
  }

  // Topological sort via Kahn's algorithm
  const queue: string[] = [];
  for (const [name, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(name);
    }
  }

  // Sort initial queue alphabetically for deterministic ordering
  queue.sort();

  const orderedNames: string[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    orderedNames.push(curr);

    const neighbors = graph.get(curr) || [];
    for (const nextNode of neighbors) {
      const currentInDegree = (inDegree.get(nextNode) || 1) - 1;
      inDegree.set(nextNode, currentInDegree);
      if (currentInDegree === 0 && !visited.has(nextNode)) {
        queue.push(nextNode);
      }
    }
    // Keep queue sorted alphabetically for ties
    queue.sort();
  }

  // Add any unvisited nodes (in case of cyclic prerequisite dependencies or isolated nodes)
  for (const name of conceptMap.keys()) {
    if (!visited.has(name)) {
      orderedNames.push(name);
    }
  }

  // Construct structured steps
  const steps: LearningPathStep[] = orderedNames.map((name, index) => ({
    step: index + 1,
    conceptName: name,
    description: conceptMap.get(name) || '',
    prerequisites: Array.from(directPrereqs.get(name) || []),
  }));

  return {
    topic: topicName,
    totalSteps: steps.length,
    steps,
  };
}

/**
 * Generates an ordered learning path for a stored topic by retrieving its concept graph.
 */
export function generateLearningPathByTopic(topicName: string): LearningPath | null {
  const artifacts = getArtifactsByTopic(topicName);
  if (!artifacts) {
    return null;
  }

  const concepts = artifacts.concepts.map(c => ({ name: c.name, description: c.description }));
  const relationships = artifacts.graph.edges.map(e => ({ from: e.from, to: e.to, type: e.type }));

  return generateLearningPathFromGraph(concepts, relationships, topicName);
}
