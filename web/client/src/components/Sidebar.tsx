import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Network,
  Layers,
  BookOpen,
  Route,
  FileCode2,
  Sparkles,
  Grid,
  BarChart3,
  Download,
  Settings,
} from 'lucide-react';
import { BrandLogo } from './branding/BrandLogo';
import { BrandName } from './branding/BrandName';

export type NavTab =
  | 'dashboard'
  | 'documents'
  | 'queue'
  | 'graph'
  | 'concepts'
  | 'flashcards'
  | 'learning-paths'
  | 'summaries'
  | 'ai-insights'
  | 'topics'
  | 'analytics'
  | 'exports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  documentCount?: number;
  conceptCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  documentCount = 0,
  conceptCount = 0,
}) => {
  const sections = [
    {
      group: 'WORKSPACE',
      items: [
        { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'documents' as NavTab, label: 'Documents', icon: FileText, badge: documentCount },
        { id: 'queue' as NavTab, label: 'Processing Queue', icon: Clock },
      ],
    },
    {
      group: 'KNOWLEDGE & AI',
      items: [
        { id: 'graph' as NavTab, label: 'Knowledge Graph', icon: Network },
        { id: 'concepts' as NavTab, label: 'Concepts Index', icon: Layers, badge: conceptCount },
        { id: 'flashcards' as NavTab, label: 'Flashcard Decks', icon: BookOpen },
        { id: 'learning-paths' as NavTab, label: 'Learning Paths', icon: Route },
        { id: 'summaries' as NavTab, label: 'Summary Engine', icon: FileCode2 },
        { id: 'ai-insights' as NavTab, label: 'AI Insights', icon: Sparkles, highlight: true },
      ],
    },
    {
      group: 'DISCOVERY & SYSTEM',
      items: [
        { id: 'topics' as NavTab, label: 'Topic Matrix', icon: Grid },
        { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
        { id: 'exports' as NavTab, label: 'Exports Hub', icon: Download },
        { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      userSelect: 'none',
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <BrandLogo size={34} />
        <div>
          <BrandName fontSize="15px" showBadge />
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
            AI Learning Workspace
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {sections.map((section) => (
          <div key={section.group}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.8px',
              padding: '0 0.5rem 0.4rem',
            }}>
              {section.group}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 450,
                      color: isActive
                        ? 'var(--accent)'
                        : item.highlight
                        ? 'var(--purple-accent)'
                        : 'var(--text-secondary)',
                      backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                      transition: 'all 0.15s ease',
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Icon
                        size={17}
                        color={
                          isActive
                            ? 'var(--accent)'
                            : item.highlight
                            ? 'var(--purple-accent)'
                            : 'var(--text-muted)'
                        }
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--border-color)',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        padding: '1px 6px',
                        borderRadius: '10px',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
          }} />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            MongoDB Online
          </span>
        </div>

        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>v2.4.0</span>
      </div>
    </aside>
  );
};
