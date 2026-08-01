import React from 'react';
import { Download, BookOpen, Route, FileCode2, Network, CheckCircle2 } from 'lucide-react';
import { exportFlashcardsJSON, exportFlashcardsCSV } from '../../../../src/outputs/flashcardExport';

interface ExportsViewProps {
  flashcards: any[];
  concepts: any[];
  summaryText?: string | null;
  topicName?: string | null;
}

export const ExportsView: React.FC<ExportsViewProps> = ({
  flashcards,
  concepts,
  summaryText,
  topicName,
}) => {
  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleExportFlashcardsJSON = () => {
    const data = exportFlashcardsJSON(flashcards);
    downloadFile(data, `${(topicName || 'flashcards').toLowerCase().replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const handleExportFlashcardsCSV = () => {
    const data = exportFlashcardsCSV(flashcards);
    downloadFile(data, `${(topicName || 'flashcards').toLowerCase().replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  const handleExportConceptsJSON = () => {
    const data = JSON.stringify(concepts, null, 2);
    downloadFile(data, 'concepts_export.json', 'application/json');
  };

  const handleExportSummaryMarkdown = () => {
    const content = `# Summary Export: ${topicName || 'Document'}\n\n${summaryText || 'No summary text.'}`;
    downloadFile(content, `${(topicName || 'summary').toLowerCase().replace(/\s+/g, '_')}.md`, 'text/markdown');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          Exports Hub
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          One-click exports for flashcard decks (JSON/CSV), canonical concepts catalog, summary markdown, and concept graphs.
        </p>
      </div>

      {/* Grid of Exporters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <BookOpen size={24} color="var(--warning)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Flashcards Deck Export
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Export question & answer flashcard pairs in standard JSON or CSV formats.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={handleExportFlashcardsJSON}>
              <Download size={14} /> JSON ({flashcards.length})
            </button>
            <button className="btn-secondary" onClick={handleExportFlashcardsCSV}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <FileCode2 size={24} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Summary Markdown Export
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Download executive & technical summaries formatted in clean markdown.
          </p>
          <button className="btn-primary" onClick={handleExportSummaryMarkdown}>
            <Download size={14} /> Markdown (.md)
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.5rem' }}>
          <Network size={24} color="var(--purple-accent)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Concepts & Graph JSON Export
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Download complete canonical concepts registry and graph topology in JSON schema format.
          </p>
          <button className="btn-primary" onClick={handleExportConceptsJSON}>
            <Download size={14} /> Concepts JSON ({concepts.length})
          </button>
        </div>
      </div>
    </div>
  );
};
