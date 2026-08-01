import React from 'react';
import {
  FileText,
  Layers,
  Network,
  BookOpen,
  UploadCloud,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { BRANDING } from '../config/branding';

interface DashboardViewProps {
  analytics: any;
  documents: any[];
  concepts: any[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectTopic: (topic: string) => void;
  onOpenUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  documents,
  concepts,
  onNavigateTab,
  onSelectTopic,
  onOpenUpload,
}) => {
  const metrics = analytics?.metrics || {
    totalDocuments: documents.length,
    totalConcepts: concepts.length,
    totalRelationships: Math.round(concepts.length * 1.5),
    totalFlashcards: concepts.length * 2,
  };

  const statCards = [
    { label: 'Ingested Documents', value: metrics.totalDocuments, icon: FileText, color: 'var(--accent)', tab: 'documents' as NavTab },
    { label: 'Extracted Concepts', value: metrics.totalConcepts, icon: Layers, color: 'var(--success)', tab: 'concepts' as NavTab },
    { label: 'Knowledge Graph Edges', value: metrics.totalRelationships, icon: Network, color: 'var(--purple-accent)', tab: 'graph' as NavTab },
    { label: 'Study Flashcards', value: metrics.totalFlashcards, icon: BookOpen, color: 'var(--warning)', tab: 'flashcards' as NavTab },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(91, 140, 255, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(91, 140, 255, 0.25)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Sparkles size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {BRANDING.APP_NAME} Learning Workspace Overview
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '600px' }}>
            Multi-source ingestion pipeline active. Ingest PDFs, text transcripts, or video/audio captions to extract concepts, generate topological learning roadmaps, and explore knowledge graphs.
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenUpload}>
          <UploadCloud size={18} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
      }}>
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="card-hover"
              onClick={() => onNavigateTab(card.tab)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {card.label}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-base)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>

              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {card.value}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11px', color: 'var(--success)' }}>
                <TrendingUp size={12} />
                <span>Indexed & Ready</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Layout: Recent Documents & Popular Topics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '1.5rem',
      }}>
        {/* Recent Ingested Documents Table */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Ingested Workspace Files
            </h3>
            <button
              onClick={() => onNavigateTab('documents')}
              style={{ fontSize: '12px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ArrowRight size={12} />
            </button>
          </div>

          {documents.length === 0 ? (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px dashed var(--border-color)',
            }}>
              <UploadCloud size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No learning documents yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '1rem' }}>
                Upload your first document to let {BRANDING.APP_NAME} generate summaries, flashcards, and knowledge graphs.
              </p>
              <button className="btn-secondary" onClick={onOpenUpload}>
                Ingest Seed File
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} color="var(--accent)" />
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {doc.filename}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {doc.wordCount || 0} words • Ingested {new Date(doc.ingestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-green">
                      <CheckCircle2 size={10} /> Parsed
                    </span>
                    <span className="badge badge-blue">{doc.sourceType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Topics & AI Highlights Side Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.25rem',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
              Extracted Knowledge Topics
            </h3>

            {concepts.length === 0 ? (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Concepts will populate automatically upon document ingestion.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {concepts.slice(0, 10).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectTopic(c.name);
                      onNavigateTab('graph');
                    }}
                    style={{
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.color = 'var(--accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feature Highlight Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-md)',
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Clock size={16} color="var(--purple-accent)" />
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Quick Action Tasks
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => onNavigateTab('flashcards')}
              >
                <BookOpen size={14} color="var(--warning)" /> Launch Study Mode Flashcards
              </button>
              <button
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => onNavigateTab('learning-paths')}
              >
                <ArrowRight size={14} color="var(--success)" /> View Topological Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
