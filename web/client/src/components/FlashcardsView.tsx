import React, { useState } from 'react';
import {
  BookOpen,
  RotateCw,
  Search,
  Shuffle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Printer,
  Sparkles,
} from 'lucide-react';
function exportFlashcardsJSON(flashcards: any[]): string {
  return JSON.stringify(flashcards, null, 2);
}

function exportFlashcardsCSV(flashcards: any[]): string {
  const headers = ['Concept', 'Question', 'Answer'];
  const rows = flashcards.map(f => [
    `"${(f.conceptName || '').replace(/"/g, '""')}"`,
    `"${(f.question || '').replace(/"/g, '""')}"`,
    `"${(f.answer || '').replace(/"/g, '""')}"`,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

interface FlashcardsViewProps {
  flashcards: any[];
  topicName?: string | null;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  topicName,
}) => {
  const [query, setQuery] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = flashcards.filter(
    (f) =>
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase()) ||
      (f.conceptName || '').toLowerCase().includes(query.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const data = exportFlashcardsJSON(filtered);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topicName || 'flashcards').toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const data = exportFlashcardsCSV(filtered);
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topicName || 'flashcards').toLowerCase().replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Flashcard Study Decks ({filtered.length})
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Interactive question & answer study cards generated automatically from LLM concept extraction.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            className={studyMode ? 'btn-primary' : 'btn-secondary'}
            onClick={() => {
              setStudyMode(!studyMode);
              setStudyIndex(0);
              setIsFlipped(false);
            }}
          >
            <Sparkles size={16} />
            <span>{studyMode ? 'Exit Study Mode' : 'Launch Study Mode'}</span>
          </button>

          <button className="btn-secondary" onClick={handleExportJSON} title="Export JSON">
            <Download size={14} /> JSON
          </button>
          <button className="btn-secondary" onClick={handleExportCSV} title="Export CSV">
            <Download size={14} /> CSV
          </button>
          <button className="btn-secondary" onClick={handlePrint} title="Print Deck">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Interactive 3D Study Mode Carousel */}
      {studyMode && filtered.length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
            CARD {studyIndex + 1} OF {filtered.length} — {filtered[studyIndex]?.conceptName || 'General Topic'}
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: '100%',
              maxWidth: '540px',
              minHeight: '260px',
              cursor: 'pointer',
              perspective: '1000px',
            }}
          >
            <div style={{
              width: '100%',
              minHeight: '260px',
              position: 'relative',
              transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}>
              {/* Question Front */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                backgroundColor: 'var(--bg-base)',
                border: '2px solid var(--accent)',
                borderRadius: 'var(--border-radius-md)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
              }}>
                <span className="badge badge-blue" style={{ marginBottom: '1rem' }}>QUESTION (Click to Flip)</span>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  {filtered[studyIndex]?.question}
                </h3>
              </div>

              {/* Answer Back */}
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                backgroundColor: 'var(--bg-surface)',
                border: '2px solid var(--success)',
                borderRadius: 'var(--border-radius-md)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transform: 'rotateY(180deg)',
              }}>
                <span className="badge badge-green" style={{ marginBottom: '1rem' }}>ANSWER</span>
                <p style={{ fontSize: '16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {filtered[studyIndex]?.answer}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn-secondary"
              disabled={studyIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setStudyIndex(Math.max(0, studyIndex - 1));
              }}
            >
              <ChevronLeft size={16} /> Previous
            </button>

            <button
              className="btn-secondary"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <RotateCw size={16} /> Flip Card
            </button>

            <button
              className="btn-secondary"
              disabled={studyIndex === filtered.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setStudyIndex(Math.min(filtered.length - 1, studyIndex + 1));
              }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Search Input Bar */}
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
          placeholder="Filter flashcards by question or answer keyword..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
        />
      </div>

      {/* Grid of Flashcard Decks */}
      {filtered.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-md)',
          padding: '3rem 1rem',
          textAlign: 'center',
        }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>No flashcards available matching filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {filtered.map((card) => (
            <div
              key={card.id}
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-purple">
                    {card.conceptName || 'Core Concept'}
                  </span>

                  <button
                    onClick={() => handleCopy(card.id, `Q: ${card.question}\nA: ${card.answer}`)}
                    style={{ color: copiedId === card.id ? 'var(--success)' : 'var(--text-muted)', fontSize: '12px' }}
                  >
                    {copiedId === card.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '2px' }}>
                    QUESTION
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {card.question}
                  </h4>
                </div>

                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--success)', marginBottom: '2px' }}>
                    ANSWER
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                    {card.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
