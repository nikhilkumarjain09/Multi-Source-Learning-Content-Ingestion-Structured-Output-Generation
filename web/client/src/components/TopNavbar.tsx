import React from 'react';
import { Search, Plus, Bell, Command, User, Sparkles } from 'lucide-react';
import { NavTab } from './Sidebar';
import { UserProfile } from '../auth/AuthContext';

interface TopNavbarProps {
  activeTab: NavTab;
  selectedTopic?: string | null;
  user?: UserProfile | null;
  onOpenUploadModal: () => void;
  onOpenCommandPalette: () => void;
  onOpenProfileModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  selectedTopic,
  user,
  onOpenUploadModal,
  onOpenCommandPalette,
  onOpenProfileModal,
}) => {
  const getTabLabel = (tab: NavTab) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'documents': return 'Document Workspace';
      case 'queue': return 'Real-Time Processing Queue';
      case 'graph': return 'Knowledge Graph Explorer';
      case 'concepts': return 'Concepts Index';
      case 'flashcards': return 'Flashcard Decks & Study Mode';
      case 'learning-paths': return 'Topological Learning Paths';
      case 'summaries': return 'Multi-Format Summary Engine';
      case 'ai-insights': return 'AI Knowledge Insights';
      case 'topics': return 'Topic Matrix';
      case 'analytics': return 'Platform Analytics';
      case 'exports': return 'Exports Hub';
      case 'settings': return 'System Settings';
      default: return 'Workspace';
    }
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'AI';
  const displayName = user?.fullName || 'Senior Engineer';

  return (
    <header style={{
      height: 'var(--topbar-height)',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90,
    }}>
      {/* Breadcrumb Path */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>CognitiveAI</span>
        <span style={{ color: 'var(--border-color)', fontSize: '13px' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
          {getTabLabel(activeTab)}
        </span>
        {selectedTopic && (
          <>
            <span style={{ color: 'var(--border-color)', fontSize: '13px' }}>/</span>
            <span className="badge badge-blue">{selectedTopic}</span>
          </>
        )}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Search Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          style={{
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.4rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--text-muted)',
            fontSize: '13px',
            minWidth: '220px',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
          <Search size={15} color="var(--text-muted)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Global Search...</span>
          <span style={{
            fontSize: '10px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '1px 5px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}>
            <Command size={10} /> K
          </span>
        </button>

        {/* Upload Document Button */}
        <button className="btn-primary" onClick={onOpenUploadModal}>
          <Plus size={16} />
          <span>Ingest Document</span>
        </button>

        {/* Notifications */}
        <button style={{
          backgroundColor: 'var(--bg-base)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          position: 'relative',
        }}>
          <Bell size={17} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
          }} />
        </button>

        {/* User Profile Pill */}
        <button
          onClick={onOpenProfileModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '3px 10px 3px 4px',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '12px',
          }}>
            {initial}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {displayName}
          </span>
        </button>
      </div>
    </header>
  );
};
