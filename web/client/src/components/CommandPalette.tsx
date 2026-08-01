import React, { useState, useEffect } from 'react';
import { Search, FileText, Layers, Grid, BookOpen, X, ArrowRight } from 'lucide-react';
import { NavTab } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectTopic: (topic: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectTopic,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    documents: any[];
    concepts: any[];
    topics: string[];
    flashcards: any[];
  }>({ documents: [], concepts: [], topics: [], flashcards: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          setQuery('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ documents: [], concepts: [], topics: [], flashcards: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: 0, overflow: 'hidden' }}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
        }}>
          <Search size={20} color="var(--accent)" />
          <input
            type="text"
            placeholder="Search documents, concepts, topics, flashcards... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '15px',
              color: 'var(--text-primary)',
              padding: 0,
              outline: 'none',
              boxShadow: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '0.75rem' }}>
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Searching workspace index...
            </div>
          )}

          {!loading && !query.trim() && (
            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Type a concept name, topic, or keyword to search across the entire learning workspace.
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
                flexWrap: 'wrap',
              }}>
                {['Artificial Intelligence', 'Neural Networks', 'Calculus', 'Data Structures'].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      onSelectTopic(sample);
                      onSelectTab('graph');
                      onClose();
                    }}
                    style={{
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      color: 'var(--accent)',
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!loading && query.trim() && (
            <>
              {results.topics.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    TOPICS & CONCEPTS
                  </div>
                  {results.topics.map((t) => (
                    <div
                      key={t}
                      onClick={() => {
                        onSelectTopic(t);
                        onSelectTab('graph');
                        onClose();
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Grid size={16} color="var(--accent)" />
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t}</span>
                      </div>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  ))}
                </div>
              )}

              {results.documents.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    DOCUMENTS
                  </div>
                  {results.documents.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => {
                        onSelectTab('documents');
                        onClose();
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <FileText size={16} color="var(--success)" />
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.filename}</span>
                      </div>
                      <span className="badge badge-blue">{d.sourceType}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.flashcards.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    FLASHCARDS
                  </div>
                  {results.flashcards.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        onSelectTab('flashcards');
                        onClose();
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <BookOpen size={16} color="var(--purple-accent)" />
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Q: {f.question}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.topics.length === 0 && results.documents.length === 0 && results.flashcards.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching items found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
