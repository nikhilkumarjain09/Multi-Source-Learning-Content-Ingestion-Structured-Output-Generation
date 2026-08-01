import React, { useState } from 'react';
import { Grid, Search, ArrowRight, Layers, Network } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopicsViewProps {
  topics: string[];
  onSelectTopic: (topic: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const TopicsView: React.FC<TopicsViewProps> = ({
  topics,
  onSelectTopic,
  onNavigateTab,
}) => {
  const [query, setQuery] = useState('');

  const filtered = topics.filter((t) => t.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Topic Matrix ({topics.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Browse and filter extracted topics across the multi-source ingested knowledge base.
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
          placeholder="Filter stored topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
        />
      </div>

      {/* Topic Grid */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <Grid size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No topics match filter query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {filtered.map((topic) => (
            <div
              key={topic}
              className="card-hover"
              onClick={() => {
                onSelectTopic(topic);
                onNavigateTab('graph');
              }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Layers size={20} color="var(--accent)" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {topic}
                </span>
              </div>

              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
