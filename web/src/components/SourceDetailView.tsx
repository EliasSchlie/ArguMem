import { useState, useEffect } from 'react';
import axios from 'axios';

interface Source {
  id: number;
  timestamp: string;
  raw_text: string;
  context: string;
  title: string | null;
}

interface Quotation {
  id: number;
  quotation_text: string;
  locator: string | null;
}

interface SourceDetailViewProps {
  sourceId: number;
  onNavigateToQuotation: (quotationId: number) => void;
  onBack: () => void;
}

const SourceDetailView: React.FC<SourceDetailViewProps> = ({
  sourceId,
  onNavigateToQuotation,
  onBack,
}) => {
  const [source, setSource] = useState<Source | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSourceData = async () => {
      try {
        setLoading(true);

        // Fetch source details and quotations in parallel
        const [sourceResponse, quotationsResponse] = await Promise.all([
          axios.get<Source>(`http://localhost:8000/sources/${sourceId}`),
          axios.get<Quotation[]>(
            `http://localhost:8000/sources/${sourceId}/quotations`
          ),
        ]);

        setSource(sourceResponse.data);
        setQuotations(quotationsResponse.data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch source data');
      } finally {
        setLoading(false);
      }
    };

    fetchSourceData();
  }, [sourceId]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading source details...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">Error: {error}</div>
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Sources
        </button>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="card">
        <div className="error">Source not found</div>
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Sources
        </button>
      </div>
    );
  }

  return (
    <div className="source-detail">
      <div className="navigation-header">
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Sources
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            📄 {source.title || `Source #${source.id}`}
          </h2>
          <div className="item-meta">
            🆔 {source.id} • 📅 Created: {formatDate(source.timestamp)}
          </div>
        </div>

        <div className="source-content">
          <div className="form-group">
            <strong>Context:</strong>
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
              {source.context}
            </div>
          </div>

          <div className="form-group">
            <strong>Full Content:</strong>
            <div
              style={{
                background: 'var(--surface-hover)',
                padding: '1rem',
                borderRadius: '0.5rem',
                margin: '0.5rem 0 1rem 0',
                fontSize: '0.925rem',
                lineHeight: '1.6',
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {source.raw_text}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            💬 Quotations from this Source ({quotations.length})
          </h3>
        </div>

        {quotations.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              No quotations extracted from this source yet.
            </p>
          </div>
        ) : (
          <div className="quotations-list">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="quotation-item"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => onNavigateToQuotation(quotation.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.backgroundColor =
                    'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="quotation-header">
                  <strong>💬 Quotation #{quotation.id}</strong>
                  {quotation.locator && (
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        marginLeft: '0.5rem',
                      }}
                    >
                      • {quotation.locator}
                    </span>
                  )}
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
                <div
                  style={{
                    fontStyle: 'italic',
                    marginTop: '0.5rem',
                    color: 'var(--text-primary)',
                  }}
                >
                  "{quotation.quotation_text}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SourceDetailView;
