import { useState, useEffect } from 'react';
import axios from 'axios';

interface Quotation {
  id: number;
  quotation_text: string;
  locator: string | null;
  source_id: number;
  source_title: string | null;
  source_context: string;
}

interface QuotationsListProps {
  onNavigateToQuotation: (quotationId: number) => void;
  onNavigateToSource: (sourceId: number) => void;
}

const QuotationsList: React.FC<QuotationsListProps> = ({
  onNavigateToQuotation,
  onNavigateToSource,
}) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = async () => {
    try {
      const response = await axios.get<Quotation[]>(
        'http://localhost:8000/quotations'
      );
      setQuotations(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="loading">Loading quotations...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (quotations.length === 0) {
    return (
      <div className="card text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
        <h3 style={{ marginBottom: '0.5rem' }}>No Quotations Yet</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Add some memories to extract quotations from your content!
        </p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {quotations.map((quotation) => (
        <div key={quotation.id} className="item-card">
          <div className="item-title">
            <span
              style={{ cursor: 'pointer', color: 'var(--primary)' }}
              onClick={() => onNavigateToQuotation(quotation.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              💬 Quotation #{quotation.id}
            </span>
            {quotation.locator && (
              <span style={{ color: 'var(--text-muted)' }}>
                {' '}
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
          <div className="item-meta">
            📚 From:{' '}
            <span
              style={{
                cursor: 'pointer',
                color: 'var(--primary)',
                textDecoration: 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                onNavigateToSource(quotation.source_id);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {quotation.source_title || `Source #${quotation.source_id}`}
            </span>
          </div>
          <div
            className="item-content"
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => onNavigateToQuotation(quotation.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div
              style={{
                background: 'var(--surface-hover)',
                padding: '1rem',
                borderRadius: '0.5rem',
                borderLeft: '4px solid var(--primary)',
                marginBottom: '1rem',
                fontStyle: 'italic',
              }}
            >
              "{quotation.quotation_text}"
            </div>
            <strong>Source Context:</strong>
            <p>{truncateText(quotation.source_context)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuotationsList;
