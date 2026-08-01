import React, { useState } from 'react';
import { Layers, Download } from 'lucide-react';

export interface FlashcardItem {
  id?: string;
  question: string;
  answer: string;
  conceptName?: string;
}

interface FlashcardListProps {
  flashcards: FlashcardItem[];
  topicName?: string;
}

export const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, topicName }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.25rem',
        color: 'var(--text-muted)',
      }}>
        No flashcards generated yet.
      </div>
    );
  }

  const exportJSON = () => {
    const jsonStr = JSON.stringify(flashcards, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topicName || 'flashcards').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['Question', 'Answer'];
    const rows = flashcards.map(f => [
      `"${f.question.replace(/"/g, '""')}"`,
      `"${f.answer.replace(/"/g, '""')}"`,
    ].join(','));
    const csvStr = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topicName || 'flashcards').toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Layers size={16} color="var(--accent)" />
          Generated Flashcards ({flashcards.length})
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={exportJSON}
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Download size={13} />
            JSON
          </button>
          <button
            onClick={exportCSV}
            style={{
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Download size={13} />
            CSV
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {flashcards.map((card, idx) => {
          const isExpanded = expandedId === idx;
          return (
            <div
              key={idx}
              onClick={() => setExpandedId(isExpanded ? null : idx)}
              style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>
                Q: {card.question}
              </div>
              {isExpanded && (
                <div style={{
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}>
                  A: {card.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
