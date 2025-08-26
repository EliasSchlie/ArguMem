import { useState, useEffect } from 'react';

interface Source {
  id: number;
  timestamp: string;
  raw_text: string;
  context: string;
  title: string | null;
}

export function SourcesList() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSource, setExpandedSource] = useState<number | null>(null);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('http://localhost:8000/sources');
      if (!response.ok) {
        throw new Error('Failed to fetch sources');
      }
      const data = await response.json();
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (sourceId: number) => {
    setExpandedSource(expandedSource === sourceId ? null : sourceId);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <div className="loading">Loading sources...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="sources-list">
      <h2>📚 Sources ({sources.length})</h2>

      {sources.length === 0 ? (
        <p>No sources found. Add some memories to get started!</p>
      ) : (
        sources.map((source) => (
          <div key={source.id} className="source-item">
            <div className="source-header">
              <span className="source-id">ID: {source.id}</span>
              <span className="source-timestamp">
                {formatTimestamp(source.timestamp)}
              </span>
            </div>

            {source.title && <h4 className="source-title">{source.title}</h4>}

            <div className="source-context">Context: {source.context}</div>

            <div className="source-content">
              {expandedSource === source.id ? (
                <div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{source.raw_text}</p>
                  <button
                    onClick={() => toggleExpand(source.id)}
                    style={{
                      marginTop: '10px',
                      padding: '5px 10px',
                      background: '#f0f0f0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Show Less
                  </button>
                </div>
              ) : (
                <div>
                  <p>
                    {source.raw_text.slice(0, 200)}
                    {source.raw_text.length > 200 && '...'}
                  </p>
                  {source.raw_text.length > 200 && (
                    <button
                      onClick={() => toggleExpand(source.id)}
                      style={{
                        marginTop: '10px',
                        padding: '5px 10px',
                        background: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Show More
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
