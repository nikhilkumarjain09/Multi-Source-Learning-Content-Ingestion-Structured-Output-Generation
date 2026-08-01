import React from 'react';
import { Settings, Cpu, Database, CheckCircle2, ShieldCheck, Key } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          System & Configuration Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Inspect active LLM provider endpoints, database connection states, and processing environment variables.
        </p>
      </div>

      {/* Settings Grid Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '720px' }}>
        {/* LLM Provider Status */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Cpu size={20} color="var(--accent)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                LLM Provider Integration
              </h3>
            </div>
            <span className="badge badge-green">
              <CheckCircle2 size={10} /> Active
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Configured provider: Groq / NVIDIA NIM / Anthropic API (Fallback logic enabled).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Default Model</div>
              <div style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>llama-3.3-70b-versatile</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Retry Strategy</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>1-Repair Retry on Malformed JSON</div>
            </div>
          </div>
        </div>

        {/* Database Persistence Status */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Database size={20} color="var(--success)" />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Database Persistence Engine
              </h3>
            </div>
            <span className="badge badge-green">
              <CheckCircle2 size={10} /> MongoDB Connected
            </span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Mongoose models connected with automated fallback to in-memory MongoDB for offline & testing operations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Connection String</div>
              <div style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>mongodb://localhost:27017/learning_ingestion</div>
            </div>
            <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Index Search</div>
              <div style={{ fontSize: '12px', fontWeight: 500 }}>$text Compound Indexes Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
