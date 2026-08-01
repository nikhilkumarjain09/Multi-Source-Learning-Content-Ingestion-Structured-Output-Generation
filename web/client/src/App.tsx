import React, { useState, useEffect } from 'react';
import { BRANDING } from './config/branding';
import { BrandLoading } from './components/branding/BrandLoading';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthLayout } from './components/auth/AuthLayout';
import { UnifiedAuthContainer } from './components/auth/UnifiedAuthContainer';
import { LoginView } from './components/auth/LoginView';
import { SignupView } from './components/auth/SignupView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { ResetPasswordView } from './components/auth/ResetPasswordView';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { CommandPalette } from './components/CommandPalette';
import { UploadControl } from './components/UploadControl';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { ProcessingQueueView } from './components/ProcessingQueueView';
import { ConceptGraph } from './components/ConceptGraph';
import { ConceptsView } from './components/ConceptsView';
import { FlashcardsView } from './components/FlashcardsView';
import { SummariesView } from './components/SummariesView';
import { LearningPathsView } from './components/LearningPathsView';
import { AIInsightsView } from './components/AIInsightsView';
import { TopicsView } from './components/TopicsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ExportsView } from './components/ExportsView';
import { SettingsView } from './components/SettingsView';
import { LearningPathData } from './components/LearningPathPanel';
import { X } from 'lucide-react';

const WorkspaceApp: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>('login');
  const [resetToken, setResetToken] = useState<string>('');

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeProcessingFile, setActiveProcessingFile] = useState<string | null>(null);

  // Global Data State
  const [documents, setDocuments] = useState<any[]>([]);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);

  // Active View State
  const [summaryText, setSummaryText] = useState<string>('');
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);

  // Check URL parameters for Reset Password / Verification tokens
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (window.location.pathname.includes('/reset-password') || (token && !window.location.pathname.includes('/verify-email'))) {
      if (token) {
        setResetToken(token);
        setAuthPage('reset-password');
      }
    }
  }, []);

  const refreshData = async () => {
    try {
      const token = localStorage.getItem('cognitive_access_token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const [docsRes, conceptsRes, topicsRes, flashcardsRes, analyticsRes] = await Promise.all([
        fetch('/api/documents', { headers }),
        fetch('/api/concepts', { headers }),
        fetch('/api/topics', { headers }),
        fetch('/api/flashcards', { headers }),
        fetch('/api/analytics', { headers }),
      ]);

      if (docsRes.ok) setDocuments((await docsRes.json()).documents || []);
      if (conceptsRes.ok) setConcepts((await conceptsRes.json()).concepts || []);
      if (topicsRes.ok) setTopics((await topicsRes.json()).topics || []);
      if (flashcardsRes.ok) setFlashcards((await flashcardsRes.json()).flashcards || []);
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleIngestSuccess = (data: any) => {
    setIsUploadModalOpen(false);
    setIsProcessing(false);
    setActiveProcessingFile(null);
    setActiveTopic(data.filename || null);
    setSummaryText(data.summary || '');
    setFlashcards(data.flashcards || []);
    setLearningPath(data.learningPath || null);
    if (data.graph) {
      setGraphNodes(data.graph.nodes || []);
      setGraphEdges(data.graph.edges || []);
    }
    refreshData();
    setActiveTab('graph');
  };

  const handleSelectTopic = async (topic: string) => {
    setActiveTopic(topic);
    try {
      const token = localStorage.getItem('cognitive_access_token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`/api/topics/${encodeURIComponent(topic)}`, { headers });
      const data = await response.json();
      if (response.ok) {
        setSummaryText(data.summary || '');
        setFlashcards(data.flashcards || []);
        setLearningPath(data.learningPath || null);
        if (data.graph) {
          setGraphNodes(data.graph.nodes || []);
          setGraphEdges(data.graph.edges || []);
        }
      }
    } catch (err) {
      console.error(`Failed to fetch topic artifacts for ${topic}:`, err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      const token = localStorage.getItem('cognitive_access_token');
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE', headers });
      if (res.ok) {
        refreshData();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Dynamic Document Title update
  useEffect(() => {
    const tabTitles: Record<NavTab, string> = {
      dashboard: 'Dashboard',
      documents: 'Documents',
      queue: 'Processing Queue',
      graph: 'Knowledge Graph',
      concepts: 'Concepts Index',
      flashcards: 'Flashcards',
      'learning-paths': 'Learning Paths',
      summaries: 'Summary Engine',
      'ai-insights': 'AI Insights',
      topics: 'Topic Matrix',
      analytics: 'Analytics',
      exports: 'Exports Hub',
      settings: 'Settings',
    };

    if (isAuthenticated) {
      document.title = `${tabTitles[activeTab] || 'Workspace'} • ${BRANDING.APP_NAME}`;
    } else {
      document.title = BRANDING.APP_NAME;
    }
  }, [activeTab, isAuthenticated]);

  if (isLoading) {
    return <BrandLoading message="Authenticating your SynthLearn learning workspace..." />;
  }

  // Render Authentication Flow for Unauthenticated Guests inside Enterprise AuthLayout & Unified Container
  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <UnifiedAuthContainer initialPage={authPage} resetToken={resetToken} />
      </AuthLayout>
    );
  }

  // Render Authenticated SaaS Application Workspace
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documents.length}
        conceptCount={concepts.length}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)', display: 'flex', flexDirection: 'column' }}>
        {/* Top Header Bar */}
        <TopNavbar
          activeTab={activeTab}
          selectedTopic={activeTopic}
          user={user}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
        />

        {/* Dynamic View Tab Body */}
        <main style={{ flex: 1, padding: '1.5rem 2rem 3rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {activeTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              documents={documents}
              concepts={concepts}
              onNavigateTab={setActiveTab}
              onSelectTopic={(t) => {
                handleSelectTopic(t);
                setActiveTab('graph');
              }}
              onOpenUpload={() => setIsUploadModalOpen(true)}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView
              documents={documents}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {activeTab === 'queue' && (
            <ProcessingQueueView
              isProcessing={isProcessing}
              activeFilename={activeProcessingFile}
            />
          )}

          {activeTab === 'graph' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    AI Knowledge Graph Explorer
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    Interactive concept topology node network with prerequisite and relationship edges.
                  </p>
                </div>
              </div>
              <ConceptGraph nodes={graphNodes} edges={graphEdges} flashcards={flashcards} />
            </div>
          )}

          {activeTab === 'concepts' && (
            <ConceptsView
              concepts={concepts}
              onSelectTopic={handleSelectTopic}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              flashcards={flashcards}
              topicName={activeTopic}
            />
          )}

          {activeTab === 'learning-paths' && (
            <LearningPathsView
              learningPath={learningPath}
              topicName={activeTopic}
            />
          )}

          {activeTab === 'summaries' && (
            <SummariesView
              summaryText={summaryText}
              topicName={activeTopic}
            />
          )}

          {activeTab === 'ai-insights' && (
            <AIInsightsView
              onSelectTopic={handleSelectTopic}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'topics' && (
            <TopicsView
              topics={topics}
              onSelectTopic={handleSelectTopic}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'exports' && (
            <ExportsView
              flashcards={flashcards}
              concepts={concepts}
              summaryText={summaryText}
              topicName={activeTopic}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Global Command Palette Search Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onSelectTopic={handleSelectTopic}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '1.5rem', maxWidth: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Ingest Learning Document
              </h3>
              <button onClick={() => setIsUploadModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <UploadControl onIngestSuccess={handleIngestSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WorkspaceApp />
    </AuthProvider>
  );
};

export default App;
