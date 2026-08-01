import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Layers, Network, BookOpen, Database, Cpu, TrendingUp } from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Computing workspace analytics...</div>;
  }

  const metrics = analytics?.metrics || {
    totalDocuments: 0,
    totalConcepts: 0,
    totalRelationships: 0,
    totalFlashcards: 0,
    totalSummaries: 0,
    totalEmbeddings: 0,
    averageWordsPerDocument: 0,
  };

  const sourceTypeDist = analytics?.sourceTypeDistribution || {};
  const relTypeDist = analytics?.relationshipTypeDistribution || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Platform Analytics & Knowledge Metrics
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Aggregate statistics, source type breakdown, relationship distribution, and average extraction metrics.
        </p>
      </div>

      {/* Key Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Total Ingested Files</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>{metrics.totalDocuments}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Avg {metrics.averageWordsPerDocument} words/doc</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Concepts Extracted</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{metrics.totalConcepts}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Canonical Deduplicated</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Graph Edges</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--purple-accent)' }}>{metrics.totalRelationships}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Prerequisites & Related</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Vector Embeddings</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{metrics.totalEmbeddings}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>128-dim TF-IDF Vectors</div>
        </div>
      </div>

      {/* Visual Distribution Progress Bar Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Source Type Breakdown */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Source File Format Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(sourceTypeDist).map(([type, count]) => {
              const pct = metrics.totalDocuments > 0 ? Math.round(((count as number) / metrics.totalDocuments) * 100) : 0;
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{type}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count as number} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Relationship Type Breakdown */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Concept Relationship Types
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {['prerequisite', 'related-to', 'part-of'].map((relType) => {
              const count = (relTypeDist as any)[relType] || 0;
              const pct = metrics.totalRelationships > 0 ? Math.round((count / metrics.totalRelationships) * 100) : 0;
              const colors: Record<string, string> = {
                prerequisite: '#F2555A',
                'related-to': '#5B8CFF',
                'part-of': '#3ECF8E',
              };

              return (
                <div key={relType}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{relType}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: colors[relType] || 'var(--accent)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
