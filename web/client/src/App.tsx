import React, { useState } from 'react';
import { UploadControl } from './components/UploadControl';
import { SummaryPanel } from './components/SummaryPanel';
import { FlashcardList } from './components/FlashcardList';
import { ConceptGraph } from './components/ConceptGraph';
import { LearningPathPanel, LearningPathData } from './components/LearningPathPanel';
import { TopicBrowser } from './components/TopicBrowser';
import { BookOpen } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [graphNodes, setGraphNodes] = useState<any[]>([]);
  const [graphEdges, setGraphEdges] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<LearningPathData | null>(null);

  const handleIngestSuccess = (data: any) => {
    setActiveTopic(null);
    setSummary(data.summary || '');
    setFlashcards(data.flashcards || []);
    setLearningPath(data.learningPath || null);
    if (data.graph) {
      setGraphNodes(data.graph.nodes || []);
      setGraphEdges(data.graph.edges || []);
    }
  };

  const handleSelectTopic = async (topic: string) => {
    setActiveTopic(topic);
    try {
      const response = await fetch(`/api/topics/${encodeURIComponent(topic)}`);
      const data = await response.json();
      if (response.ok) {
        setSummary(data.summary || '');
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
        }}>
          <BookOpen size={22} color="var(--accent)" />
          Learning Content Ingestion & Concept Graph
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '0.25rem' }}>
          Upload learning PDFs or plain-text transcripts to extract concepts, render knowledge graphs, and generate flashcards.
        </p>
      </header>

      <main>
        <UploadControl onIngestSuccess={handleIngestSuccess} />

        <TopicBrowser onSelectTopic={handleSelectTopic} selectedTopic={activeTopic} />

        <SummaryPanel summary={summary} />

        <ConceptGraph nodes={graphNodes} edges={graphEdges} flashcards={flashcards} />

        <LearningPathPanel learningPath={learningPath} />

        <FlashcardList flashcards={flashcards} topicName={activeTopic || 'Ingested'} />
      </main>
    </div>
  );
};

export default App;
