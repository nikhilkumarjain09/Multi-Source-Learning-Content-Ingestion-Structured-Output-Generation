import React from 'react';
import { FileText } from 'lucide-react';

interface SummaryPanelProps {
  summary: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '15px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <FileText size={16} color="var(--accent)" />
        Document Summary
      </h3>
      <div style={{
        color: 'var(--text-primary)',
        fontSize: '14px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
      }}>
        {summary}
      </div>
    </div>
  );
};
