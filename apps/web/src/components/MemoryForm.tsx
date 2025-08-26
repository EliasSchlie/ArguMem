import { useState } from 'react';

interface MemoryFormProps {
  onMemoryAdded: () => void;
}

export function MemoryForm({ onMemoryAdded }: MemoryFormProps) {
  const [content, setContent] = useState('');
  const [context, setContext] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !context.trim()) {
      setError('Content and context are required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          context,
          title: title.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add memory');
      }

      const result = await response.json();
      setMessage(`Memory added successfully! Source ID: ${result.source_id}`);

      // Clear form
      setContent('');
      setContext('');
      setTitle('');

      // Notify parent to refresh data
      onMemoryAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="memory-form">
      <h2>Add New Memory</h2>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the text content you want to store..."
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="context">Context *</label>
          <input
            id="context"
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., Research paper, Article, Book chapter..."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="title">Title (Optional)</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Optional title for this memory..."
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : 'Add Memory'}
        </button>
      </form>
    </div>
  );
}
