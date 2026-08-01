import React, { useState } from 'react';
import { Layers, Search, Network, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NavTab } from './Sidebar';

interface ConceptsViewProps {
  concepts: any[];
  onSelectTopic: (topicName: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const ConceptsView: React.FC<ConceptsViewProps> = ({
  concepts,
  onSelectTopic,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  const filtered = concepts.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Concepts Index ({concepts.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Catalog of canonical concepts extracted by LLM provider analysis across all ingested workspace materials.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter concepts by name or description text..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
        />
      </div>

      {/* Concept Grid */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <Layers size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No concepts match your filter criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map((concept) => (
            <div
              key={concept.id}
              className="card-hover"
              onClick={() => {
                onSelectTopic(concept.name);
                onNavigateTab('graph');
              }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {concept.name}
                  </h3>
                  <span className="badge badge-purple">
                    <CheckCircle2 size={10} /> Canonical
                  </span>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45,
                  marginBottom: '1rem',
                }}>
                  {concept.description || 'No detailed description available.'}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-color)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="badge badge-blue">{concept.documentCount || 1} Docs</span>
                  {concept.relationshipCount > 0 && (
                    <span className="badge badge-green">{concept.relationshipCount} Edges</span>
                  )}
                </div>

                <span style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                  Inspect Graph <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
