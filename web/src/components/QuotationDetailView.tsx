import { useState, useEffect } from 'react';
import axios from 'axios';

interface QuotationDetail {
  id: number;
  quotation_text: string;
  locator: string | null;
  source_id: number;
  source_title: string | null;
  source_context: string;
  source_text: string;
  source_timestamp: string;
}

interface Proposition {
  id: number;
  proposition_text: string;
  paraphrase: string | null;
}

interface QuotationDetailViewProps {
  quotationId: number;
  onNavigateToSource: (sourceId: number) => void;
  onBack: () => void;
}

const QuotationDetailView: React.FC<QuotationDetailViewProps> = ({
  quotationId,
  onNavigateToSource,
  onBack,
}) => {
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setLoading(true);

        // Fetch quotation details and propositions in parallel
        const [quotationResponse, propositionsResponse] = await Promise.all([
          axios.get<QuotationDetail>(
            `http://localhost:8000/quotations/${quotationId}`
          ),
          axios.get<Proposition[]>(
            `http://localhost:8000/quotations/${quotationId}/propositions`
          ),
        ]);

        setQuotation(quotationResponse.data);
        setPropositions(propositionsResponse.data);
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.detail || 'Failed to fetch quotation data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationData();
  }, [quotationId]);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="loading">Loading quotation details...</div>;
  }

  if (error) {
    return (
      <div className="card">
        <div className="error">Error: {error}</div>
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Quotations
        </button>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="card">
        <div className="error">Quotation not found</div>
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Quotations
        </button>
      </div>
    );
  }

  return (
    <div className="quotation-detail">
      <div className="navigation-header">
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Quotations
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            💬 Quotation #{quotation.id}
            {quotation.locator && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>
                {' '}
                • {quotation.locator}
              </span>
            )}
          </h2>
        </div>

        <div className="quotation-content">
          <div
            style={{
              background: 'var(--surface-hover)',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              borderLeft: '4px solid var(--primary)',
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              fontStyle: 'italic',
              lineHeight: '1.6',
            }}
          >
            "{quotation.quotation_text}"
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📚 Source Information</h3>
        </div>

        <div
          className="source-info"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => onNavigateToSource(quotation.source_id)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.5rem',
            }}
          >
            <strong>
              📄 {quotation.source_title || `Source #${quotation.source_id}`}
            </strong>
            <span style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>
              Click to view source →
            </span>
          </div>

          <div className="item-meta" style={{ marginBottom: '1rem' }}>
            🆔 {quotation.source_id} • 📅{' '}
            {formatDate(quotation.source_timestamp)}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <strong>Context:</strong>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              {quotation.source_context}
            </p>
          </div>

          <div>
            <strong>Content Preview:</strong>
            <p
              style={{
                margin: '0.5rem 0',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
              }}
            >
              {truncateText(quotation.source_text)}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            🎯 Propositions from this Quotation ({propositions.length})
          </h3>
        </div>

        {propositions.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎯</div>
            <p style={{ color: 'var(--text-secondary)' }}>
              No propositions extracted from this quotation yet.
            </p>
          </div>
        ) : (
          <div className="propositions-list">
            {propositions.map((proposition, index) => (
              <div
                key={proposition.id}
                className="proposition-item"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div
                  className="proposition-header"
                  style={{ marginBottom: '0.5rem' }}
                >
                  <strong>🎯 Proposition #{proposition.id}</strong>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong>Text:</strong>
                  <div
                    style={{
                      margin: '0.5rem 0',
                      fontWeight: 'normal',
                      lineHeight: '1.5',
                    }}
                  >
                    {proposition.proposition_text}
                  </div>
                </div>

                {proposition.paraphrase && (
                  <div>
                    <strong>Paraphrase:</strong>
                    <div
                      style={{
                        margin: '0.5rem 0',
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.5',
                      }}
                    >
                      {proposition.paraphrase}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationDetailView;
