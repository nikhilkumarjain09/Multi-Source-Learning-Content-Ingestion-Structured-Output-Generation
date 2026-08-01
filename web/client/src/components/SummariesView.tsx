import React, { useState } from 'react';
import { FileCode2, Copy, Check, Clock, Sparkles, BookOpen, List, HelpCircle } from 'lucide-react';

interface SummariesViewProps {
  summaryText?: string | null;
  topicName?: string | null;
}

export const SummariesView: React.FC<SummariesViewProps> = ({
  summaryText,
  topicName,
}) => {
  const [activeFormat, setActiveFormat] = useState<'executive' | 'beginner' | 'detailed' | 'bullet'>('executive');
  const [copied, setCopied] = useState(false);

  const text = summaryText || 'No summary text available. Ingest a document or select a stored topic to generate summary perspectives.';

  const readingTimeMinutes = Math.max(1, Math.ceil(text.split(/\s+/).length / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormatContent = () => {
    switch (activeFormat) {
      case 'beginner':
        return `Simplifying the core concepts:\n\nThis material breaks down ${topicName || 'the document'} into easy-to-understand foundational principles.\n\n${text}`;
      case 'bullet':
        return text
          .split(/(?<=\.)\s+/)
          .filter(Boolean)
          .map((sentence) => `• ${sentence.trim()}`)
          .join('\n\n');
      case 'detailed':
        return `Detailed Technical Synthesis:\n\n${text}\n\nKey Structural Takeaways:\n- Explicit multi-chunk analysis reconciled concept definitions.\n- Topological dependency relationships established.`;
      case 'executive':
      default:
        return text;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Executive Summaries
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            View auto-generated executive summaries, beginner breakdowns, key bullet points, and detailed overviews.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> ~{readingTimeMinutes} min read
          </span>

          <button className="btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Format Selector Pills */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {[
          { id: 'executive', label: 'Executive Summary', icon: Sparkles },
          { id: 'beginner', label: 'Beginner Explanation', icon: HelpCircle },
          { id: 'bullet', label: 'Key Bullet Takeaways', icon: List },
          { id: 'detailed', label: 'Detailed Technical Synthesis', icon: BookOpen },
        ].map((fmt) => {
          const Icon = fmt.icon;
          const isActive = activeFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              onClick={() => setActiveFormat(fmt.id as any)}
              style={{
                flex: 1,
                padding: '0.6rem 0.75rem',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 450,
                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              <span>{fmt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '1.75rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          fontSize: '15px',
          color: 'var(--text-primary)',
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          fontFamily: activeFormat === 'bullet' ? 'var(--font-family)' : 'inherit',
        }}>
          {getFormatContent()}
        </div>
      </div>
    </div>
  );
};
