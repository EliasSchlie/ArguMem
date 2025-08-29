import { useState } from 'react';
import axios from 'axios';

interface MemoryFormProps {
  onMemoryAdded: () => void;
  apiKey: string | null;
  onNavigateToSource: (sourceId: number) => void;
}

interface MemoryRequest {
  content: string;
  context: string;
  title?: string;
}

interface Quotation {
  id: number;
  quotation_text: string;
  locator: string | null;
}

const MemoryForm: React.FC<MemoryFormProps> = ({
  onMemoryAdded,
  apiKey,
  onNavigateToSource,
}) => {
  const [formData, setFormData] = useState<MemoryRequest>({
    content: '',
    context: '',
    title: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [createdSourceId, setCreatedSourceId] = useState<number | null>(null);
  const [createdQuotations, setCreatedQuotations] = useState<Quotation[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setCreatedSourceId(null);
    setCreatedQuotations([]);

    try {
      const response = await axios.post(
        'http://localhost:8000/memories',
        {
          content: formData.content,
          context: formData.context,
          title: formData.title || undefined,
        },
        {
          headers: {
            'X-OpenAI-API-Key': apiKey || '',
          },
        }
      );

      const sourceId = response.data.source_id;
      setCreatedSourceId(sourceId);
      setMessage({ type: 'success', text: response.data.message });

      // Fetch the quotations for the created source
      try {
        const quotationsResponse = await axios.get<Quotation[]>(
          `http://localhost:8000/sources/${sourceId}/quotations`
        );
        setCreatedQuotations(quotationsResponse.data);
      } catch (quotationsError) {
        console.error('Failed to fetch quotations:', quotationsError);
      }

      setFormData({ content: '', context: '', title: '' });
      onMemoryAdded();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to add memory',
      });
      setCreatedSourceId(null);
      setCreatedQuotations([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Create New Memory</h2>
      </div>

      {!apiKey && (
        <div className="error">
          ⚠️ OpenAI API key not configured. Click the 🔑 API Key Configuration
          button in the sidebar to set it up.
        </div>
      )}

      {message && (
        <div className={message.type === 'success' ? 'success' : 'error'}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title for this memory (optional)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Paste or type the text content you want to process and store as an argumentative memory..."
            required
            style={{ minHeight: '150px' }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="context">Context *</label>
          <textarea
            id="context"
            name="context"
            value={formData.context}
            onChange={handleChange}
            placeholder="Provide context about this content (e.g., source, author, purpose, domain, etc.)"
            required
            style={{ minHeight: '100px' }}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            isSubmitting || !formData.content || !formData.context || !apiKey
          }
        >
          {isSubmitting ? (
            <>
              <span>⏳</span>
              Processing Memory...
            </>
          ) : (
            <>
              <span>✨</span>
              Add Memory
            </>
          )}
        </button>
      </form>

      {/* Display created quotations after successful submission */}
      {createdSourceId && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">
            <h3 className="card-title">✨ Memory Created Successfully!</h3>
          </div>

          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>📄 Source created:</strong>{' '}
              <span
                style={{
                  cursor: 'pointer',
                  color: 'var(--primary)',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                }}
                onClick={() => onNavigateToSource(createdSourceId)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Source #{createdSourceId} (Click to view details)
              </span>
            </div>

            {createdQuotations.length > 0 && (
              <div>
                <strong>
                  💬 Quotations extracted ({createdQuotations.length}):
                </strong>
                <div style={{ marginTop: '0.5rem' }}>
                  {createdQuotations.map((quotation, index) => (
                    <div
                      key={quotation.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        margin: '0.5rem 0',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'var(--surface)',
                      }}
                      onClick={() => onNavigateToSource(createdSourceId)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.backgroundColor =
                          'var(--surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.backgroundColor =
                          'var(--surface)';
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong>Quotation #{quotation.id}</strong>
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
                      </div>
                      <div
                        style={{
                          fontStyle: 'italic',
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                        }}
                      >
                        "{quotation.quotation_text}"
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--surface-hover)',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  💡 Click on the source link or any quotation card above to
                  explore the detailed view with all extracted quotations and
                  their relationships.
                </div>
              </div>
            )}

            {createdQuotations.length === 0 && (
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: 'var(--surface-hover)',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                📝 No quotations were extracted from this memory. The content
                may not contain clear quotable segments.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryForm;
