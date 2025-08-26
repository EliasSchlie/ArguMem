import { useState, useEffect } from 'react';

interface Quotation {
  id: number;
  quotation_text: string;
  locator: string | null;
  source_id: number;
  source_title: string | null;
  source_context: string;
}

export function QuotationsList() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await fetch('http://localhost:8000/quotations');
      if (!response.ok) {
        throw new Error('Failed to fetch quotations');
      }
      const data = await response.json();
      setQuotations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading quotations...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="quotations-list">
      <h2>💬 Extracted Quotations ({quotations.length})</h2>

      {quotations.length === 0 ? (
        <p>
          No quotations found. Add some memories to see extracted quotations!
        </p>
      ) : (
        quotations.map((quotation) => (
          <div key={quotation.id} className="quotation-item">
            <div className="quotation-text">"{quotation.quotation_text}"</div>

            <div className="quotation-meta">
              <span>
                Source:
                {quotation.source_title ? (
                  <strong> {quotation.source_title}</strong>
                ) : (
                  <span> ID {quotation.source_id}</span>
                )}
                {quotation.source_context && ` (${quotation.source_context})`}
              </span>

              {quotation.locator && <span>📍 {quotation.locator}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
