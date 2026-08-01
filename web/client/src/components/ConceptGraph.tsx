import React, { useState } from 'react';
import { Network } from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  description?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

interface ConceptGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({ nodes, edges }) => {
  const [hoveredEdge, setHoveredEdge] = useState<{ edge: GraphEdge; x: number; y: number } | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
      }}>
        No concept graph nodes available. Ingest a document or select a topic to view its concept graph.
      </div>
    );
  }

  const width = 800;
  const height = 450;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  // Calculate radial layout positions for nodes
  const nodePositions = new Map<string, { x: number; y: number; label: string }>();

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    const x = nodes.length === 1 ? centerX : centerX + radius * Math.cos(angle);
    const y = nodes.length === 1 ? centerY : centerY + radius * Math.sin(angle);
    nodePositions.set(node.id.toLowerCase(), { x, y, label: node.label });
  });

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      position: 'relative',
    }}>
      <h3 style={{
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Network size={16} color="var(--accent)" />
        Concept Knowledge Graph ({nodes.length} nodes, {edges.length} relationships)
      </h3>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg width={width} height={height} style={{ backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="18"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#8A8F98" />
            </marker>
          </defs>

          {/* Render directed Edges */}
          {edges.map((edge, idx) => {
            const fromPos = nodePositions.get(edge.from.toLowerCase());
            const toPos = nodePositions.get(edge.to.toLowerCase());

            if (!fromPos || !toPos) return null;

            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            return (
              <g key={idx}>
                <line
                  x1={fromPos.x}
                  y1={fromPos.y}
                  x2={toPos.x}
                  y2={toPos.y}
                  stroke="#2A2E37"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  onMouseEnter={() => setHoveredEdge({ edge, x: midX, y: midY })}
                  onMouseLeave={() => setHoveredEdge(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id.toLowerCase());
            if (!pos) return null;

            return (
              <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r="20"
                  fill="var(--accent)"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                />
                <text
                  y="35"
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize="12"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip for Relationship Type */}
        {hoveredEdge && (
          <div style={{
            position: 'absolute',
            left: `${hoveredEdge.x}px`,
            top: `${hoveredEdge.y}px`,
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--accent)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            color: 'var(--text-primary)',
            pointerEvents: 'none',
            transform: 'translate(-50%, -100%)',
            zIndex: 10,
          }}>
            Type: {hoveredEdge.edge.type}
          </div>
        )}
      </div>
    </div>
  );
};
