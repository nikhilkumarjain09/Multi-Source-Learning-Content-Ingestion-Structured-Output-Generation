import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_COLORS = {
  danger:  { bg: '#EF4444', hover: '#DC2626', icon: '#EF4444', badge: 'rgba(239,68,68,0.12)', badgeBorder: 'rgba(239,68,68,0.3)' },
  warning: { bg: '#F59E0B', hover: '#D97706', icon: '#F59E0B', badge: 'rgba(245,158,11,0.12)', badgeBorder: 'rgba(245,158,11,0.3)' },
  info:    { bg: '#6366F1', hover: '#4F46E5', icon: '#6366F1', badge: 'rgba(99,102,241,0.12)', badgeBorder: 'rgba(99,102,241,0.3)' },
};

const DIALOG_CSS = `
  @keyframes confirmOverlayIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes confirmCardIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1)    translateY(0); }
  }
`;

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const colors = VARIANT_COLORS[variant];

  // Close on Escape key
  useEffect(() => {
    if (!isOpen || isLoading) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isLoading, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <style>{DIALOG_CSS}</style>

      {/* Overlay */}
      <div
        onClick={() => !isLoading && onCancel()}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: 'confirmOverlayIn 0.2s ease both',
        }}
      >
        {/* Dialog Card */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: 16,
            padding: '1.75rem',
            maxWidth: 400,
            width: '90vw',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            animation: 'confirmCardIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Icon badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: colors.badge,
                border: `1px solid ${colors.badgeBorder}`,
                flexShrink: 0,
              }}>
                <AlertTriangle size={20} color={colors.icon} />
              </div>
              <h3 style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary, #111827)',
                margin: 0,
              }}>
                {title}
              </h3>
            </div>
            <button
              onClick={() => !isLoading && onCancel()}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                color: 'var(--text-muted, #9ca3af)',
                padding: 4,
                borderRadius: 6,
                display: 'flex',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.color = 'var(--text-primary, #111827)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.color = 'var(--text-muted, #9ca3af)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Message */}
          <p style={{
            fontSize: 13.5,
            color: 'var(--text-secondary, #4b5563)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}>
            {message}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
            <button
              onClick={() => !isLoading && onCancel()}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                background: 'var(--bg-base, #f9fafb)',
                border: '1px solid var(--border-color, #e5e7eb)',
                color: 'var(--text-secondary, #4b5563)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = 'var(--bg-hover, #f3f4f6)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = 'var(--bg-base, #f9fafb)')}
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: isLoading ? 'var(--border-color, #9ca3af)' : colors.bg,
                border: 'none',
                color: '#ffffff',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = colors.hover;
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = colors.bg;
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={15} className="spinner" />
                  Logging out...
                </>
              ) : (
                confirmLabel
              )}
            </button>
          </div>

          {/* Keyboard hint */}
          {!isLoading && (
            <p style={{ fontSize: 11, color: 'var(--text-muted, #9ca3af)', textAlign: 'center', marginTop: '0.85rem' }}>
              Press <kbd style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Enter</kbd> to confirm &nbsp;·&nbsp;
              <kbd style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: 4, padding: '1px 5px', fontSize: 10 }}>Esc</kbd> to cancel
            </p>
          )}
        </div>
      </div>
    </>
  );
};
