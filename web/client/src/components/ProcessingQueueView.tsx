import React from 'react';
import { Clock, CheckCircle2, Cpu, Database, Network, ArrowRight, Play, RefreshCw } from 'lucide-react';

interface ProcessingQueueViewProps {
  isProcessing?: boolean;
  activeFilename?: string | null;
}

export const ProcessingQueueView: React.FC<ProcessingQueueViewProps> = ({
  isProcessing = false,
  activeFilename = null,
}) => {
  const pipelineStages = [
    { name: 'Content Preparation', desc: 'Identifies file format and extracts clear text content', icon: Cpu, status: 'completed' },
    { name: 'Document Formatting', desc: 'Standardizes layout and prepares document structure', icon: CheckCircle2, status: 'completed' },
    { name: 'AI Knowledge Analysis', desc: 'Identifies key topics, definitions, and connections', icon: Network, status: isProcessing ? 'active' : 'completed' },
    { name: 'Quality Verification', desc: 'Verifies structured output clarity and accuracy', icon: CheckCircle2, status: isProcessing ? 'pending' : 'completed' },
    { name: 'Secure Knowledge Indexing', desc: 'Saves topics and links related learning materials', icon: Database, status: isProcessing ? 'pending' : 'completed' },
    { name: 'Semantic Search Indexing', desc: 'Indexes content to enable fast, intelligent search', icon: Cpu, status: isProcessing ? 'pending' : 'completed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Activity & Analysis Log
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Live status of content preparation, AI knowledge analysis, quality checks, and search indexing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isProcessing ? 'badge-blue' : 'badge-green'}`}>
            {isProcessing ? 'Analysis Active' : 'System Ready'}
          </span>
        </div>
      </div>

      {/* Processing Banner */}
      {isProcessing && activeFilename && (
        <div style={{
          backgroundColor: 'var(--accent-glow)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <RefreshCw size={24} color="var(--accent)" className="spinner" />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Currently Processing: {activeFilename}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Analyzing content structure, mapping topics, and building learning connections...
            </p>
          </div>
        </div>
      )}

      {/* Stage Flow Visualization Cards */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.5rem',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          Analysis Progress
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isDone = stage.status === 'completed';
            const isActive = stage.status === 'active';

            return (
              <div
                key={stage.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: isActive
                    ? 'var(--accent-glow)'
                    : isDone
                    ? 'var(--bg-base)'
                    : 'var(--bg-surface)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--success)' : isActive ? 'var(--accent)' : 'var(--border-color)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '13px',
                }}>
                  {idx + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {stage.name}
                    </h4>
                    {isDone && <span className="badge badge-green">Ready</span>}
                    {isActive && <span className="badge badge-blue">Running</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
