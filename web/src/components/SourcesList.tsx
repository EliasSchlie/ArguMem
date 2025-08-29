import { useState, useEffect } from 'react';
import axios from 'axios';

interface Source {
  id: number;
  timestamp: string;
  raw_text: string;
  context: string;
  title: string | null;
}

interface SourcesListProps {
  onNavigateToSource: (sourceId: number) => void;
}

const SourcesList: React.FC<SourcesListProps> = ({ onNavigateToSource }) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      const response = await axios.get<Source[]>(
        'http://localhost:8000/sources'
      );
      setSources(response.data);
      setError(null);
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch sources';
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="loading">Loading sources...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (sources.length === 0) {
    return (
      <div className="card text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
        <h3 style={{ marginBottom: '0.5rem' }}>No Sources Yet</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Add some memories to see your sources here!
        </p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {sources.map((source) => (
        <div
          key={source.id}
          className="item-card"
          style={{
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => onNavigateToSource(source.id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div className="item-title">
            📄 {source.title || `Source #${source.id}`}
            <span
              style={{
                color: 'var(--primary)',
                float: 'right',
                fontSize: '0.9rem',
              }}
            >
              Click to view details →
            </span>
          </div>
          <div className="item-meta">
            🆔 {source.id} • 📅 Created: {formatDate(source.timestamp)}
          </div>
          <div className="item-content">
            <strong>Content Preview:</strong>
            <div
              style={{
                background: 'var(--surface-hover)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                margin: '0.5rem 0 1rem 0',
                fontSize: '0.925rem',
                lineHeight: '1.5',
              }}
            >
              {truncateText(source.raw_text)}
            </div>
            <strong>Context:</strong>
            <p>{truncateText(source.context)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SourcesList;
