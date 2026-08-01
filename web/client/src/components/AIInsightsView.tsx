import React, { useState, useEffect } from 'react';
import { Sparkles, Network, AlertTriangle, Lightbulb, ArrowRight, BrainCircuit, ShieldAlert } from 'lucide-react';
import { NavTab } from './Sidebar';
import { Skeleton } from './Skeleton';

interface AIInsightsViewProps {
  onSelectTopic: (topic: string) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  onSelectTopic,
  onNavigateTab,
}) => {
  const [insights, setInsights] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Skeleton width="280px" height="24px" style={{ marginBottom: '8px' }} />
            <Skeleton width="420px" height="16px" />
          </div>
          <Skeleton width="180px" height="28px" borderRadius="12px" />
        </div>

        {/* Hub Concepts Card Skeleton */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1.5rem',
        }}>
          <Skeleton width="240px" height="20px" style={{ marginBottom: '1.25rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', padding: '1rem' }}>
                <Skeleton width="60%" height="16px" style={{ marginBottom: '8px' }} />
                <Skeleton width="90%" height="14px" style={{ marginBottom: '6px' }} />
                <Skeleton width="80%" height="14px" style={{ marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="80px" height="20px" borderRadius="10px" />
                  <Skeleton width="16px" height="16px" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Prerequisites Card Skeleton */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1.5rem',
        }}>
          <Skeleton width="320px" height="20px" style={{ marginBottom: '1.25rem' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <Skeleton width="20px" height="20px" borderRadius="50%" />
                  <div>
                    <Skeleton width="300px" height="15px" style={{ marginBottom: '4px' }} />
                    <Skeleton width="180px" height="12px" />
                  </div>
                </div>
                <Skeleton width="100px" height="30px" borderRadius="6px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hubConcepts = insights?.hubConcepts || [];
  const foundationalConcepts = insights?.foundationalConcepts || [];
  const gaps = insights?.knowledgeGaps || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} color="var(--purple-accent)" />
            AI Knowledge Insights & Learning Recommendations
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Automated topic connectivity analysis, core learning anchors, and recommended study sequences.
          </p>
        </div>

        <span className="badge badge-purple">Topic Connectivity Index: {insights?.graphDensityScore || '1.25'}</span>
      </div>

      {/* Top Connected Hub Concepts */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BrainCircuit size={18} color="var(--accent)" />
          Core Knowledge Anchors (Highly Connected Topics)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {hubConcepts.map((hub: any) => (
            <div
              key={hub.id}
              className="card-hover"
              onClick={() => {
                onSelectTopic(hub.name);
                onNavigateTab('graph');
              }}
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '1rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {hub.name}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                {hub.description || 'Core concept in knowledge topology.'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-blue">{hub.totalDegree || 3} Connections</span>
                <ArrowRight size={14} color="var(--accent)" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Missing Prerequisite & Gap Alerts */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} color="var(--error)" />
          Prerequisite Dependency Alerts & Sequence Recommendations
        </h3>

        {gaps.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            No prerequisite dependency conflicts detected in current concept graph.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {gaps.map((gap: any, idx: number) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle size={18} color="var(--warning)" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {gap.recommendation}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Prerequisite: {gap.prerequisiteName} → Target: {gap.targetName}
                    </span>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ fontSize: '12px' }}
                  onClick={() => {
                    onSelectTopic(gap.prerequisiteName);
                    onNavigateTab('learning-paths');
                  }}
                >
                  View Sequence
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
