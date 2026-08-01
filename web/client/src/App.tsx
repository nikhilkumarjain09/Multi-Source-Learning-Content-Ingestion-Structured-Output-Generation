import React from 'react';
import { ConceptGraph } from './components/ConceptGraph';

export const App: React.FC = () => {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1>Multi-Source Learning Content Ingestion</h1>
      <p>Upload learning materials to extract concepts, graph relationships, and generate flashcards.</p>
      <ConceptGraph nodes={[]} edges={[]} />
    </div>
  );
};

export default App;
