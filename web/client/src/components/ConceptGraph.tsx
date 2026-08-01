import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Network, ZoomIn, ZoomOut, Maximize2, X } from 'lucide-react';

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

export interface GraphFlashcard {
  id?: string;
  conceptName?: string;
  question: string;
  answer: string;
}

interface ConceptGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  flashcards?: GraphFlashcard[];
}

// Edge type visual config per DESIGN_SYSTEM.md color palette
const EDGE_STYLES: Record<string, { color: string; dashArray: string; label: string }> = {
  prerequisite: { color: '#F2555A', dashArray: 'none', label: 'Prerequisite' },
  'related-to': { color: '#5B8CFF', dashArray: '6,3', label: 'Related To' },
  'part-of': { color: '#3ECF8E', dashArray: '2,4', label: 'Part Of' },
};

const DEFAULT_EDGE_STYLE = { color: '#8A8F98', dashArray: '4,4', label: 'Unknown' };

function getEdgeStyle(type: string) {
  return EDGE_STYLES[type] || DEFAULT_EDGE_STYLE;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({ nodes, edges, flashcards = [] }) => {
  // Pan & zoom state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 450 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Click-to-expand state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Hover tooltip state
  const [hoveredEdge, setHoveredEdge] = useState<{ edge: GraphEdge; x: number; y: number } | null>(null);

  const BASE_W = 800;
  const BASE_H = 450;

  // Reset view when data changes
  useEffect(() => {
    setViewBox({ x: 0, y: 0, w: BASE_W, h: BASE_H });
    setSelectedNodeId(null);
  }, [nodes, edges]);

  // --- Pan handlers (MUST BE TOP-LEVEL FOR REACT HOOK RULES) ---
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.x) * scaleX;
    const dy = (e.clientY - panStart.y) * scaleY;
    setViewBox(v => ({ ...v, x: v.x - dx, y: v.y - dy }));
    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStart, viewBox]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // --- Zoom handlers ---
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox(v => {
      const newW = v.w * factor;
      const newH = v.h * factor;
      const dx = (v.w - newW) / 2;
      const dy = (v.h - newH) / 2;
      return { x: v.x + dx, y: v.y + dy, w: newW, h: newH };
    });
  }, []);

  const zoomIn = () => {
    setViewBox(v => {
      const newW = v.w * 0.8;
      const newH = v.h * 0.8;
      return { x: v.x + (v.w - newW) / 2, y: v.y + (v.h - newH) / 2, w: newW, h: newH };
    });
  };

  const zoomOut = () => {
    setViewBox(v => {
      const newW = v.w * 1.25;
      const newH = v.h * 1.25;
      return { x: v.x + (v.w - newW) / 2, y: v.y + (v.h - newH) / 2, w: newW, h: newH };
    });
  };

  const resetView = () => {
    setViewBox({ x: 0, y: 0, w: BASE_W, h: BASE_H });
  };

  const handleNodeClick = (nodeId: string) => {
    const key = nodeId.toLowerCase();
    setSelectedNodeId(prev => prev === key ? null : key);
  };

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

  const centerX = BASE_W / 2;
  const centerY = BASE_H / 2;
  const radius = Math.min(BASE_W, BASE_H) * 0.35;

  // Calculate radial layout positions for nodes
  const nodePositions = new Map<string, { x: number; y: number; label: string; description: string }>();
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length;
    const x = nodes.length === 1 ? centerX : centerX + radius * Math.cos(angle);
    const y = nodes.length === 1 ? centerY : centerY + radius * Math.sin(angle);
    nodePositions.set(node.id.toLowerCase(), { x, y, label: node.label, description: node.description || '' });
  });

  // Find edges connected to the selected node
  const selectedEdgeIndices = new Set<number>();
  const connectedNodeIds = new Set<string>();
  if (selectedNodeId) {
    edges.forEach((edge, idx) => {
      const fromKey = edge.from.toLowerCase();
      const toKey = edge.to.toLowerCase();
      if (fromKey === selectedNodeId || toKey === selectedNodeId) {
        selectedEdgeIndices.add(idx);
        connectedNodeIds.add(fromKey);
        connectedNodeIds.add(toKey);
      }
    });
    connectedNodeIds.add(selectedNodeId);
  }

  // Detail panel data
  const selectedNodeData = selectedNodeId ? nodePositions.get(selectedNodeId) : null;
  const selectedNodeObj = selectedNodeId ? nodes.find(n => n.id.toLowerCase() === selectedNodeId) : null;
  const relatedFlashcards = selectedNodeObj
    ? flashcards.filter(f =>
      (f.conceptName || '').toLowerCase() === selectedNodeObj.label.toLowerCase()
    )
    : [];

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

      {/* Zoom controls */}
      <div style={{
        position: 'absolute',
        top: '3.5rem',
        right: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 5,
      }}>
        {[
          { icon: <ZoomIn size={14} />, handler: zoomIn, title: 'Zoom in' },
          { icon: <ZoomOut size={14} />, handler: zoomOut, title: 'Zoom out' },
          { icon: <Maximize2 size={14} />, handler: resetView, title: 'Reset view' },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.handler}
            title={btn.title}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
        {/* SVG Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <svg
            ref={svgRef}
            width="100%"
            height={450}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            style={{
              backgroundColor: 'var(--bg-base)',
              borderRadius: '6px',
              cursor: isPanning ? 'grabbing' : 'grab',
              display: 'block',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <defs>
              {/* One arrowhead marker per edge type */}
              {Object.entries(EDGE_STYLES).map(([type, style]) => (
                <marker
                  key={type}
                  id={`arrow-${type}`}
                  markerWidth="8"
                  markerHeight="6"
                  refX="18"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill={style.color} />
                </marker>
              ))}
              <marker
                id="arrow-default"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={DEFAULT_EDGE_STYLE.color} />
              </marker>
            </defs>

            {/* Render Edges */}
            {edges.map((edge, idx) => {
              const fromPos = nodePositions.get(edge.from.toLowerCase());
              const toPos = nodePositions.get(edge.to.toLowerCase());
              if (!fromPos || !toPos) return null;

              const style = getEdgeStyle(edge.type);
              const isHighlighted = selectedNodeId ? selectedEdgeIndices.has(idx) : false;
              const isDimmed = selectedNodeId && !selectedEdgeIndices.has(idx);
              const markerId = EDGE_STYLES[edge.type] ? `arrow-${edge.type}` : 'arrow-default';

              const midX = (fromPos.x + toPos.x) / 2;
              const midY = (fromPos.y + toPos.y) / 2;

              return (
                <g key={idx}>
                  <line
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={style.color}
                    strokeWidth={isHighlighted ? 3 : 2}
                    strokeDasharray={style.dashArray}
                    strokeOpacity={isDimmed ? 0.15 : isHighlighted ? 1 : 0.7}
                    markerEnd={`url(#${markerId})`}
                    onMouseEnter={() => setHoveredEdge({ edge, x: midX, y: midY })}
                    onMouseLeave={() => setHoveredEdge(null)}
                    style={{ cursor: 'pointer', transition: 'stroke-opacity 0.2s' }}
                  />
                </g>
              );
            })}

            {/* Render Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions.get(node.id.toLowerCase());
              if (!pos) return null;

              const nodeKey = node.id.toLowerCase();
              const isSelected = nodeKey === selectedNodeId;
              const isConnected = connectedNodeIds.has(nodeKey);
              const isDimmed = selectedNodeId && !isConnected;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Glow ring for selected node */}
                  {isSelected && (
                    <circle
                      r="26"
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeOpacity="0.4"
                    />
                  )}
                  <circle
                    r="20"
                    fill={isSelected ? '#7BA4FF' : 'var(--accent)'}
                    stroke={isSelected ? '#ffffff' : isDimmed ? '#444' : '#ffffff'}
                    strokeWidth={isSelected ? 2 : 1.5}
                    fillOpacity={isDimmed ? 0.25 : 1}
                    style={{ transition: 'fill-opacity 0.2s' }}
                  />
                  <text
                    y="35"
                    textAnchor="middle"
                    fill={isDimmed ? 'var(--text-muted)' : 'var(--text-primary)'}
                    fontSize="12"
                    fontWeight="500"
                    style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Edge hover tooltip */}
          {hoveredEdge && (
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              backgroundColor: 'var(--bg-surface)',
              border: `1px solid ${getEdgeStyle(hoveredEdge.edge.type).color}`,
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              color: 'var(--text-primary)',
              pointerEvents: 'none',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              whiteSpace: 'nowrap',
            }}>
              {getEdgeStyle(hoveredEdge.edge.type).label}
            </div>
          )}

          {/* Legend - always visible */}
          <div style={{
            position: 'absolute',
            bottom: '0.75rem',
            left: '0.75rem',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            fontSize: '11px',
            color: 'var(--text-muted)',
            zIndex: 5,
          }}>
            {Object.entries(EDGE_STYLES).map(([type, style]) => (
              <span key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="24" height="8" viewBox="0 0 24 8">
                  <line
                    x1="0" y1="4" x2="24" y2="4"
                    stroke={style.color}
                    strokeWidth="2"
                    strokeDasharray={style.dashArray}
                  />
                </svg>
                <span>{style.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Detail Panel (click-to-expand) */}
        {selectedNodeId && selectedNodeData && (
          <div style={{
            width: '260px',
            flexShrink: 0,
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '1rem',
            alignSelf: 'flex-start',
            maxHeight: '420px',
            overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem',
            }}>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--accent)',
                margin: 0,
                lineHeight: 1.3,
                flex: 1,
              }}>
                {selectedNodeData.label}
              </h4>
              <button
                onClick={() => setSelectedNodeId(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  marginLeft: '8px',
                  flexShrink: 0,
                }}
                title="Close detail panel"
              >
                <X size={14} />
              </button>
            </div>

            {/* Description */}
            {selectedNodeData.description && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '4px',
                }}>
                  Description
                </div>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                  margin: 0,
                }}>
                  {selectedNodeData.description}
                </p>
              </div>
            )}

            {/* Connected edges summary */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>
                Connections ({selectedEdgeIndices.size})
              </div>
              {Array.from(selectedEdgeIndices).map(idx => {
                const edge = edges[idx];
                const style = getEdgeStyle(edge.type);
                const fromPos = nodePositions.get(edge.from.toLowerCase());
                const toPos = nodePositions.get(edge.to.toLowerCase());
                const otherLabel =
                  edge.from.toLowerCase() === selectedNodeId
                    ? (toPos?.label || edge.to)
                    : (fromPos?.label || edge.from);
                const direction = edge.from.toLowerCase() === selectedNodeId ? '\u2192' : '\u2190';

                return (
                  <div key={idx} style={{
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    padding: '3px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ color: style.color, fontWeight: 600, fontSize: '12px' }}>{direction}</span>
                    <span style={{ color: style.color, fontSize: '10px' }}>[{style.label}]</span>
                    <span>{otherLabel}</span>
                  </div>
                );
              })}
              {selectedEdgeIndices.size === 0 && (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No direct connections
                </div>
              )}
            </div>

            {/* Related flashcards */}
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}>
                Flashcards ({relatedFlashcards.length})
              </div>
              {relatedFlashcards.length > 0 ? (
                relatedFlashcards.slice(0, 5).map((fc, i) => (
                  <div key={i} style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    marginBottom: '6px',
                    fontSize: '11px',
                  }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '3px' }}>
                      Q: {fc.question}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      A: {fc.answer}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No flashcards for this concept
                </div>
              )}
              {relatedFlashcards.length > 5 && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  +{relatedFlashcards.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
