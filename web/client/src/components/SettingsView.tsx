import React from 'react';
import { Cpu, Database, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Workspace & System Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Inspect AI intelligence engine status, enterprise storage configuration, and search indexing options.
        </p>
      </div>

      {/* Settings Grid Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '720px' }}>
        {/* AI Intelligence Status */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Cpu size={20} color="var(--accent)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                AI Learning Intelligence Engine
              </h3>
            </div>
            <span className="badge badge-green">
              <CheckCircle2 size={10} /> Operational
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            High-performance AI model active for content analysis, knowledge extraction, and learning path generation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AI Intelligence Model</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>High-Performance Llama 3.3</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quality Assurance</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>Automatic Output Verification</div>
            </div>
          </div>
        </div>

        {/* Knowledge Storage & Indexing */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Database size={20} color="var(--success)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Enterprise Knowledge Storage & Indexing
              </h3>
            </div>
            <span className="badge badge-green">
              <CheckCircle2 size={10} /> Connected & Synced
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Secure cloud knowledge repository with active full-text and semantic search indexing.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Storage Status</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>Encrypted Cloud Repository</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Search Capabilities</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>Full-Text & Semantic Search</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
