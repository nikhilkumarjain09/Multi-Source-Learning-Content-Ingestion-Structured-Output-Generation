import React, { useState } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  FileCode,
  Tag,
  Filter,
  X,
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface DocumentsViewProps {
  documents: any[];
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onOpenUpload,
  onDeleteDocument,
}) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string>('');

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename.toLowerCase().includes(query.toLowerCase());
    const matchesType = selectedType === 'all' || doc.sourceType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Document Workspace ({documents.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Manage, filter, and inspect ingested learning files across PDF, Text, and Video/Audio transcript sources.
          </p>
        </div>

        <button className="btn-primary" onClick={onOpenUpload}>
          <UploadCloud size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search files by filename..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={14} color="var(--text-muted)" />
          {['all', 'pdf', 'transcript', 'video_audio', 'video_transcript'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '4px 10px',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: selectedType === type ? 'var(--accent)' : 'var(--bg-base)',
                color: selectedType === type ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px border-color var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <FileText size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No matching documents found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Try resetting your search query or uploading a new learning document.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="card-hover"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FileText size={22} color="var(--accent)" />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3
                        title={doc.filename}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          lineHeight: 1.3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '200px',
                          cursor: 'default',
                        }}
                      >
                        {doc.filename}
                      </h3>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Ingested {new Date(doc.ingestedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {doc.summary && (
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical' as any,
                    overflow: 'hidden',
                    lineHeight: 1.45,
                  }}>
                    {doc.summary}
                  </p>
                )}
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-color)',
                  marginTop: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-blue">{doc.sourceType}</span>
                    <span className="badge badge-purple">{doc.conceptCount || 0} Concepts</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      title="Inspect Summary & Metadata"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(doc.id);
                        setConfirmDeleteName(doc.filename);
                      }}
                      title="Delete Document"
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-base)',
                        color: 'var(--error)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inspect Document Drawer Modal */}
      {selectedDoc && (
        <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Document Details: {selectedDoc.filename}
              </h3>
              <button onClick={() => setSelectedDoc(null)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                backgroundColor: 'var(--bg-base)',
                padding: '1rem',
                borderRadius: 'var(--border-radius-sm)',
                border: '1px solid var(--border-color)',
              }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.4rem' }}>
                  Document Summary
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedDoc.summary || 'No summary available.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID</div>
                  <div style={{ fontSize: '12px', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{selectedDoc.id}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Source Type</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedDoc.sourceType}</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Word Count</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{selectedDoc.wordCount || 0} words</div>
                </div>
                <div style={{ backgroundColor: 'var(--bg-base)', padding: '0.75rem', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ingested At</div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>{new Date(selectedDoc.ingestedAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDeleteId}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${confirmDeleteName}"? This will also remove all extracted concepts, flashcards, and summaries linked to it. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
        cancelLabel="Keep Document"
        variant="danger"
        onConfirm={() => {
          if (confirmDeleteId) onDeleteDocument(confirmDeleteId);
          setConfirmDeleteId(null);
          setConfirmDeleteName('');
        }}
        onCancel={() => {
          setConfirmDeleteId(null);
          setConfirmDeleteName('');
        }}
      />
    </div>
  );
};
