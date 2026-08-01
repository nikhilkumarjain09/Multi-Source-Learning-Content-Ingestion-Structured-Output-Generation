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
    { name: 'File Ingestion & Parsing', desc: 'Identifies file format via registry, extracts raw text streams', icon: Cpu, status: 'completed' },
    { name: 'Document Normalization', desc: 'Standardizes into canonical SourceDocument format, checks script i18n', icon: CheckCircle2, status: 'completed' },
    { name: 'LLM Concept Extraction', desc: 'Tokens chunking, provider invocation (Groq/NVIDIA), concept extraction', icon: Network, status: isProcessing ? 'active' : 'completed' },
    { name: 'Zod Schema Validation', desc: 'Validates JSON against schema, triggers repair retry on malformed output', icon: CheckCircle2, status: isProcessing ? 'pending' : 'completed' },
    { name: 'Database Persistence', desc: 'Saves entities to MongoDB, resolves cross-document canonical deduplication', icon: Database, status: isProcessing ? 'pending' : 'completed' },
    { name: 'Vector Embedding Generation', desc: 'Computes 128-dim TF-IDF n-gram vectors for nearest-neighbor similarity search', icon: Cpu, status: isProcessing ? 'pending' : 'completed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Real-Time Processing Pipeline Queue
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Live status of ingestion stages, LLM provider requests, schema validation retries, and MongoDB vector indexing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isProcessing ? 'badge-blue' : 'badge-green'}`}>
            {isProcessing ? 'Processing Active' : 'Pipeline Idle / Ready'}
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
              Executing LLM prompt extraction and cross-chunk concept reconciliation...
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
          Pipeline Stage Progression
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
