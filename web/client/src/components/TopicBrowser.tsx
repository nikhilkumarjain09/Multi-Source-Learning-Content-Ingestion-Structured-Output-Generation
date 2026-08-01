import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface TopicBrowserProps {
  onSelectTopic: (topic: string) => void;
  selectedTopic: string | null;
}

export const TopicBrowser: React.FC<TopicBrowserProps> = ({ onSelectTopic, selectedTopic }) => {
  const [topics, setTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/topics');
      const data = await response.json();
      if (data.topics) {
        setTopics(data.topics);
      }
    } catch (err) {
      console.error('Failed to fetch topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopics = topics.filter(t =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Browse Stored Topics
        </h3>
        {loading && <Loader2 size={14} className="spinner" color="var(--text-muted)" />}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border-color)',
        borderRadius: '6px',
        padding: '0.4rem 0.75rem',
        marginBottom: '1rem',
      }}>
        <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
        <input
          type="text"
          placeholder="Search topic name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            outline: 'none',
            width: '100%',
            fontSize: '13px',
          }}
        />
      </div>

      {filteredTopics.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {loading ? 'Loading topics...' : 'No matching topics found.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filteredTopics.map(topic => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => onSelectTopic(topic)}
                style={{
                  backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '16px',
                  fontSize: '13px',
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
